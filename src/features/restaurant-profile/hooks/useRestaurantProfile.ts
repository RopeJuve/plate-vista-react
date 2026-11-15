import { useEffect, useState } from "react";
import type { ProfileValues } from "../../../lib/schemas";
import { apiMessage, notify } from "../../../utils/notify";
import { fetchProfile, saveProfile } from "../profileApi";
import { profileFieldErrors, toProfileInput, type ProfileFieldError } from "../profileForm";
import type { RestaurantProfile } from "../types";

/** The Restaurant Profile as the dashboard edits it. */
export const useRestaurantProfile = () => {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((loaded) => {
        if (!cancelled) {
          setProfile(loaded);
        }
      })
      .catch((error) => notify(apiMessage(error, "Could not load the restaurant profile")))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Resolves to the field errors to show, or an empty list once saved. */
  const save = async (values: ProfileValues): Promise<ProfileFieldError[]> => {
    try {
      setProfile(await saveProfile(toProfileInput(values)));
      notify("Saved", "success");
      return [];
    } catch (error) {
      const errors = profileFieldErrors(error);
      if (errors.length === 0) {
        notify(apiMessage(error, "Could not save the restaurant profile"));
      }
      return errors;
    }
  };

  return { profile, loading, save };
};
