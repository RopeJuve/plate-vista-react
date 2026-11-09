import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { guestAppBaseUrl } from "../../tables/guestLink";
import { receiptUrl } from "../billPayment";

/** The full receipt link and a QR code image of it, so a guest can scan the receipt off the staff screen. */
export const useReceiptQr = (receiptToken: string) => {
  const url = receiptUrl(guestAppBaseUrl() || window.location.origin, receiptToken);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    QRCode.toString(url, { type: "svg", margin: 1 })
      .then((svg) => {
        if (!cancelled) {
          setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { url, src };
};
