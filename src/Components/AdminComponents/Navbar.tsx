import { useEffect } from "react";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import avatar from "../../data/avatar.jpg";
import mainlogoLight from "../../data/mainlogoLight.svg";
import mainlogoDark from "../../data/mainlogoDark.svg";
import { Notification, UserProfile, Searchbar } from ".";
import { useStateContext } from "../../contexts/ContextProvider";
import { useAuth } from "../../contexts/AuthContext";

type NavButtonProps = {
  title: string;
  customFunc: () => void;
  icon: React.ReactNode;
  color: string;
  dotColor?: string;
};

const NavButton = ({
  title,
  customFunc,
  icon,
  color,
  dotColor,
}: NavButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={customFunc}
        style={{ color }}
        className="relative rounded-full p-3 hover:bg-light-gray"
        aria-label={title}
      >
        {dotColor ? (
          <span
            style={{ background: dotColor }}
            className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
          />
        ) : null}
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" align="center">
      {title}
    </TooltipContent>
  </Tooltip>
);

const Navbar = () => {
  const {
    activeMenu,
    setActiveMenu,
    isClicked,
    handleClick,
    screenSize,
    setScreenSize,
    currentColor,
    currentMode,
  } = useStateContext();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize, setActiveMenu]);

  return (
    <div className="flex justify-between p-2 md:mx-6 relative">
      <div className="flex items-center gap-4">
        <NavButton
          title="Menu"
          customFunc={() => setActiveMenu((prev) => !prev)}
          color={currentColor}
          icon={<Menu className="h-8 w-8" />}
        />
        {!activeMenu && (
          <img
            src={currentMode === "Dark" ? mainlogoLight : mainlogoDark}
            alt="Logo"
            style={{ width: "150px", height: "50px" }}
            className="cursor-pointer"
          />
        )}
      </div>
      <div className="flex">
        <NavButton
          title="Search"
          customFunc={() => handleClick("search")}
          color={currentColor}
          icon={<Search className="h-5 w-5" />}
        />
        <NavButton
          title="Notifications"
          customFunc={() => handleClick("notification")}
          color={currentColor}
          icon={<Bell className="h-5 w-5" />}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
              onClick={() => handleClick("userProfile")}
              aria-label="Profile"
            >
              <img src={avatar} className="w-8 h-8 rounded-full" alt="" />
              <p>
                <span className="text-gray-400 text-14">Hi,</span>{" "}
                <span className="text-gray-400 font-bold ml-1 text-14">
                  {user?.employee || user?.position || "Guest"}
                </span>
              </p>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Profile
          </TooltipContent>
        </Tooltip>
        {isClicked.notification && <Notification />}
        {isClicked.search && <Searchbar />}
        {isClicked.userProfile && <UserProfile />}
      </div>
    </div>
  );
};

export default Navbar;
