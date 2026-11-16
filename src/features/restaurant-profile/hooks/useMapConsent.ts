import { useCallback, useState } from "react";

// One choice for every restaurant: the guest agrees to Google Maps, not to one place's map.
export const MAP_CONSENT_KEY = "plateVista.mapsConsent";

const read = () => {
  try {
    return localStorage.getItem(MAP_CONSENT_KEY) === "granted";
  } catch {
    return false; // Private mode or blocked storage: ask again, never assume.
  }
};

const write = (granted: boolean) => {
  try {
    if (granted) localStorage.setItem(MAP_CONSENT_KEY, "granted");
    else localStorage.removeItem(MAP_CONSENT_KEY);
  } catch {
    // The choice still holds for this visit.
  }
};

/**
 * Whether this guest has agreed to load Google Maps. Remembered in the browser, so the
 * map loads by itself on later visits, and can be withdrawn as easily as it was given.
 */
export const useMapConsent = () => {
  const [granted, setGranted] = useState(read);

  const grant = useCallback(() => {
    write(true);
    setGranted(true);
  }, []);

  const revoke = useCallback(() => {
    write(false);
    setGranted(false);
  }, []);

  return { granted, grant, revoke };
};
