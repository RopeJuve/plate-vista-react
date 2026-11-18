import { Header } from "../Components/AdminComponents";
import { useAuth } from "../contexts/AuthContext";
import PayoutAccountSection from "../features/kasse/PayoutAccountSection";
import LateRefundsSection from "../features/kasse/LateRefundsSection";
import LegalDetailsForm from "../features/kasse/LegalDetailsForm";
import TseSection from "../features/kasse/TseSection";
import { useLegalDetails } from "../features/kasse/hooks/useLegalDetails";
import { isOwner } from "../shared/auth/roles";
import { cn } from "@/lib/utils";

/** Till & payments: what the restaurant needs on file before it can take payments with signed receipts. */
const Kasse = () => {
  const { details, loading, complete, save } = useLegalDetails();
  const { user } = useAuth();

  return (
    <div>
      <Header title="Till & payments" description="Legal details for receipts and the TSE that signs every payment." />
      <section
        id="legal-details"
        aria-labelledby="legal-details-title"
        className="scroll-mt-4 max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6"
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
      <div className="mt-6">
        <TseSection legalComplete={!loading && complete} />
      </div>
      {isOwner(user) && (
        <div className="mt-6">
          <PayoutAccountSection />
        </div>
      )}
      <div className="mt-6">
        <LateRefundsSection />
      </div>
    </div>
  );
};

export default Kasse;
