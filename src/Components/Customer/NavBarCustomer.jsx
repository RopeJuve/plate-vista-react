import Logo from "../../data/mainlogoDark.svg";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSearch } from "react-icons/bs";

const NavBarCustomer = () => {
  return (
    <>
      <div className="px-6 flex items-center justify-between">
        <img src={Logo} style={{ width: "200px", height: "100px" }} />
        <div className="w-[1.5rem] h-[1.rem] cursor-pointer">
          <RxHamburgerMenu className="w-full h-full" />
        </div>
      </div>
      <div className="w-full px-6">
        <div className="flex items-center gap-2 border border-black rounded-xl p-2">
            <BsSearch className="w-6 h-6" />
            <input className="flex-grow outline-none" type="text" name="search" value="" placeholder="Search for meals"/>
        </div>
      </div>
    </>
  );
};

export default NavBarCustomer;
