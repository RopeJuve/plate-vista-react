import React, { useState } from "react";
import LoginModal from "./LoginModal";

function Header({ toggleDarkMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        <a href="/">platevista</a>
      </h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-orange-500 dark:text-orange-400"
        >
          Login
        </button>
        <button
          onClick={toggleDarkMode}
          className="text-gray-900 dark:text-white"
        >
          Toggle Dark Mode
        </button>
    </div>
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </header>
  );
}

export default Header;
