import React, { useState } from "react";
import LoginModal from "./LoginModal";
import "./ToggleSwitch.css"; // Ensure you have your CSS for the toggle switch

function Header({ toggleDarkMode, isDarkMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="bg-gray-200 dark:bg-gray-800 pt-10 pl-5 pr-5 shadow-md flex justify-between items-center">
      <div className="flex items-center space-x-2">
        {/* Logo Image */}
        <img src="/logo.png" alt="Restaurant Logo" className="w-20 h-20" />

        {/* Brand Identity */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <a href="/">platevista</a>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Deliciousness delivered</p>
        </div>
      </div>
      
      {/* Other Elements in Header */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button className="absolute right-2 top-2 text-gray-500 dark:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <a href="/about" className="text-gray-900 dark:text-white hover:text-orange-500">About Us</a>
        <a href="/contact" className="text-gray-900 dark:text-white hover:text-orange-500">Contact Us</a>

        {/* Login Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-orange-500 dark:text-orange-400 hover:text-orange-600"
        >
          Login
        </button>

        {/* Dark Mode Toggle */}
        <div className="toggle-switch" onClick={toggleDarkMode}>
          <input type="checkbox" checked={isDarkMode} readOnly />
          <span className="slider"></span>
        </div>
      </div>

      {/* Login Modal */}
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </header>
  );
}

export default Header;
