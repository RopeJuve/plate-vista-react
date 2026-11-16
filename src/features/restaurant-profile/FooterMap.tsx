import { ExternalLink, MapPin } from "lucide-react";
import { useMapConsent } from "./hooks/useMapConsent";

// A faint street grid, drawn locally: nothing is fetched until the guest agrees.
const STREETS = {
  backgroundImage:
    "linear-gradient(hsl(var(--ink) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink) / 0.06) 1px, transparent 1px), linear-gradient(35deg, transparent 48%, hsl(var(--ink) / 0.09) 48%, hsl(var(--ink) / 0.09) 52%, transparent 52%)",
  backgroundSize: "28px 28px, 28px 28px, 100% 100%",
};

/**
 * The restaurant on a map. Google sees nothing about a guest who never agreed; once they
 * have, the map loads by itself on later visits until they turn it off again.
 * Without an embed it is just the link.
 */
const FooterMap = ({ name, embedUrl, searchUrl }: { name: string; embedUrl: string | null; searchUrl: string }) => {
  const { granted, grant, revoke } = useMapConsent();

  return (
    <div className="relative min-h-[11rem] overflow-hidden bg-paper-deep">
      {granted && embedUrl ? (
        <>
          <iframe
            title={`Map showing ${name}`}
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <button
            type="button"
            onClick={revoke}
            className="absolute bottom-2 left-2 h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-ink shadow-[0_1px_3px_rgb(0_0_0/0.15)] hover:bg-paper"
          >
            Hide map
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 pt-8" style={STREETS}>
          <MapPin className="h-7 w-7 text-ink/40" aria-hidden="true" />
          {embedUrl && (
            <>
              <button
                type="button"
                onClick={grant}
                className="h-10 rounded-md bg-ink px-4 text-sm font-semibold text-paper hover:bg-ink/85 active:translate-y-px"
              >
                Show map
              </button>
              <p className="max-w-[16rem] text-center text-[0.7rem] text-ink-soft">
                Loads Google Maps. Your choice is remembered on this device.
              </p>
            </>
          )}
        </div>
      )}
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute left-2 top-2 inline-flex h-9 items-center gap-1.5 rounded-md bg-white px-3 text-sm font-semibold text-ink shadow-[0_1px_3px_rgb(0_0_0/0.15)] hover:bg-paper"
      >
        Open in Google Maps
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
};

export default FooterMap;
