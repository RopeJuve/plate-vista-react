import { LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import type { User } from "../../types";

const nameOf = (user: User | null) => {
  if (!user) {
    return "Staff";
  }
  if (typeof user === "string") {
    return user;
  }
  return user.employee || user.email || "Staff";
};

/** Who is signed in on this screen, and the way out. */
const StaffChip = () => {
  const { user, logout } = useAuth();
  const { disconnect } = useRealtime();
  const name = nameOf(user);
  const position = typeof user === "object" && user?.position ? user.position : "";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3">
        <span
          className="grid h-8 w-8 place-items-center rounded-full bg-paper text-sm font-black uppercase text-ink"
          aria-hidden="true"
        >
          {name.charAt(0)}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-paper">{name}</span>
          {position && (
            <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-steel-300">
              {position}
            </span>
          )}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          disconnect();
          logout();
        }}
        className="grid h-10 w-10 place-items-center rounded-md text-steel-300 transition-colors hover:bg-white/10 hover:text-paper"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
};

export default StaffChip;
