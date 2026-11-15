import { useState } from "react";
import { fetchLogoSignature, uploadLogo } from "../profileApi";
import { logoFileProblem } from "../logoFile";

const uploadMessage = (error: unknown) => {
  const status = (error as { response?: { status?: number } }).response?.status;
  if (status === 503) {
    return "Logo uploads are not set up yet.";
  }
  return error instanceof Error && error.message ? error.message : "The logo could not be uploaded";
};

/** Uploads one logo file; resolves to its URL, or null after showing why it failed. */
export const useLogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File): Promise<string | null> => {
    setError("");
    setUploading(true);
    try {
      const signature = await fetchLogoSignature();
      const problem = logoFileProblem(file, signature.maxBytes);
      if (problem) {
        setError(problem);
        return null;
      }
      return await uploadLogo(file, signature);
    } catch (uploadError) {
      setError(uploadMessage(uploadError));
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, error, upload };
};
