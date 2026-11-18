import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { receiptPath } from "../../payments/billPayment";
import { cancelOnlinePayment, fetchReceiptToken, type ReceiptTokenAnswer } from "../../payments/onlinePaymentApi";
import { useGuestAuth } from "../GuestAuthContext";
import { useGuestBill } from "../GuestBillProvider";
import {
  cancelPaymentProblem,
  CONFIRM_POLL_MS,
  CONFIRM_WAIT_MS,
  paymentArrival,
  withoutPaymentParam,
} from "../paymentReturn";

/**
 * `CONFIRMING`: waiting to hear the online payment went through. `TIMED_OUT`: no word
 * within a minute. `NOT_COMPLETED`: it didn't go through and the bill is open again.
 */
export type PaymentReturnStage = "IDLE" | "CONFIRMING" | "TIMED_OUT" | "NOT_COMPLETED";

/**
 * Handles the guest coming back from the payment page. `?payment=return` waits for the
 * payment: `bill.paid` (in `GuestBillProvider`) or a receipt token moves to the receipt,
 * and the receipt token is asked for every 2 s for up to a minute. `?payment=cancelled`
 * unfreezes the bill once, or waits for the payment if it is already going through.
 * The parameter is removed at once, so a reload or a remount never repeats it.
 * Nothing here marks the bill paid; only the server's answer does.
 */
export const usePaymentReturn = (sessionId: string) => {
  const { session } = useGuestAuth();
  const { recheckBill } = useGuestBill();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  /** Read once: the parameter is gone after the first effect. */
  const [arrival] = useState(() => paymentArrival(searchParams));
  const [stage, setStage] = useState<PaymentReturnStage>(arrival === "RETURN" ? "CONFIRMING" : "IDLE");
  const [round, setRound] = useState(0);
  const handled = useRef(false);
  const token = session?.token;

  useEffect(() => {
    if (!arrival || handled.current || !token) {
      return;
    }
    handled.current = true;
    setSearchParams(withoutPaymentParam, { replace: true });
    if (arrival !== "CANCELLED") {
      return;
    }
    let mounted = true;
    cancelOnlinePayment(sessionId, token).then(recheckBill, (error) => {
      if (mounted && cancelPaymentProblem(error) === "PAYING_ONLINE") {
        setStage("CONFIRMING");
      }
    });
    return () => {
      mounted = false;
    };
  }, [arrival, recheckBill, sessionId, setSearchParams, token]);

  useEffect(() => {
    if (stage !== "CONFIRMING" || !token) {
      return;
    }
    let stopped = false;
    let asking = false;
    const stop = () => {
      stopped = true;
      clearInterval(poll);
      clearTimeout(deadline);
    };
    const settle = (answer: ReceiptTokenAnswer) => {
      if (answer.state === "PAID") {
        stop();
        navigate(receiptPath(answer.receiptToken));
      } else if (answer.state === "NOT_PAID") {
        stop();
        setStage("NOT_COMPLETED");
        recheckBill();
      }
    };
    const check = () => {
      if (asking) {
        return;
      }
      asking = true;
      fetchReceiptToken(sessionId, token)
        .then((answer) => {
          if (!stopped) {
            settle(answer);
          }
        })
        // No answer is not an answer: keep asking.
        .catch(() => undefined)
        .finally(() => {
          asking = false;
        });
    };
    const deadline = setTimeout(() => {
      stop();
      setStage("TIMED_OUT");
    }, CONFIRM_WAIT_MS);
    const poll = setInterval(check, CONFIRM_POLL_MS);
    check();
    return stop;
  }, [navigate, recheckBill, round, sessionId, stage, token]);

  /** One more check right away, and another minute of waiting. */
  const checkAgain = useCallback(() => {
    setStage("CONFIRMING");
    setRound((current) => current + 1);
  }, []);

  return { stage, checkAgain };
};
