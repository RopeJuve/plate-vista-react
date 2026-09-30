/** Wall-clock time of day, as printed on a check: "14:05". */
export const clockTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
