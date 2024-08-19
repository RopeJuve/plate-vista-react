import React from 'react';
import { NavLink } from 'react-router-dom';

function MenuNav() {
    return (
        <nav className="bg-gray-300 dark:bg-gray-800 p-4">
            <ul className="flex space-x-11 justify-start pt-10 pl-5 pr-20">
                <li>
                    <NavLink 
                        to="/main-dish" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Main Dish
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/family-style-meals" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Family-Style Meals
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/appetizers" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Appetizers
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/classic-entrees" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Classic Entrees
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/amazing-alfredos" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Amazing Alfredos
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/soups-salads-breadsticks" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Soups, Salads & Breadsticks
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/drinking" 
                        className="text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300 ease-in-out"
                    >
                        Drinking
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default MenuNav;
