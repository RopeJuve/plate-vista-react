import { useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "@/Components/ui/button";
import { notify } from "@/utils/notify";

type ImageUploadProps = {
  value?: File | string;
  onChange: (file: File) => void;
  disabled?: boolean;
};

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
const MAX_BYTES = 5 * 1024 * 1024;

export const ImageUpload = ({ value, onChange, disabled }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileName =
    value instanceof File ? value.name : typeof value === "string" ? value : "";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_BYTES) {
      notify("Image must be 5MB or smaller");
      return;
    }
    onChange(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Choose image"
      >
        Choose image
      </Button>
      {fileName ? (
        <span className="truncate text-sm text-muted-foreground">{fileName}</span>
      ) : (
        <span className="text-sm text-muted-foreground">No file selected</span>
      )}
    </div>
  );
};
