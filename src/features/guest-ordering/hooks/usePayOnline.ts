import { useCallback, useEffect, useRef, useState } from "react";
import { startOnlinePayment } from "../../payments/onlinePaymentApi";
import { useGuestAuth } from "../GuestAuthContext";
import { useGuestBill } from "../GuestBillProvider";
import { onlinePaymentStartProblem } from "../onlinePaymentStart";

/**
 * Sends the guest's browser to the page where they pay the whole bill online.
 * On a frozen bill the server answers with the same page again, so "Continue
 * to payment" uses this too. A second tap while one start is running does
 * nothing. A refusal is put into words in `message`; when the bill is no
 * longer payable online it is read again, so the button goes away.
 */
export const usePayOnline = () => {
  const { session } = useGuestAuth();
  const { recheckBill } = useGuestBill();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const starting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const sessionId = session?.sessionId;
  const token = session?.token;

  const start = useCallback(async () => {
    if (starting.current || !sessionId || !token) {
      return;
    }
    starting.current = true;
    setPending(true);
    setMessage("");
    try {
      const { url } = await startOnlinePayment(sessionId, token);
      // Stays pending: the browser is leaving for the payment page.
      window.location.assign(url);
    } catch (error) {
      starting.current = false;
      const problem = onlinePaymentStartProblem(error);
      if (problem.unavailable) {
        recheckBill();
      }
      if (mounted.current) {
        setMessage(problem.message);
        setPending(false);
      }
    }
  }, [recheckBill, sessionId, token]);

  return { start, pending, message };
};

export type PayOnline = ReturnType<typeof usePayOnline>;
