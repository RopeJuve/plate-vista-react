import { useCallback, useEffect, useRef, useState } from "react";
import type { CardReaderPayment } from "../../../shared/api/payments";
import { cardReaderProblem } from "../cardReaderPayment";
import { presentTestCard, startCardReaderPayment } from "../paymentsApi";

/**
 * Starting a bill's card reader payment and, on a Simulated Reader, presenting a test card.
 * `onStarted` hears the attempt the server answered with; `reload` reads the bill again when
 * an answer says the bill on screen is out of date. What happens next arrives as events.
 * A second tap while a request is running sends nothing.
 */
export const useCardReaderPayment = (
  sessionId: string,
  onStarted: (payment: CardReaderPayment) => void,
  reload: () => unknown
) => {
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = async (send: () => Promise<CardReaderPayment>) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setPending(true);
    setProblem(null);
    try {
      const payment = await send();
      if (mounted.current) {
        onStarted(payment);
      }
    } catch (error) {
      const next = cardReaderProblem(error);
      if (mounted.current) {
        setProblem(next.message);
      }
      if (next.reloadsBill) {
        await reload();
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setPending(false);
      }
    }
  };

  const start = (readerId: string, expectedTotalCents: number) =>
    run(() => startCardReaderPayment(sessionId, { readerId, expectedTotalCents }));

  const approveTestCard = () => run(() => presentTestCard(sessionId, "APPROVED"));

  const clearProblem = useCallback(() => setProblem(null), []);

  return { pending, problem, start, approveTestCard, clearProblem };
};
