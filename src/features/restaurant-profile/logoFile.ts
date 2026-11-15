/** What the file picker offers; no SVG, which can carry script. */
export const LOGO_ACCEPT = ".png,.jpg,.jpeg,.webp";
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

const megabytes = (bytes: number) => `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;

/** Why a file cannot be the logo, or null when it can. */
export const logoFileProblem = (file: { type: string; size: number }, maxBytes: number) => {
  if (!LOGO_TYPES.includes(file.type)) {
    return "Use a PNG, JPG or WebP image";
  }
  if (file.size > maxBytes) {
    return `The logo must be ${megabytes(maxBytes)} or smaller`;
  }
  return null;
};
