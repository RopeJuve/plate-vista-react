import { Search } from '@syncfusion/ej2-react-dropdowns';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchOrders } from '../services/orderDataFetch';

const StateContext = createContext();

const initialState = {
  userProfile: false,
  notification: false,
  search: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState('#03C9D7');
  const [currentMode, setCurrentMode] = useState('Light');
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [totalOrders, setTotalOrders] = useState(0);

  // I added new contexts for the search bar
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem('themeMode', e.target.value);

    setThemeSettings(false);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('colorMode', color);

    setThemeSettings(false);
  };

  const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

  useEffect(() => {
    fetchOrders()
      .then(response => {
        const orders = response.data;
        setTotalOrders(orders.length);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  }, []);


  return (
    <StateContext.Provider value={{ currentColor, currentMode, activeMenu, screenSize, setScreenSize, handleClick, isClicked, initialState, setIsClicked, setActiveMenu, setMode, setColor, themeSettings, setThemeSettings, totalOrders,categories, setCategories, search, setSearch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);