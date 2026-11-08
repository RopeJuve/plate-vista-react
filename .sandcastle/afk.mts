/**
 * Sandcastle AFK orchestrator — portable, drop into any Node/TS repo.
 *
 * Flow:  fetch issues (label: ready-for-agent), drop those with an open "Blocked by: #n"
 *        → PLAN    (picks a safe, parallelizable subset)
 *        → IMPLEMENT (one Docker sandbox + branch per issue, TDD loop)
 *        → VERIFY  (typecheck / lint / test — real exit codes, not vibes)
 *        → FIX     (one retry if verify fails)
 *        → REVIEW  (second model reviews + fixes)
 *        → VERIFY  again
 *        → push branch + open PR ("Closes #N")  — never auto-merges
 *
 * Run:   npx tsx .sandcastle/afk.mts            (full run)
 *        AFK_DRY_RUN=1 npx tsx .sandcastle/afk.mts   (plan only, no changes)
 *        AFK_ISSUE=42 npx tsx .sandcastle/afk.mts    (skip planner, one issue)
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { createSandbox, run, claudeCode, Output } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { z } from "zod";

// ───────────────────────── config ─────────────────────────

type Config = {
  imageName: string;
  labels: { ready: string; inProgress: string; prOpen: string; needsHuman: string };
  models: { planner: string; implementer: string; reviewer: string };
  effort: "low" | "medium" | "high" | "xhigh" | "max";
  maxIssuesPerRun: number;
  maxParallel: number;
  implementIterations: number;
  installCommand: string | null;
  verifyCommands: string[] | null;
  copyToWorktree: string[];
};

const cfg: Config = JSON.parse(readFileSync(".sandcastle/config.json", "utf8"));
// GitHub Actions passes unset secrets/inputs as "" — treat those as absent.
for (const k of ["ANTHROPIC_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN", "GH_TOKEN", "AFK_ISSUE", "AFK_MAX_ISSUES", "AFK_DRY_RUN"])
  if (process.env[k] === "") delete process.env[k];
if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_CODE_OAUTH_TOKEN && !existsSync(".sandcastle/.env")) {
  console.error("Missing CLAUDE_CODE_OAUTH_TOKEN (or ANTHROPIC_API_KEY). Set it in .sandcastle/.env or as a CI secret.");
  process.exit(1);
}
// CLI flags (work on Windows too, where `VAR=1 cmd` doesn't): --dry-run  --issue=42  --max=2
const argv = process.argv.slice(2);
const flag = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DRY_RUN = process.env.AFK_DRY_RUN === "1" || argv.includes("--dry-run");

// Sandcastle only forwards vars listed in .sandcastle/.env — which doesn't exist in CI
// (it's git-ignored). So pass the Claude credentials to the agent explicitly.
const AGENT_ENV: Record<string, string> = {};
for (const k of ["CLAUDE_CODE_OAUTH_TOKEN", "ANTHROPIC_API_KEY"]) {
  const v = process.env[k]?.trim();
  if (v) AGENT_ENV[k] = v;
}
const agent = (model: string) => claudeCode(model, { effort: cfg.effort, env: AGENT_ENV });
const ISSUE_ARG = flag("issue") ?? process.env.AFK_ISSUE;
const ONLY_ISSUE = ISSUE_ARG ? Number(ISSUE_ARG) : null;
if (flag("max")) process.env.AFK_MAX_ISSUES = flag("max");
const MAX_ISSUES = Number(process.env.AFK_MAX_ISSUES || cfg.maxIssuesPerRun);
const LOG_DIR = ".sandcastle/logs";
mkdirSync(LOG_DIR, { recursive: true });

// ───────────────────────── helpers ─────────────────────────

const GH_TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? tryCmd("gh", ["auth", "token"]);
const hostEnv = { ...process.env, ...(GH_TOKEN ? { GH_TOKEN } : {}) };

function cmd(bin: string, args: string[]): string {
  return execFileSync(bin, args, { encoding: "utf8", env: hostEnv, stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function tryCmd(bin: string, args: string[]): string | undefined {
  try {
    return execFileSync(bin, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || undefined;
  } catch {
    return undefined;
  }
}
const log = (...a: unknown[]) => console.log(`[afk ${new Date().toISOString().slice(11, 19)}]`, ...a);
const tail = (s: string, n = 4000) => (s.length > n ? "…" + s.slice(-n) : s);

function gh(args: string[]): string {
  return cmd("gh", args);
}
function setLabels(issue: number, add: string[], remove: string[]) {
  const args = ["issue", "edit", String(issue)];
  for (const l of add) args.push("--add-label", l);
  for (const l of remove) args.push("--remove-label", l);
  try {
    gh(args);
  } catch (e) {
    log(`warn: label update failed for #${issue}`, (e as Error).message);
  }
}
function comment(issue: number, body: string) {
  try {
    gh(["issue", "comment", String(issue), "--body", body]);
  } catch (e) {
    log(`warn: comment failed for #${issue}`, (e as Error).message);
  }
}

// ───────────────────────── project detection ─────────────────────────

function detectRunner(): { install: string; run: (script: string) => string } {
  if (existsSync("pnpm-lock.yaml"))
    return { install: "npx --yes pnpm install --frozen-lockfile", run: (s) => `npx --yes pnpm run ${s}` };
  if (existsSync("yarn.lock"))
    return { install: "npx --yes yarn install --frozen-lockfile", run: (s) => `npx --yes yarn run ${s}` };
  if (existsSync("package-lock.json")) return { install: "npm ci", run: (s) => `npm run ${s}` };
  return { install: "npm install", run: (s) => `npm run ${s}` };
}

function detectVerify(runScript: (s: string) => string): string[] {
  if (cfg.verifyCommands) return cfg.verifyCommands;
  if (!existsSync("package.json")) return [];
  const scripts: Record<string, string> = JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {};
  const out: string[] = [];
  for (const s of ["typecheck", "type-check", "tsc"]) if (scripts[s]) { out.push(runScript(s)); break; }
  if (scripts.lint) out.push(runScript("lint"));
  if (scripts.test && !/no test specified/.test(scripts.test)) out.push(`CI=true ${runScript("test")}`);
  return out;
}

const runner = detectRunner();
const INSTALL = cfg.installCommand ?? runner.install;
const VERIFY = detectVerify(runner.run);
const BASE = cmd("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

// ───────────────────────── issues ─────────────────────────

type Issue = { number: number; title: string; body: string; labels: { name: string }[] };

function fetchIssues(): Issue[] {
  if (ONLY_ISSUE) {
    return [JSON.parse(gh(["issue", "view", String(ONLY_ISSUE), "--json", "number,title,body,labels"]))];
  }
  return JSON.parse(
    gh(["issue", "list", "--state", "open", "--label", cfg.labels.ready, "--json", "number,title,body,labels", "--limit", "50"]),
  );
}

// ───────────────────────── blockers ─────────────────────────

// Issues declare dependencies with a line like "Blocked by: #12, #14" (or
// "Blocked by: none"). An issue is startable only when every blocker is closed.
// Cross-repo references such as "owner/repo#21" are informational and ignored.
function parseBlockers(body: string): number[] {
  const line = body.match(/Blocked by:\s*([^\n·]*)/i);
  if (!line) return [];
  return [...line[1].matchAll(/(?<![\w/])#(\d+)/g)].map((m) => Number(m[1]));
}

const issueStates = new Map<number, string>();
function isOpen(n: number): boolean {
  if (!issueStates.has(n)) {
    try {
      issueStates.set(n, gh(["issue", "view", String(n), "--json", "state", "--jq", ".state"]));
    } catch {
      issueStates.set(n, "UNKNOWN"); // can't tell: treat as still blocking
    }
  }
  return issueStates.get(n) !== "CLOSED";
}

function openBlockers(issue: Issue): number[] {
  return parseBlockers(issue.body ?? "").filter(isOpen);
}

// ───────────────────────── phase: plan ─────────────────────────

const PlanSchema = z.object({
  selected: z.array(z.object({ number: z.number(), reason: z.string() })),
  skipped: z.array(z.object({ number: z.number(), reason: z.string(), needsHuman: z.boolean() })),
});
type Plan = z.infer<typeof PlanSchema>;

async function plan(issues: Issue[]): Promise<Plan> {
  if (ONLY_ISSUE || issues.length === 1) {
    return { selected: issues.map((i) => ({ number: i.number, reason: "single issue" })), skipped: [] };
  }
  const res = await run({
    name: "planner",
    agent: agent(cfg.models.planner),
    sandbox: docker({ imageName: cfg.imageName }),
    promptFile: ".sandcastle/prompts/plan.md",
    promptArgs: {
      ISSUES_JSON: JSON.stringify(issues.map(({ number, title, body }) => ({ number, title, body })), null, 2),
      MAX_ISSUES: String(MAX_ISSUES),
    },
    output: Output.object({ tag: "plan", schema: PlanSchema, maxRetries: 2 }),
    logging: { type: "file", path: `${LOG_DIR}/planner.log` },
  });
  const out = PlanSchema.parse(res.output);
  const valid = new Set(issues.map((i) => i.number));
  return {
    selected: out.selected.filter((s) => valid.has(s.number)).slice(0, MAX_ISSUES),
    skipped: out.skipped.filter((s) => valid.has(s.number)),
  };
}

// ───────────────────────── phase: implement → verify → review ─────────────────────────

type Sbx = Awaited<ReturnType<typeof createSandbox>>;

async function verify(sbx: Sbx): Promise<{ ok: boolean; report: string }> {
  if (VERIFY.length === 0) return { ok: true, report: "_No verify commands detected — unverified._" };
  const lines: string[] = [];
  for (const c of VERIFY) {
    const r = await sbx.exec(c);
    const ok = r.exitCode === 0;
    lines.push(`${ok ? "✅" : "❌"} \`${c}\``);
    if (!ok) return { ok: false, report: `${lines.join("\n")}\n\n\`\`\`\n${tail(r.stdout + "\n" + r.stderr)}\n\`\`\`` };
  }
  return { ok: true, report: lines.join("\n") };
}

type Outcome =
  | { status: "pr"; issue: number; url: string }
  | { status: "needs-human"; issue: number; reason: string }
  | { status: "error"; issue: number; reason: string };

async function work(issue: Issue): Promise<Outcome> {
  const n = issue.number;
  const branch = `agent/issue-${n}`;
  const logFile = (step: string) => ({ type: "file" as const, path: `${LOG_DIR}/issue-${n}-${step}.log` });
  const verifyList = VERIFY.length ? VERIFY.map((c) => `- \`${c}\``).join("\n") : "- (none detected — run whatever tests exist)";

  if (!DRY_RUN) setLabels(n, [cfg.labels.inProgress], [cfg.labels.ready]);
  log(`#${n} → sandbox on ${branch}`);

  const sbx = await createSandbox({
    branch,
    sandbox: docker({ imageName: cfg.imageName }),
    hooks: { sandbox: { onSandboxReady: [{ command: INSTALL, timeoutMs: 900_000 }] } },
    copyToWorktree: cfg.copyToWorktree.length ? cfg.copyToWorktree : undefined,
  });

  try {
    // 1. implement
    const impl = await sbx.run({
      name: `impl#${n}`,
      agent: agent(cfg.models.implementer),
      promptFile: ".sandcastle/prompts/implement.md",
      promptArgs: { ISSUE_NUMBER: String(n), ISSUE_TITLE: issue.title, ISSUE_BODY: issue.body || "(no description)", VERIFY_COMMANDS: verifyList },
      maxIterations: cfg.implementIterations,
      completionSignal: ["<promise>COMPLETE</promise>", "<promise>BLOCKED</promise>"],
      logging: logFile("implement"),
    });

    if (impl.completionSignal === "<promise>BLOCKED</promise>") {
      const reason = impl.stdout.match(/<blocked_reason>([\s\S]*?)<\/blocked_reason>/)?.[1]?.trim() ?? "Agent reported BLOCKED (see logs).";
      return { status: "needs-human", issue: n, reason };
    }

    // 2. verify (+ one fix attempt)
    let v = await verify(sbx);
    if (!v.ok) {
      log(`#${n} verify failed → fix attempt`);
      await sbx.run({
        name: `fix#${n}`,
        agent: agent(cfg.models.implementer),
        promptFile: ".sandcastle/prompts/fix.md",
        promptArgs: { ISSUE_NUMBER: String(n), FAILURES: v.report, VERIFY_COMMANDS: verifyList },
        maxIterations: 4,
        logging: logFile("fix"),
      });
      v = await verify(sbx);
      if (!v.ok) return { status: "needs-human", issue: n, reason: `Verification still failing after fix attempt:\n\n${v.report}` };
    }

    // 3. review (different model = second pair of eyes)
    let reviewSummary = "_(no summary)_";
    try {
      const rev = await sbx.run({
        name: `review#${n}`,
        agent: agent(cfg.models.reviewer),
        promptFile: ".sandcastle/prompts/review.md",
        promptArgs: { ISSUE_NUMBER: String(n), ISSUE_TITLE: issue.title, ISSUE_BODY: issue.body || "(no description)", VERIFY_COMMANDS: verifyList },
        logging: logFile("review"),
      });
      reviewSummary = rev.stdout.match(/<review_summary>([\s\S]*?)<\/review_summary>/)?.[1]?.trim() ?? reviewSummary;
    } catch (e) {
      log(`#${n} review step errored (continuing):`, (e as Error).message);
    }

    v = await verify(sbx);
    if (!v.ok) return { status: "needs-human", issue: n, reason: `Review changes broke verification:\n\n${v.report}` };

    // 4. anything to ship?
    const ahead = Number(cmd("git", ["rev-list", "--count", `${BASE}..${branch}`]));
    if (ahead === 0) return { status: "needs-human", issue: n, reason: "Agent finished without committing any changes." };

    if (DRY_RUN) return { status: "pr", issue: n, url: `(dry run — ${ahead} commits on ${branch})` };

    // 5. push + PR (host side — agent never gets a GitHub token)
    cmd("git", ["push", "--force-with-lease", "-u", "origin", branch]);
    const existing = gh(["pr", "list", "--head", branch, "--json", "url", "--jq", ".[0].url // empty"]);
    const url =
      existing ||
      gh([
        "pr", "create", "--base", BASE, "--head", branch,
        "--title", `${issue.title} (#${n})`,
        "--body", `Closes #${n}\n\n🤖 Implemented AFK by Sandcastle.\n\n## Verification\n${v.report}\n\n## Review\n${reviewSummary}`,
      ]);
    return { status: "pr", issue: n, url };
  } catch (e) {
    return { status: "error", issue: n, reason: (e as Error).message };
  } finally {
    const closed = await sbx.close().catch(() => undefined);
    if (closed?.preservedWorktreePath) log(`#${n} worktree preserved (uncommitted changes): ${closed.preservedWorktreePath}`);
  }
}

async function pool<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx]);
      }
    }),
  );
  return results;
}

// ───────────────────────── main ─────────────────────────

log(`base=${BASE} install="${INSTALL}" verify=${JSON.stringify(VERIFY)} dryRun=${DRY_RUN}`);
if (VERIFY.length === 0) log("warn: no typecheck/lint/test scripts found — agents have no backpressure. Set verifyCommands in config.json.");

const fetched = fetchIssues();
const issues = fetched.filter((issue) => {
  const waiting = openBlockers(issue);
  if (waiting.length === 0) return true;
  const list = waiting.map((n) => "#" + n).join(", ");
  if (ONLY_ISSUE) {
    log(`warn: #${issue.number} is blocked by open ${list}; running it anyway because it was named with --issue.`);
    return true;
  }
  log(`#${issue.number} waits for ${list}`);
  return false;
});
if (issues.length === 0) {
  log(
    fetched.length > 0
      ? `All ${fetched.length} "${cfg.labels.ready}" issue(s) are waiting for open blockers. Nothing to do.`
      : `No open issues labeled "${cfg.labels.ready}". Nothing to do.`,
  );
  process.exit(0);
}
log(`Found ${issues.length} issue(s): ${issues.map((i) => "#" + i.number).join(", ")}`);

const thePlan = await plan(issues);
log("Plan:", JSON.stringify(thePlan, null, 2));

for (const s of thePlan.skipped.filter((s) => s.needsHuman)) {
  if (DRY_RUN) continue;
  setLabels(s.number, [cfg.labels.needsHuman], [cfg.labels.ready]);
  comment(s.number, `🤖 Sandcastle skipped this issue — needs a human decision:\n\n> ${s.reason}\n\nAdd more detail and re-apply \`${cfg.labels.ready}\` when ready.`);
}

if (DRY_RUN && !process.env.AFK_DRY_RUN_IMPLEMENT) {
  log("Dry run: stopping after plan. (Set AFK_DRY_RUN_IMPLEMENT=1 to also implement locally without pushing.)");
  process.exit(0);
}

const byNumber = new Map(issues.map((i) => [i.number, i]));
const outcomes = await pool(
  thePlan.selected.map((s) => byNumber.get(s.number)!),
  cfg.maxParallel,
  work,
);

for (const o of outcomes) {
  if (o.status === "pr") {
    log(`✅ #${o.issue} → ${o.url}`);
    if (!DRY_RUN) setLabels(o.issue, [cfg.labels.prOpen], [cfg.labels.inProgress]);
  } else {
    log(`⚠️  #${o.issue} → ${o.status}: ${o.reason.split("\n")[0]}`);
    if (!DRY_RUN) {
      setLabels(o.issue, [cfg.labels.needsHuman], [cfg.labels.inProgress]);
      comment(o.issue, `🤖 Sandcastle could not finish this issue (${o.status}).\n\n${o.reason}\n\nLogs: see the workflow run artifacts (\`.sandcastle/logs/issue-${o.issue}-*.log\`).`);
    }
  }
}

const failed = outcomes.filter((o) => o.status === "error").length;
log(`Done. ${outcomes.filter((o) => o.status === "pr").length} PR(s), ${outcomes.filter((o) => o.status === "needs-human").length} need human, ${failed} error(s).`);
process.exit(failed > 0 ? 1 : 0);
