import { useCallback, useEffect, useRef, useState } from "react";
import type { CardReaderPayment, TestCard } from "../../../shared/api/payments";
import {
  cancelCardReaderProblem,
  cardReaderProblem,
  retryProblem,
  type CardReaderProblem,
} from "../cardReaderProblem";
import {
  cancelCardReaderPayment,
  presentTestCard,
  retryCardReaderPayment,
  startCardReaderPayment,
} from "../paymentsApi";

/**
 * Starting a bill's card reader payment, retrying a failed one on the same reader, cancelling it and,
 * on a Simulated Reader, presenting a test card (approved or declined).
 * `onStarted` hears the attempt the server answered with, `onCancelled` that the cancel went through;
 * `reload` reads the bill again when an answer says the bill on screen is out of date. What happens
 * next arrives as events. A second tap while a request is running sends nothing.
 */
export const useCardReaderPayment = (
  sessionId: string,
  onStarted: (payment: CardReaderPayment) => void,
  reload: () => unknown,
  onCancelled: () => void = () => undefined
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

  const run = async <T>(
    send: () => Promise<T>,
    onDone: (answer: T) => void,
    problemOf: (error: unknown) => CardReaderProblem = cardReaderProblem
  ) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setPending(true);
    setProblem(null);
    try {
      const answer = await send();
      if (mounted.current) {
        onDone(answer);
      }
    } catch (error) {
      const next = problemOf(error);
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
    run(() => startCardReaderPayment(sessionId, { readerId, expectedTotalCents }), onStarted);

  const retry = (expectedTotalCents: number) =>
    run(() => retryCardReaderPayment(sessionId, expectedTotalCents), onStarted, retryProblem);

  const presentCard = (card: TestCard) => run(() => presentTestCard(sessionId, card), onStarted);

  const cancel = () => run(() => cancelCardReaderPayment(sessionId), onCancelled, cancelCardReaderProblem);

  const clearProblem = useCallback(() => setProblem(null), []);

  return { pending, problem, start, retry, presentCard, cancel, clearProblem };
};
