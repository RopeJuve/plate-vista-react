import QRCode from "qrcode";

/** The receipt's QR code (DSFinV-K `qrCodeData`) as an SVG image source, so it prints sharp at any size. */
export const qrCodeImageSrc = async (data: string) => {
  const svg = await QRCode.toString(data, { type: "svg", errorCorrectionLevel: "M", margin: 1 });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
