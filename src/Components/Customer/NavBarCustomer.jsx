import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSearch } from "react-icons/bs";
import TableIcon from "./TableIcon";
import mainlogoLight from "../../data/mainlogoLight.svg";
import mainlogoDark from "../../data/mainlogoDark.svg";
import { fetchData } from "../../services/fetchData";

const NavBarCustomer = ({ tableNum, connectionStatus }) => {
  const [search, setSearch] = useState("");
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
        <div className="w-[1.5rem] h-[1.rem] cursor-pointer">
          <RxHamburgerMenu className="w-full h-full" />
        </div>
      </div>
      <div className="w-full px-6">
        <div className="flex items-center gap-2 border border-black rounded-xl p-1">
          <BsSearch className="w-5 h-5" />
          <input
            className="flex-grow outline-none bg-transparent"
            type="text"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for meals"
          />
        </div>
        {search && filteredMeals.length > 0 && (
          <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
            {filteredMeals.map(meal => (
              <div key={meal._id} className="p-2 hover:bg-gray-100">
                <h3 className="font-semibold">{meal.title}</h3>
                <p className="text-sm text-gray-600">{meal.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NavBarCustomer;
