import { UtensilsCrossed, Wine } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItemImageProps = {
  image?: string | null;
  station?: "bar" | "kitchen";
  className?: string;
  dimmed?: boolean;
};

// The item's own photo, or the placeholder for its station: a glass for bar
// items, a plate for kitchen items.
const MenuItemImage = ({ image, station = "kitchen", className, dimmed }: MenuItemImageProps) => {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        loading="lazy"
        className={cn("object-cover", dimmed && "opacity-50 grayscale", className)}
      />
    );
  }
  const Icon = station === "bar" ? Wine : UtensilsCrossed;
  return (
    <div
      className={cn("grid place-items-center bg-paper-deep text-ink/25", dimmed && "opacity-50", className)}
      aria-hidden="true"
    >
      <Icon className="h-1/3 max-h-10 w-1/3 max-w-10" strokeWidth={1.5} />
    </div>
  );
};

export default MenuItemImage;
