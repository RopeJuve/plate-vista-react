import Logo from "../../data/mainlogoDark.svg";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSearch } from "react-icons/bs";
import { useState } from "react";
import TableIcon from "./TableIcon";

const NavBarCustomer = ({ tableNum, connectionStatus}) => {
  const [search, setSearch] = useState("");
  return (
    <>
      <div className="px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={Logo} style={{ width: "200px", height: "100px" }} />
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
      </div>
    </>
  );
};

export default NavBarCustomer;
