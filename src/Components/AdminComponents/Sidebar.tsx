import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useAuth } from "../../contexts/AuthContext";
import { useSignOut } from "../../shared/auth/hooks/useSignOut";
import { initialOf, staffName } from "../../shared/auth/staffName";
import { links } from "../../data/data";
import { useFailedSignatureCount } from "../../features/kasse/hooks/useFailedSignatureCount";
import { failedSignatureBadge } from "../../features/kasse/failedSignatures";
import { Wordmark } from "../rail";
import { cn } from "@/lib/utils";

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { setActiveMenu } = useStateContext();
  const { user } = useAuth();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const name = staffName(user, "Owner");
  const { count: failedSignatures } = useFailedSignatureCount();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <nav aria-label="Admin" className="flex h-full flex-col text-paper">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link to="/admin" onClick={onNavigate} className="rounded-md">
          <Wordmark />
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={() => setActiveMenu(false)}
            className="grid h-10 w-10 place-items-center rounded-md text-steel-300 hover:bg-white/10 hover:text-paper lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
        {links.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-steel-300">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.links.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={`/admin/${link.name}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex h-10 items-center gap-3 rounded-md px-3 text-[0.925rem] font-semibold transition-colors",
                        isActive ? "bg-paper text-ink" : "text-steel-300 hover:bg-white/[0.06] hover:text-paper"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <link.icon className={cn("h-[18px] w-[18px]", isActive && "text-signal-ink")} aria-hidden="true" />
                        <span>{link.label}</span>
                        {link.name === "kasse" && failedSignatures > 0 && (
                          <span className="ml-auto rounded-full bg-alert px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-ink">
                            <span aria-hidden="true">{failedSignatures}</span>
                            <span className="sr-only">, {failedSignatureBadge(failedSignatures).label}</span>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.07] px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-sm font-black uppercase text-ink" aria-hidden="true">
          {initialOf(name)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold">{name}</span>
          <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-steel-300">
            {user?.position || "admin"}
          </span>
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="grid h-10 w-10 place-items-center rounded-md text-steel-300 hover:bg-white/10 hover:text-paper"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
