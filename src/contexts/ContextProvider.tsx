import React, { createContext, useContext, useState } from "react";

type ClickedState = {
  userProfile: boolean;
  notification: boolean;
  search: boolean;
};

type StateContextValue = {
  currentColor: string;
  currentMode: string;
  activeMenu: boolean;
  screenSize: number | undefined;
  setScreenSize: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleClick: (clicked: keyof ClickedState) => void;
  isClicked: ClickedState;
  initialState: ClickedState;
  setIsClicked: React.Dispatch<React.SetStateAction<ClickedState>>;
  setActiveMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setMode: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setColor: (color: string) => void;
  themeSettings: boolean;
  setThemeSettings: React.Dispatch<React.SetStateAction<boolean>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

const StateContext = createContext<StateContextValue | undefined>(undefined);

const initialState: ClickedState = {
  userProfile: false,
  notification: false,
  search: false,
};

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [screenSize, setScreenSize] = useState<number | undefined>(undefined);
  // The palette lives in index.css now; currentColor stays as the signal hex
  // for chart code that needs a literal color.
  const [currentColor, setCurrentColor] = useState("#FF6B1A");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const setMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMode(e.target.value);
    localStorage.setItem("themeMode", e.target.value);
    setThemeSettings(false);
  };

  const setColor = (color: string) => {
    setCurrentColor(color);
    localStorage.setItem("colorMode", color);
    setThemeSettings(false);
  };

  const handleClick = (clicked: keyof ClickedState) =>
    setIsClicked({ ...initialState, [clicked]: true });

  return (
    <StateContext.Provider
      value={{
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick,
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        categories,
        setCategories,
        search,
        setSearch,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a ContextProvider");
  }
  return context;
};
