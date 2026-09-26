import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Settings } from "lucide-react";
import { lazy, Suspense } from "react";
import NavBarCustomer from "./NavBarCustomer";
import CategoriesCustomer from "./CategoriesCustomer";
import MenuItemsList from "./MenuItemsList";
import Footer from "../AdminComponents/Footer";
import SkeletonList from "./SkeletonList";
import Cart from "./Cart";
import { CartProvider } from "../../contexts/CartContext";
import { useStateContext } from "../../contexts/ContextProvider";
import api from "../../services/api";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import { clearGuestStorage, parseGuestAuth } from "../../features/guest-ordering/guestSession";
import { GuestBillProvider, useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { MenuProvider, useMenu } from "../../features/guest-ordering/MenuProvider";
import { ThankYou } from "../../features/guest-ordering/ThankYou";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import Loading from "../../pages/Loading";

const ThemeSettings = lazy(() => import("../AdminComponents/ThemeSettings"));

const GuestMenu = () => {
  const { session } = useGuestAuth();
  const { items, categories, loading, error, reload } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState("");
  const { themeSettings, setThemeSettings, currentMode, currentColor } = useStateContext();
  const visible = items.filter(
    (item) => !item.archived && (!selectedCategory || item.category === selectedCategory)
  );

  useEffect(() => {
    if (!selectedCategory && categories[0]) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <div className="relative flex h-screen flex-col bg-slate-50 dark:bg-main-dark-bg">
        <div className="fixed bottom-24 right-2 z-[1000]">
          <button
            type="button"
            className="p-3 text-white hover:bg-light-gray hover:drop-shadow-xl"
            onClick={() => setThemeSettings(true)}
            style={{ background: currentColor, borderRadius: "50%" }}
            aria-label="Settings"
          >
            <Settings className="h-8 w-8" />
          </button>
        </div>
        {themeSettings && (
          <Suspense fallback={null}>
            <ThemeSettings />
          </Suspense>
        )}
        <NavBarCustomer tableNum={session?.tableNumber} />
        <CategoriesCustomer
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        <div className="flex-grow overflow-hidden">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-gray-700 dark:text-gray-200" role="alert">
                {error}
              </p>
              <button type="button" className="rounded-md bg-orange-500 px-4 py-2 text-white" onClick={reload}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <SkeletonList itemsCount={10} isLoading={loading} />
              <MenuItemsList items={visible} isLoading={loading} />
            </>
          )}
        </div>
        <Cart />
        <Footer />
      </div>
    </div>
  );
};

const GuestSessionShell = ({ sessionId }: { sessionId: string }) => {
  const { closed } = useGuestBill();
  const { sessionEnded, disconnect } = useRealtime();
  const ended = closed || sessionEnded;

  useEffect(() => {
    if (!ended) {
      return;
    }
    clearGuestStorage(sessionId);
    disconnect();
  }, [disconnect, ended, sessionId]);

  if (ended) {
    return <ThankYou />;
  }

  return <GuestMenu />;
};

const Customer = () => {
  const { slug = "", qrCode = "" } = useParams();
  const { session, setSession } = useGuestAuth();
  const { fatalMessage } = useRealtime();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const login = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.post(`/auth/table/${encodeURIComponent(qrCode)}`);
        if (cancelled) {
          return;
        }
        setSession(parseGuestAuth(data, slug, qrCode));
      } catch (err) {
        if (!cancelled) {
          const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
          setError(message || "Invalid table, please scan the QR code again");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    if (slug && qrCode) {
      void login();
    }
    return () => {
      cancelled = true;
    };
  }, [qrCode, setSession, slug]);

  if (fatalMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="text-lg font-semibold text-gray-800" role="alert">
          {fatalMessage}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="text-lg font-semibold text-gray-800" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (loading || !session?.sessionId) {
    return <Loading />;
  }

  return (
    <MenuProvider slug={slug}>
      <CartProvider sessionId={session.sessionId}>
        <GuestBillProvider sessionId={session.sessionId}>
          <GuestSessionShell sessionId={session.sessionId} />
        </GuestBillProvider>
      </CartProvider>
    </MenuProvider>
  );
};

export default Customer;
