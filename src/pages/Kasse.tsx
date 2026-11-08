import { Header } from "../Components/AdminComponents";
import LegalDetailsForm from "../features/kasse/LegalDetailsForm";
import { useLegalDetails } from "../features/kasse/hooks/useLegalDetails";
import { cn } from "@/lib/utils";

/** Till & payments: what the restaurant needs on file before it can take payments with signed receipts. */
const Kasse = () => {
  const { details, loading, complete, save } = useLegalDetails();

  return (
    <div>
      <Header title="Till & payments" description="Legal details for receipts and the TSE that signs every payment." />
      <section
        aria-labelledby="legal-details-title"
        className="max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="legal-details-title" className="text-lg font-bold text-ink">
            Legal details
          </h2>
          {!loading && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em]",
                complete ? "bg-pass/15 text-pass-ink" : "bg-ink/[0.06] text-ink-soft"
              )}
            >
              {complete ? "Complete" : "Incomplete"}
            </span>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <LegalDetailsForm details={details} onSave={save} />
        )}
      </section>
    </div>
  );
};

export default Kasse;
