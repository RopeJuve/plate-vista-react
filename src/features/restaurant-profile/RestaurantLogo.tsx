import { useState } from "react";
import { Wordmark } from "../../Components/rail";
import type { PublicProfileState } from "./hooks/usePublicProfile";

/** The restaurant's own mark in the guest header: its logo, else its name, else Plate Vista's. */
const RestaurantLogo = ({ state }: { state?: PublicProfileState }) => {
  const [broken, setBroken] = useState(false);

  if (state?.status === "loading") {
    return <span className="block h-8 w-24" aria-hidden="true" />;
  }
  if (state?.status !== "ready") {
    return <Wordmark className="text-ink" />;
  }
  const { name, logoUrl } = state.profile;
  if (logoUrl && !broken) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="block h-8 w-auto max-w-[160px] object-contain object-left"
        onError={() => setBroken(true)}
      />
    );
  }
  return <span className="block truncate text-lg font-extrabold leading-none tracking-[-0.01em] text-ink">{name}</span>;
};

export default RestaurantLogo;
