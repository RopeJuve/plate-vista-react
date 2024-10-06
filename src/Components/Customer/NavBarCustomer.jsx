import React, { useEffect, useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSearch } from "react-icons/bs";
import TableIcon from "./TableIcon";
import mainlogoLight from "../../data/mainlogoLight.svg";
import mainlogoDark from "../../data/mainlogoDark.svg";
import { fetchData } from "../../services/fetchData";
import MenuItemCard from "./MenuItemCard";

const NavBarCustomer = ({ tableNum, connectionStatus }) => {
  const { search, setSearch } = useStateContext();
  const [meals, setMeals] = useState([]);
  const { currentMode } = useStateContext();

  useEffect(() => {
    const getMeals = async () => {
      try {
        const { data } = await fetchData(
          `${import.meta.env.VITE_VERCEL_API_URL}/menu-items`
        );
        setMeals(data);
      } catch (error) {
        console.error(error);
      }
    };
    getMeals();
  }, []);

  const filteredMeals = meals.filter(meal =>
    meal.title.toLowerCase().includes(search.toLowerCase()) ||
    meal.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img
            src={currentMode === "Dark" ? mainlogoLight : mainlogoDark}
            style={{ width: "200px", height: "100px" }}
            alt="Logo"
          />
          <TableIcon tableNum={tableNum} connectionStatus={connectionStatus} />
        </div>
        <div className={`w-[1.5rem] h-[1.rem] cursor-pointer ${currentMode === "Dark" ? " text-white" : "bg-white text-black"}`}>
          <RxHamburgerMenu className="w-full h-full" />
        </div>
      </div>

      <div className="w-full px-6">
        <div className={`flex items-center gap-2 border border-gray-500 rounded-xl p-1 ${currentMode === "Dark" ? "bg-gray-500 text-white" : "bg-white text-black"}`}>
          <BsSearch className="w-5 h-5" />
          <input
            className="flex-grow outline-none bg-transparent"
            type="text"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for meals or ingredients"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {search && filteredMeals.length > 0 ? (
          filteredMeals.map(meal => (
            <MenuItemCard key={meal._id} item={meal} />
          ))
        ) : (
          search && <div className="text-gray-500">No results found</div>
        )}
      </div>
    </>
  );
};

export default NavBarCustomer;
