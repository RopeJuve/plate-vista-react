import { useEffect } from "react";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { usePaymentReturn } from "../../features/guest-ordering/hooks/usePaymentReturn";
import { clearGuestStorage } from "../../features/guest-ordering/guestSession";
import { ThankYou } from "../../features/guest-ordering/ThankYou";
import { usePublicProfile } from "../../features/restaurant-profile/hooks/usePublicProfile";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import ConfirmingPayment from "./ConfirmingPayment";
import GuestMenu from "./GuestMenu";

/** A guest's visit while the table is open, confirming an online payment they came back from, and the thank-you once staff close it. */
const GuestSessionShell = ({ sessionId, qrCode, slug }: { sessionId: string; qrCode: string; slug: string }) => {
  const profile = usePublicProfile(slug);
  const { closed } = useGuestBill();
  const { sessionEnded, disconnect } = useRealtime();
  const paymentReturn = usePaymentReturn(sessionId);
  const ended = closed || sessionEnded;

  useEffect(() => {
    if (!ended) {
      return;
    }
    clearGuestStorage(sessionId, qrCode);
    disconnect();
  }, [disconnect, ended, qrCode, sessionId]);

  if (ended) {
    return <ThankYou sessionId={sessionId} profile={profile} />;
  }
  if (paymentReturn.stage === "CONFIRMING" || paymentReturn.stage === "TIMED_OUT") {
    return <ConfirmingPayment timedOut={paymentReturn.stage === "TIMED_OUT"} onCheckAgain={paymentReturn.checkAgain} />;
  }
  return <GuestMenu profile={profile} paymentNotCompleted={paymentReturn.stage === "NOT_COMPLETED"} />;
};

export default GuestSessionShell;
