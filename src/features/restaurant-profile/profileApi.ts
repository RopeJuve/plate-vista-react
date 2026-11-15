import api from "../../services/api";
import type { PublicProfile, RestaurantProfile, RestaurantProfileInput } from "./types";

export const fetchProfile = async () => (await api.get<RestaurantProfile>("/restaurant/profile")).data;

/** Errors are shown under the fields, so the client's generic toast stays off. */
export const saveProfile = async (input: RestaurantProfileInput) =>
  (await api.put<RestaurantProfile>("/restaurant/profile", input, { skipErrorToast: true })).data;

/** Guests read it without signing in; a missing profile must never stop them ordering. */
export const fetchPublicProfile = async (slug: string, signal?: AbortSignal) =>
  (
    await api.get<PublicProfile>(`/r/${encodeURIComponent(slug)}/profile`, {
      signal,
      skipErrorToast: true,
    })
  ).data;

type LogoSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  allowedFormats: string;
  maxBytes: number;
  signature: string;
};

export const fetchLogoSignature = async () =>
  (await api.post<LogoSignature>("/restaurant/profile/logo-upload-signature", undefined, { skipErrorToast: true }))
    .data;

/**
 * Uploads straight from the browser to Cloudinary with a signature from our
 * API. Cloudinary cannot enforce the size of a signed upload, so it is checked
 * here. Resolves to the logo's URL.
 */
export const uploadLogo = async (file: File, signature: LogoSignature): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("timestamp", String(signature.timestamp));
  form.append("signature", signature.signature);
  form.append("folder", signature.folder);
  form.append("allowed_formats", signature.allowedFormats);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const body = (await response.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !body.secure_url) {
    throw new Error(body.error?.message || "The logo could not be uploaded");
  }
  return body.secure_url;
};
