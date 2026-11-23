/** Why the last card reader payment ended unpaid, and why a card reader request did not go through. */
const CardReaderNotes = ({ endNote, problem }: { endNote: string | null; problem: string | null }) => (
  <>
    {endNote && (
      <p role="status" className="rounded-md bg-signal/10 px-3 py-2 text-sm font-semibold text-signal-ink">
        {endNote}
      </p>
    )}
    {problem && (
      <p role="alert" className="text-sm font-semibold text-alert-ink">
        {problem}
      </p>
    )}
  </>
);

export default CardReaderNotes;
