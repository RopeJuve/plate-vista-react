import NavTabs from "./NavTabs";
import Logo from "../../data/mainlogoLight.svg";
import Online from "./Online";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import BarAvatar from "./BarAvatar";
import { useAuth } from "../../contexts/AuthContext";

const BarPageNav = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (tab: string) => void;
}) => {
  const { status, disconnect } = useRealtime();
  const { logout } = useAuth();
  return (
    <div className="max-w-screen-xl mx-auto flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <img src={Logo} alt="logo" className="h-10 w-26" />
        <Online status={status} />
      </div>
      <NavTabs selected={selected} setSelected={setSelected} />
      <div className="flex items-center">
        <BarAvatar />
        <button
          type="button"
          className="px-4 py-2 rounded-lg text-red-500"
          onClick={() => {
            disconnect();
            logout();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default BarPageNav;
