/** The part of `qrcode` (no bundled types) the app uses. */
declare module "qrcode" {
  type QRCodeToStringOptions = {
    type?: "svg" | "utf8" | "terminal";
    margin?: number;
    width?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    color?: { dark?: string; light?: string };
  };

  const QRCode: {
    toString(text: string, options?: QRCodeToStringOptions): Promise<string>;
  };

  export default QRCode;
}
