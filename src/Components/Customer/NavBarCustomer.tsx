import { useMemo, useState } from "react";
import { Menu, Search } from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";
import TableIcon from "./TableIcon";
import mainlogoLight from "../../data/mainlogoLight.svg";
import mainlogoDark from "../../data/mainlogoDark.svg";
import MenuItemCard from "./MenuItemCard";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";

const NavBarCustomer = ({ tableNum }: { tableNum?: number }) => {
  const { search, setSearch, currentMode } = useStateContext();
  const { items } = useMenu();
  const { status } = useRealtime();
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredMeals = useMemo(
    () =>
      items.filter((meal) => {
        const query = search.toLowerCase();
        return meal.title.toLowerCase().includes(query) || meal.description.toLowerCase().includes(query);
      }),
    [items, search]
  );

  return (
    <>
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <img
            src={currentMode === "Dark" ? mainlogoLight : mainlogoDark}
            style={{ width: "200px", height: "100px" }}
            alt="Logo"
          />
          <TableIcon tableNum={tableNum} />
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Hide search" : "Show search"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className={`h-11 w-11 ${currentMode === "Dark" ? "text-white" : "bg-white text-black"}`}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {menuOpen && (
        <>
          <div className="w-full px-6">
            <div
              className={`flex items-center gap-2 rounded-xl border border-gray-500 p-1 ${
                currentMode === "Dark" ? "bg-gray-500 text-white" : "bg-white text-black"
              }`}
            >
              <Search className="h-5 w-5" />
              <input
                className="flex-grow bg-transparent outline-none"
                type="text"
                name="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for meals or ingredients"
                aria-label="Search for meals or ingredients"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {search && filteredMeals.length > 0 ? (
              filteredMeals.map((meal) => <MenuItemCard key={meal._id} item={meal} />)
            ) : (
              search && <div className="text-gray-500">No results found</div>
            )}
          </div>
        </>
      )}
      <p className="sr-only">Connection {status}</p>
    </>
  );
};

export default NavBarCustomer;
