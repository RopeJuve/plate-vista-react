import AddressRow from "./AddressRow";
import FooterMap from "./FooterMap";
import OpeningHoursRow from "./OpeningHoursRow";
import { footerConfig } from "./footerConfig";
import type { PublicProfileState } from "./hooks/usePublicProfile";
import { mapsEmbedUrl, mapsSearchUrl } from "./mapLinks";
import { hasOpeningHours } from "./openingHours";

/** The bottom of the guest page: where the restaurant is, when it is open, and Plate Vista's legal links. */
const GuestFooter = ({ state }: { state?: PublicProfileState }) => {
  const { mapsEmbedKey, legalLinks } = footerConfig();
  const profile = state?.status === "ready" ? state.profile : null;
  const address = profile?.address ?? null;
  const showHours = profile ? hasOpeningHours(profile.openingHours) : false;

  return (
    <footer className="mx-auto mt-10 w-full max-w-3xl px-4 sm:px-6">
      {profile && (address || showHours) && (
        <section
          aria-label={`About ${profile.name}`}
          className="grid overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.07] md:grid-cols-2"
        >
          {address && (
            <FooterMap
              name={profile.name}
              embedUrl={mapsEmbedUrl(mapsEmbedKey, profile.name, address)}
              searchUrl={mapsSearchUrl(profile.name, address)}
            />
          )}
          <div className={address ? "divide-y divide-paper-line" : "divide-y divide-paper-line md:col-span-2"}>
            {address && <AddressRow address={address} />}
            {showHours && <OpeningHoursRow hours={profile.openingHours} timezone={profile.timezone} />}
          </div>
        </section>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-paper-line py-5 text-sm">
        {legalLinks.length > 0 && (
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                {link.label}
              </a>
            ))}
          </nav>
        )}
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">Powered by Plate Vista</p>
      </div>
    </footer>
  );
};

export default GuestFooter;
