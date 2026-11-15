import { useEffect, useState } from "react";
import { fetchPublicProfile } from "../profileApi";
import type { PublicProfile } from "../types";

export type PublicProfileState =
  | { status: "loading"; profile: null }
  | { status: "ready"; profile: PublicProfile }
  | { status: "failed"; profile: null };

/** What guests see about the restaurant. A failure only hides the logo and footer: ordering goes on. */
export const usePublicProfile = (slug: string): PublicProfileState => {
  const [state, setState] = useState<PublicProfileState>({ status: "loading", profile: null });

  useEffect(() => {
    if (!slug) {
      setState({ status: "failed", profile: null });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading", profile: null });
    fetchPublicProfile(slug, controller.signal)
      .then((profile) => setState({ status: "ready", profile }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "failed", profile: null });
        }
      });
    return () => controller.abort();
  }, [slug]);

  return state;
};
