import { useSyncExternalStore } from "react";

// One shared clock for every live timer on the page, so fifty chits cost one
// interval rather than fifty.
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};

export const useNow = () => useSyncExternalStore(subscribe, () => now, () => now);

/** Elapsed time as m:ss under an hour, h:mm:ss above it. */
export const formatElapsed = (fromIso: string, at: number) => {
  const seconds = Math.max(0, Math.floor((at - new Date(fromIso).getTime()) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export const minutesSince = (fromIso: string, at: number) =>
  Math.max(0, (at - new Date(fromIso).getTime()) / 60000);
