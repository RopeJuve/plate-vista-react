import { useEffect } from "react";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { clearGuestStorage } from "../../features/guest-ordering/guestSession";
import { ThankYou } from "../../features/guest-ordering/ThankYou";
import { usePublicProfile } from "../../features/restaurant-profile/hooks/usePublicProfile";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import GuestMenu from "./GuestMenu";

/** A guest's visit while the table is open, and the thank-you once staff close it. */
const GuestSessionShell = ({ sessionId, qrCode, slug }: { sessionId: string; qrCode: string; slug: string }) => {
  const profile = usePublicProfile(slug);
  const { closed } = useGuestBill();
  const { sessionEnded, disconnect } = useRealtime();
  const ended = closed || sessionEnded;

  useEffect(() => {
    if (!ended) {
      return;
    }
    clearGuestStorage(sessionId, qrCode);
    disconnect();
  }, [disconnect, ended, qrCode, sessionId]);

  return ended ? <ThankYou sessionId={sessionId} profile={profile} /> : <GuestMenu profile={profile} />;
};

export default GuestSessionShell;
