import { useEffect } from "react";
import { Menu, Search } from "lucide-react";
import { Searchbar } from ".";
import { useStateContext } from "../../contexts/ContextProvider";
import { Wordmark } from "../rail";

const Navbar = () => {
  const { setActiveMenu, isClicked, handleClick, screenSize, setScreenSize } = useStateContext();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    // The drawer is a small-screen thing; on desktop the rail is always there.
    if ((screenSize ?? 0) < 1024) {
      setActiveMenu(false);
    }
  }, [screenSize, setActiveMenu]);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/[0.07] bg-paper/90 backdrop-blur-sm print:hidden">
      <div className="relative mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => setActiveMenu(true)}
          className="grid h-10 w-10 place-items-center rounded-md hover:bg-ink/[0.06] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Wordmark className="text-ink lg:hidden" />
        <button
          type="button"
          onClick={() => handleClick("search")}
          className="ml-auto flex h-10 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
          aria-label="Search"
          aria-expanded={isClicked.search}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Find an employee</span>
        </button>
        {isClicked.search && <Searchbar />}
      </div>
    </header>
  );
};

export default Navbar;
