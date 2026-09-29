import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Chit, Wordmark } from "../../Components/rail";
import { normalizeJoinCode } from "./guestSession";

/**
 * Shown when the scanned table is already open: a friend at the table (or the
 * waiter, from the staff board) has the 4-character code.
 */
export const JoinCodeForm = ({
  wrongCode,
  pending,
  onSubmit,
}: {
  wrongCode: boolean;
  pending: boolean;
  onSubmit: (code: string) => void;
}) => {
  const [code, setCode] = useState("");
  const complete = code.length === 4;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (complete && !pending) {
      onSubmit(code);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-12 text-ink">
      <Wordmark className="mb-8 text-ink" />
      <Chit lift="paper" className="w-full max-w-sm" innerClassName="bg-white px-6 pb-6 pt-8">
        <form onSubmit={handleSubmit} className="text-center">
          <h1 className="text-3xl font-black tracking-[-0.03em]">This table is open</h1>
          <p className="mt-2 text-ink-soft">Enter the code from your table or ask your waiter.</p>
          <div className="perf my-5" />
          <label htmlFor="join-code" className="sr-only">
            Table code
          </label>
          <input
            id="join-code"
            name="joinCode"
            value={code}
            onChange={(event) => setCode(normalizeJoinCode(event.target.value))}
            maxLength={4}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            autoFocus
            placeholder="K7QM"
            aria-invalid={wrongCode}
            aria-describedby={wrongCode ? "join-code-error" : undefined}
            className="h-16 w-full rounded-md border border-ink/15 bg-paper text-center font-mono text-3xl font-bold uppercase tracking-[0.4em] text-ink outline-none placeholder:text-ink/20 focus:border-signal focus:ring-[3px] focus:ring-signal/20 aria-[invalid=true]:border-alert"
          />
          {wrongCode && (
            <p id="join-code-error" className="mt-2 text-sm font-semibold text-alert-ink" role="alert">
              That code doesn’t match. Check it and try again.
            </p>
          )}
          <button
            type="submit"
            disabled={!complete || pending}
            className="mt-5 h-12 w-full rounded-md bg-ink font-semibold text-paper transition-colors hover:bg-ink/85 disabled:opacity-40"
          >
            {pending ? "Joining…" : "Join table"}
          </button>
        </form>
      </Chit>
    </div>
  );
};

/** The first guest sees the code big, so they can read it out to friends. */
export const JoinCodeBanner = ({ code, onDismiss }: { code: string; onDismiss: () => void }) => (
  <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6" role="status">
    <div className="flex items-center gap-4 rounded-lg bg-ink px-4 py-3 text-paper">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-paper/75">Friends joining? Give them this code</p>
        <p className="font-mono text-3xl font-bold tracking-[0.3em]" aria-label={`Table code ${code.split("").join(" ")}`}>
          {code}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-paper/70 hover:bg-white/10 hover:text-paper"
        aria-label="Hide table code"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
);
