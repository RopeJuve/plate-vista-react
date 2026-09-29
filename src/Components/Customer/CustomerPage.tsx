import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import NavBarCustomer from "./NavBarCustomer";
import CategoriesCustomer from "./CategoriesCustomer";
import MenuItemsList from "./MenuItemsList";
import SkeletonList from "./SkeletonList";
import { Wordmark } from "../rail";
import Cart from "./Cart";
import { CartProvider } from "../../contexts/CartContext";
import { useStateContext } from "../../contexts/ContextProvider";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import { clearGuestStorage, joinTable, type JoinTableResult } from "../../features/guest-ordering/guestSession";
import { JoinCodeBanner, JoinCodeForm } from "../../features/guest-ordering/JoinCode";
import { GuestBillProvider, useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { MenuProvider, useMenu } from "../../features/guest-ordering/MenuProvider";
import { ThankYou } from "../../features/guest-ordering/ThankYou";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import Loading from "../../pages/Loading";

const GuestMenu = () => {
  const { session } = useGuestAuth();
  const { items, categories, loading, error, reload } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState("");
  // The guest who opened the table sees the code up front; anyone can bring it back.
  const [showCode, setShowCode] = useState(() => Boolean(session?.opened));
  const { search } = useStateContext();
  const query = search.trim().toLowerCase();
  const visible = items.filter((item) => {
    if (item.archived) {
      return false;
    }
    if (query) {
      return item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    }
    return !selectedCategory || item.category === selectedCategory;
  });

  useEffect(() => {
    if (!selectedCategory && categories[0]) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-dvh bg-paper pb-28 text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/[0.07] bg-paper/95 backdrop-blur-sm">
        <NavBarCustomer
          tableNum={session?.tableNumber}
          joinCode={showCode ? undefined : session?.joinCode}
          onShowCode={() => setShowCode(true)}
        />
        {showCode && session?.joinCode && (
          <JoinCodeBanner code={session.joinCode} onDismiss={() => setShowCode(false)} />
        )}
        <CategoriesCustomer
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        {query && <div className="h-3" />}
      </header>
      <main>
        {error ? (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-20 text-center">
            <p className="text-lg font-bold" role="alert">
              {error}
            </p>
            <button
              type="button"
              className="h-11 rounded-md bg-ink px-5 font-semibold text-paper hover:bg-ink/85"
              onClick={reload}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <SkeletonList itemsCount={6} isLoading={loading} />
            <MenuItemsList
              items={visible}
              isLoading={loading}
              heading={query ? `Results for “${search.trim()}”` : selectedCategory}
              emptyMessage={query ? "No dishes match that search." : "Nothing in this category yet."}
            />
          </>
        )}
        <p className="mt-10 text-center font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
          Ordering by Plate Vista
        </p>
      </main>
      <Cart />
    </div>
  );
};

const GuestNotice = ({ message }: { message: string }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center text-ink">
    <Wordmark className="mb-8 text-ink" />
    <p className="max-w-sm text-xl font-bold" role="alert">
      {message}
    </p>
  </div>
);

const GuestSessionShell = ({ sessionId, qrCode }: { sessionId: string; qrCode: string }) => {
  const { closed } = useGuestBill();
  const { sessionEnded, disconnect } = useRealtime();
  const ended = closed || sessionEnded;

  useEffect(() => {
    if (!ended) {
      return;
    }
    clearGuestStorage(sessionId, qrCode);
    disconnect();
  }, [disconnect, ended, qrCode, sessionId]);

  if (ended) {
    return <ThankYou sessionId={sessionId} />;
  }

  return <GuestMenu />;
};

type JoinState = "loading" | "needsCode" | "wrongCode" | "joining" | "joined";

const JOIN_MESSAGES: Partial<Record<JoinTableResult["status"], string>> = {
  tooManyTries: "Too many wrong codes. Please ask your waiter for help.",
  notFound: "Invalid table, please scan the QR code again",
};

const Customer = () => {
  const { slug = "", qrCode = "" } = useParams();
  const { session, setSession } = useGuestAuth();
  const { fatalMessage } = useRealtime();
  const [error, setError] = useState("");
  const [joinState, setJoinState] = useState<JoinState>("loading");
  const cancelledRef = useRef(false);

  const join = useCallback(
    async (joinCode?: string) => {
      setError("");
      setJoinState(joinCode ? "joining" : "loading");
      const result = await joinTable(slug, qrCode, joinCode);
      if (cancelledRef.current) {
        return;
      }
      switch (result.status) {
        case "joined":
          setSession(result.session);
          setJoinState("joined");
          return;
        case "needsCode":
          setJoinState("needsCode");
          return;
        case "wrongCode":
          setJoinState("wrongCode");
          return;
        case "error":
          setError(result.message || "Invalid table, please scan the QR code again");
          return;
        default:
          setError(JOIN_MESSAGES[result.status] || "Invalid table, please scan the QR code again");
      }
    },
    [qrCode, setSession, slug]
  );

  useEffect(() => {
    cancelledRef.current = false;
    if (slug && qrCode) {
      void join();
    }
    return () => {
      cancelledRef.current = true;
    };
  }, [join, qrCode, slug]);

  if (fatalMessage) {
    return <GuestNotice message={fatalMessage} />;
  }

  if (error) {
    return <GuestNotice message={error} />;
  }

  if (joinState === "needsCode" || joinState === "wrongCode" || joinState === "joining") {
    return (
      <JoinCodeForm
        wrongCode={joinState === "wrongCode"}
        pending={joinState === "joining"}
        onSubmit={(code) => void join(code)}
      />
    );
  }

  if (joinState !== "joined" || !session?.sessionId) {
    return <Loading />;
  }

  return (
    <MenuProvider slug={slug}>
      <CartProvider sessionId={session.sessionId}>
        <GuestBillProvider sessionId={session.sessionId}>
          <GuestSessionShell sessionId={session.sessionId} qrCode={qrCode} />
        </GuestBillProvider>
      </CartProvider>
    </MenuProvider>
  );
};

export default Customer;
