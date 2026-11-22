import ReceiptSection from "./ReceiptSection";

const BLANKS = ["Bewirtete Personen", "Anlass der Bewirtung", "Ort, Datum", "Unterschrift"];

/**
 * The Hospitality Section: blank lines a business guest fills in by hand after printing,
 * to deduct the meal. Folded away on screen until opened; always printed.
 */
const ReceiptHospitality = () => (
  <ReceiptSection title="Bewirtungsinformationen" defaultOpen={false}>
    <div className="space-y-4 text-xs">
      {BLANKS.map((label) => (
        <div key={label} className="space-y-1">
          <p className="text-ink-soft">{label}</p>
          <div className="h-6 border-b border-ink-soft" aria-hidden="true" />
        </div>
      ))}
      <p className="text-ink-soft">Zum Ausfüllen den Beleg drucken oder als PDF speichern.</p>
    </div>
  </ReceiptSection>
);

export default ReceiptHospitality;
