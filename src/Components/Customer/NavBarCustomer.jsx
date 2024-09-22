import React, { useState } from "react";
import { MdMenu } from "react-icons/md";
import ThemeSettings from "../AdminComponents/ThemeSettings";
import { useStateContext } from "../../contexts/ContextProvider";

const NavBarCustomer = () => {
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const { setThemeSettings } = useStateContext();

  const toggleThemeSettings = () => {
    setShowThemeSettings(!showThemeSettings);
    setThemeSettings(!showThemeSettings);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white">
      <h1 className="text-xl">NavBar</h1>
      <button onClick={toggleThemeSettings} className="text-2xl">
        <MdMenu />
      </button>

      {showThemeSettings && <ThemeSettings />}
    </div>
  );
};

export default NavBarCustomer;
