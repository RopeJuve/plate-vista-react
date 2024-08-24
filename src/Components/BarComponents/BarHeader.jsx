import React from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { useAuth } from "../../contexts/AuthContext";

const BarHeader = () => {
  const { logout, user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto  text-gray-100 bg-secondary-dark-bg flex justify-between items-center p-3 rounded-lg">
      <div className="flex space-x-2 items-center font-bold text-2xl">
        <IoRestaurantOutline /> <span>platevista</span>
      </div>
      <h1 className="text-2xl font-semibold uppercase">{user}</h1>
      <button onClick={() => logout()} className="text-red-500 cursor-pointer">
        Logout
      </button>
    </div>
  );
};

export default BarHeader;
