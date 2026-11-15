import { useRef, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogoUpload } from "./hooks/useLogoUpload";
import { LOGO_ACCEPT } from "./logoFile";

type LogoFieldProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

/** The logo guests see top left on their phone; without one they see the restaurant's name. */
const LogoField = ({ value, onChange }: LogoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, upload } = useLogoUpload();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await upload(file);
    if (url) onChange(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid h-16 w-40 place-items-center rounded-lg bg-paper px-3 ring-1 ring-ink/[0.07]">
        {value ? (
          <img src={value} alt="Your logo" className="max-h-8 max-w-[160px] object-contain" />
        ) : (
          <span className="text-center text-xs text-ink-soft">No logo: guests see your restaurant&apos;s name</span>
        )}
      </div>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={LOGO_ACCEPT}
          className="sr-only"
          onChange={handleFile}
          aria-label="Logo file"
          tabIndex={-1}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-ink/15"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
            {uploading ? "Uploading…" : value ? "Replace logo" : "Upload logo"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-ink-soft">PNG, JPG or WebP, up to 2 MB. Shown at most 32 px high.</p>
        {error && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default LogoField;
