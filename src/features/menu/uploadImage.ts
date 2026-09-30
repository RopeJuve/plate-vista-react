import api from "../../services/api";

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

// Uploads straight from the browser to Cloudinary with a signature from our
// API, so the file never passes through the API. Resolves to the image URL.
export const uploadMenuImage = async (file: File): Promise<string> => {
  const { data } = await api.post<UploadSignature>("/menu-items/upload-signature", undefined, {
    skipErrorToast: true,
  });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", data.apiKey);
  form.append("timestamp", String(data.timestamp));
  form.append("signature", data.signature);
  form.append("folder", data.folder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const body = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };
  if (!response.ok || !body.secure_url) {
    throw new Error(body.error?.message || "The image could not be uploaded");
  }
  return body.secure_url;
};
