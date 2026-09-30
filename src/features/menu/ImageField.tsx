import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MenuItemImage from "./MenuItemImage";
import { uploadMenuImage } from "./uploadImage";
import type { Station } from "./categoriesApi";

const ACCEPTED = ".jpg,.jpeg,.png,.webp";
const MAX_BYTES = 5 * 1024 * 1024;

type ImageFieldProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  station: Station;
};

// An image is optional: upload one, paste a link, or leave it empty and guests
// see the placeholder for the item's station.
const ImageField = ({ value, onChange, station }: ImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller");
      return;
    }
    setError("");
    setUploading(true);
    try {
      onChange(await uploadMenuImage(file));
    } catch (uploadError) {
      const status = (uploadError as { response?: { status?: number } }).response?.status;
      setError(
        status === 503
          ? "Image uploads are not set up yet. Paste an image link instead."
          : uploadError instanceof Error
            ? uploadError.message
            : "The image could not be uploaded"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <MenuItemImage image={value} station={station} className="h-24 w-24 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={handleFile}
          aria-hidden="true"
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
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
        <Input
          aria-label="Image link"
          placeholder="or paste an image link (https://…)"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value.trim() || null)}
        />
        {error && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageField;
