/**
 * The Kasse page tells the admin nav when its failed-signature count changes,
 * so the nav badge follows a retry without fetching `GET /tse` again.
 */
const EVENT = "plate-vista:failed-signatures";

export const announceFailedSignatures = (count: number) => {
  window.dispatchEvent(new CustomEvent<number>(EVENT, { detail: count }));
};

export const onFailedSignatures = (listener: (count: number) => void) => {
  const handle = (event: Event) => listener((event as CustomEvent<number>).detail);
  window.addEventListener(EVENT, handle);
  return () => window.removeEventListener(EVENT, handle);
};
