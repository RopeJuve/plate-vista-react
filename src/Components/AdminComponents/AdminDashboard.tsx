import { Outlet, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Navbar, Footer, Sidebar, ThemeSettings } from "../AdminComponents";
import ErrorBoundary from "../ErrorBoundary";
import { useStateContext } from "../../contexts/ContextProvider";

const AdminDashboard = () => {
  const location = useLocation();
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();

  return (
    <TooltipProvider delayDuration={200}>
      <div className={currentMode === "Dark" ? "dark" : ""}>
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed right-4 bottom-4" style={{ zIndex: 1000 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
                  onClick={() => setThemeSettings(true)}
                  style={{ background: currentColor, borderRadius: "50%" }}
                  aria-label="Settings"
                >
                  <Settings className="h-7 w-7" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Settings</TooltipContent>
            </Tooltip>
          </div>
          {activeMenu ? (
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
              <Sidebar />
            </div>
          ) : (
            <div className="w-0 bg-secondary-dark-bg">
              <Sidebar />
            </div>
          )}
          <div
            className={
              activeMenu
                ? "dark:bg-d-main-bg bg-main-bg min-h-screen md:ml-72 w-full"
                : "dark:bg-d-main-bg bg-main-bg min-h-screen w-full flex-2"
            }
          >
            <div className="fixed md:static bg-main-bg dark:bg-secondary-dark-bg navbar w-full">
              <Navbar />
            </div>

            <div>
              {themeSettings && <ThemeSettings />}
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminDashboard;
