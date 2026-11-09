# Role

You write the pull request description for issue #{{ISSUE_NUMBER}}, which another agent implemented on branch `{{SOURCE_BRANCH}}`. The code is finished, reviewed and verified. Nobody is watching. You do NOT change code.

# The issue

**{{ISSUE_TITLE}}**

{{ISSUE_BODY}}

# Verify results (already run)

{{VERIFY_REPORT}}

# Steps

1. Read `git log {{TARGET_BRANCH}}..HEAD --oneline` and `git diff {{TARGET_BRANCH}}...HEAD`.
2. Use the `pr` skill (`.claude/skills/pr/`) to write the body: **Summary**, **Evidence**, **Merge Danger**. For UI changes, the Summary is usually a component-tree diff.
3. **Evidence — tests:** run the specific test(s) this branch added or changed (`npx vitest run <file>`) and quote the passing output. Don't invent output you didn't see.
4. **Evidence — screenshots. Required whenever the diff changes a `.tsx` file under `src/`** (components, pages, features). Skip only when no `.tsx` under `src/` changed, and then say so in one line. Expect this to take several minutes; that's normal, it's the most useful part of the PR for a human reviewer.
   - Start the mock API and the app (the same setup as `playwright.config.ts`), in the background:
     ```sh
     node e2e/mock-server.mjs &
     VITE_DEVELOPMENT_URL=http://127.0.0.1:5099/api/v1 VITE_DEVELOPMENT_WS_URL=ws://127.0.0.1:5099/ws VITE_PLATE_VISTA_URL=http://127.0.0.1:4173 \
       npm run dev -- --host 127.0.0.1 --port 4173 --strictPort &
     ```
   - Write a throwaway script at `.afk-evidence/shoot.mjs` (that folder is git-ignored) using `import { chromium } from "@playwright/test"`. Reach the changed screen the way the closest spec in `e2e/` does (registering, logging in, seeding through the mock API), then wait until the screen has really rendered before `page.screenshot({ path: ".afk-evidence/after-<what>.png" })`: `await page.waitForLoadState("networkidle")` and wait for an element of the changed UI (e.g. `await page.getByRole("heading", { name: "…" }).waitFor()`). The app shows a LOADING splash first; a screenshot of that is useless. Use a 1280×800 viewport; add a 390×844 shot too if the change affects mobile layout.
   - **Before** shots are optional — take one only when the contrast makes the point: `git worktree add /tmp/afk-base {{TARGET_BRANCH}}`, `ln -s "$PWD/node_modules" /tmp/afk-base/node_modules`, run that app on port 4174 against the same mock API, and save `.afk-evidence/before-<what>.png`.
   - At most 6 images. Look at each one yourself before using it. Stop the servers you started when done.
   - Reference each image in the body as `![after: board with new badge](afk-evidence:after-board.png)`. The orchestrator uploads the files and swaps in real links. Only reference files you actually saved.
   - Take a 390×844 shot too whenever the change touches layout that phones see (footers, sheets, dialogs, toolbars), or whenever you'd otherwise write "not checked on a phone" in Merge Danger.
   - Screenshots may be left out only after a real attempt fails. Then write in Evidence the exact command and error you hit, not just "no screenshots".

# Hard rules

- Do NOT edit, create or delete tracked files, and do NOT commit. Only write inside `.afk-evidence/`. Anything else you change is thrown away.
- Do NOT `git push` or use `gh`.
- Don't add a `Closes #…` line, a Verification section or a Review section: the orchestrator adds those.

# Output

Output the body, in Markdown, inside these tags and nothing else inside them:

<pr_body>
## Summary
…
</pr_body>
