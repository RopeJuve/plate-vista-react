import { useCallback, useState } from "react";

/** idle: nothing tried yet · copied: the URL is on the clipboard · manual: the guest has to copy it themselves. */
export type CopyLinkState = "idle" | "copied" | "manual";

/** Copies `url` with the Clipboard API; when there is none, or it refuses, falls back to `manual`. */
export const useCopyLink = (url: string) => {
  const [state, setState] = useState<CopyLinkState>("idle");

  const copy = useCallback(async () => {
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
    if (!clipboard?.writeText) {
      setState("manual");
      return;
    }
    try {
      await clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("manual");
    }
  }, [url]);

  return { state, copy };
};
