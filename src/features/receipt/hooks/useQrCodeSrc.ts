import { useEffect, useState } from "react";
import { qrCodeImageSrc } from "../receiptQrCode";

/** The image source for a QR code of `data`; `null` until it is drawn, or if it cannot be. */
export const useQrCodeSrc = (data: string | undefined) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(null);
    if (!data) {
      return;
    }
    let cancelled = false;
    qrCodeImageSrc(data)
      .then((next) => {
        if (!cancelled) {
          setSrc(next);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [data]);

  return src;
};
