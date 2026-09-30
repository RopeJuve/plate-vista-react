import React, { createContext, useContext, useState } from "react";

type ClickedState = {
  userProfile: boolean;
  notification: boolean;
  search: boolean;
};

type StateContextValue = {
  activeMenu: boolean;
  screenSize: number | undefined;
  setScreenSize: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleClick: (clicked: keyof ClickedState) => void;
  isClicked: ClickedState;
  initialState: ClickedState;
  setIsClicked: React.Dispatch<React.SetStateAction<ClickedState>>;
  setActiveMenu: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [search, setSearch] = useState("");

  const handleClick = (clicked: keyof ClickedState) =>
    setIsClicked({ ...initialState, [clicked]: true });

  return (
    <StateContext.Provider
      value={{
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick,
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
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
