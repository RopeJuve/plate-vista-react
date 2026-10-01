import { useParams } from "react-router-dom";
import { CartProvider } from "../../contexts/CartContext";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import { GuestBillProvider } from "../../features/guest-ordering/GuestBillProvider";
import { useJoinTable } from "../../features/guest-ordering/hooks/useJoinTable";
import { JoinCodeForm } from "../../features/guest-ordering/JoinCode";
import { MenuProvider } from "../../features/guest-ordering/MenuProvider";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import Loading from "../../pages/Loading";
import GuestNotice from "./GuestNotice";
import GuestSessionShell from "./GuestSessionShell";

/** Where a guest lands after scanning a table's QR code: joins the table, then opens its menu. */
const Customer = () => {
  const { slug = "", qrCode = "" } = useParams();
  const { session } = useGuestAuth();
  const { fatalMessage } = useRealtime();
  const { joinState, error, join } = useJoinTable(slug, qrCode);

  if (fatalMessage || error) {
    return <GuestNotice message={fatalMessage || error} />;
  }

  if (joinState === "needsCode" || joinState === "wrongCode" || joinState === "joining") {
    return (
      <JoinCodeForm
        wrongCode={joinState === "wrongCode"}
        pending={joinState === "joining"}
        onSubmit={(code) => void join(code)}
      />
    );
  }

  if (joinState !== "joined" || !session?.sessionId) {
    return <Loading />;
  }

  return (
    <MenuProvider slug={slug}>
      <CartProvider sessionId={session.sessionId}>
        <GuestBillProvider sessionId={session.sessionId}>
          <GuestSessionShell sessionId={session.sessionId} qrCode={qrCode} />
        </GuestBillProvider>
      </CartProvider>
    </MenuProvider>
  );
};

export default Customer;
