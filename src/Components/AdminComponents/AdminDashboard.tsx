import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar, Sidebar } from "../AdminComponents";
import ErrorBoundary from "../ErrorBoundary";
import { useStateContext } from "../../contexts/ContextProvider";
import Loading from "../../pages/Loading";

const AdminDashboard = () => {
  const location = useLocation();
  const { activeMenu, setActiveMenu, setIsClicked, initialState } = useStateContext();

  useEffect(() => {
    setIsClicked(initialState);
  }, [location.pathname, initialState, setIsClicked]);

  useEffect(() => {
    if (!activeMenu) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMenu, setActiveMenu]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="steel steel-ground sticky top-0 hidden h-dvh lg:block print:!hidden">
          <Sidebar />
        </aside>

        {activeMenu && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div
              className="absolute inset-0 bg-steel-950/60 animate-in fade-in-0"
              onClick={() => setActiveMenu(false)}
              role="presentation"
            />
            <div className="steel steel-ground absolute inset-y-0 left-0 w-[min(18rem,85vw)] shadow-2xl animate-in slide-in-from-left duration-300">
              <Sidebar onNavigate={() => setActiveMenu(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <ErrorBoundary key={location.pathname}>
              <Suspense fallback={<Loading fullScreen={false} />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminDashboard;
