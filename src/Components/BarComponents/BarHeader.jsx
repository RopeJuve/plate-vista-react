import React from "react";
import { IoRestaurantOutline } from "react-icons/io5";

const BarHeader = () => {
  return (
    <div className="max-w-3xl mx-auto  text-gray-100 bg-secondary-dark-bg flex justify-between items-center p-3 rounded-lg">
      <div className="flex space-x-2 items-center font-bold text-2xl">
        <IoRestaurantOutline /> <span>platevista</span>
      </div>
      <h1 className="text-2xl font-semibold">Robert</h1>
      <button className="text-red-500 cursor-pointer">Logout</button>
    </div>
  );
};

export default BarHeader;
