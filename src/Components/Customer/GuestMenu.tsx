import { useEffect, useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { JoinCodeBanner } from "../../features/guest-ordering/JoinCode";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { visibleMenuItems } from "../../features/guest-ordering/menu";
import Cart from "./Cart";
import CategoriesCustomer from "./CategoriesCustomer";
import MenuItemsList from "./MenuItemsList";
import NavBarCustomer from "./NavBarCustomer";
import PaidBillBanner from "./PaidBillBanner";
import SkeletonList from "./SkeletonList";

/** The menu a seated guest orders from: search, categories, dishes, and their cart. */
const GuestMenu = () => {
  const { session } = useGuestAuth();
  const { items, categories, loading, error, reload } = useMenu();
  const { search } = useStateContext();
  const { paid } = useGuestBill();
  const [selectedCategory, setSelectedCategory] = useState("");
  // The guest who opened the table sees the code up front; anyone can bring it back.
  const [showCode, setShowCode] = useState(() => Boolean(session?.opened));
  const searching = Boolean(search.trim());

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
        {paid && <PaidBillBanner paid={paid} />}
        {showCode && session?.joinCode && !paid && (
          <JoinCodeBanner code={session.joinCode} onDismiss={() => setShowCode(false)} />
        )}
        <CategoriesCustomer
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        {searching && <div className="h-3" />}
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
              items={visibleMenuItems(items, search, selectedCategory)}
              isLoading={loading}
              heading={searching ? `Results for “${search.trim()}”` : selectedCategory}
              emptyMessage={searching ? "No dishes match that search." : "Nothing in this category yet."}
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

export default GuestMenu;
