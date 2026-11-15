import { useEffect, useState } from "react";

/** Copies text to the clipboard; `copied` stays true for a moment so the button can say so. */
export const useCopyText = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = (text: string) => {
    if (!navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false)
    );
  };

  return { copied, copy };
};
