import { useRef } from "react";
import { usePayoutAccount } from "./hooks/usePayoutAccount";
import { usePayoutReturn } from "./hooks/usePayoutReturn";
import { payoutAccountStage } from "./payoutAccountStage";
import OnlinePaymentsSwitch from "./OnlinePaymentsSwitch";
import PayoutSetupPanel from "./PayoutSetupPanel";
import { Button } from "@/components/ui/button";

/** Online payments: the owner's Payout Account at Stripe and the switch that lets guests pay online. */
const PayoutAccountSection = () => {
  const payout = usePayoutAccount();
  const { account, loading, starting, startSetup } = payout;
  const section = useRef<HTMLElement>(null);
  usePayoutReturn({ section, loading, startSetup });

  const body = () => {
    if (payout.unavailable) {
      return <p className="text-sm text-ink-soft">{"Online payments aren't available on this server yet."}</p>;
    }
    if (loading && !account && !starting) {
      return <p className="text-sm text-ink-soft">Loading…</p>;
    }
    if (payout.loadFailed && !starting) {
      return (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-red-700">
            Could not load the online payments status.
          </p>
          <Button type="button" variant="outline" onClick={payout.reload} className="w-full sm:w-auto">
            Reload
          </Button>
        </div>
      );
    }
    // A fresh Stripe link may be on its way before the status has loaded: that only happens mid-setup.
    const stage = account ? payoutAccountStage(account) : "UNFINISHED";
    if (stage === "NOT_CONNECTED" || stage === "UNFINISHED") {
      return (
        <PayoutSetupPanel
          started={stage === "UNFINISHED"}
          starting={starting}
          failed={payout.startFailed}
          onStart={startSetup}
        />
      );
    }
    if (stage === "UNDER_REVIEW") {
      return (
        <div className="space-y-2">
          <p className="text-sm text-ink">
            Stripe is reviewing your details. This can take a few minutes up to a few days.
          </p>
          <Button type="button" variant="link" onClick={payout.reload} disabled={loading} className="h-auto p-0">
            Check again
          </Button>
        </div>
      );
    }
    return (
      <OnlinePaymentsSwitch
        enabled={Boolean(account?.onlinePaymentsEnabled)}
        saving={payout.switching}
        failedTo={payout.switchFailedTo}
        onChange={payout.switchOnlinePayments}
      />
    );
  };

  return (
    <section
      ref={section}
      id="online-payments"
      aria-labelledby="online-payments-title"
      className="scroll-mt-4 max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6"
    >
      <h2 id="online-payments-title" className="mb-4 text-lg font-bold text-ink">
        Online payments
      </h2>
      {body()}
    </section>
  );
};

export default PayoutAccountSection;
