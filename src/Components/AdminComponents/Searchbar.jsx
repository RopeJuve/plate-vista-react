import React, { useState } from "react";
import { fetchEmployees } from "../../services/employeeDataFetch";
import { MdOutlineCancel } from 'react-icons/md';
import { Button } from '../AdminComponents/';
import { useStateContext } from "../../contexts/ContextProvider";

const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const { currentColor, setIsClicked, initialState } = useStateContext();

  const handleSearchChange = (e) => {
    const requirement = e.target.value;
    setSearchTerm(requirement);

    fetchEmployees().then((response) => {
      const employees = response.data;

      const filteredResults = employees.filter((employee) =>
        employee.employee.toLowerCase().includes(requirement.toLowerCase()) ||
        employee.email.toLowerCase().includes(requirement.toLowerCase()) ||
        employee.position.toLowerCase().includes(requirement.toLowerCase())
      );

      setFilteredEmployees(filteredResults);
    });
  };

  const handleCancel = () => {
    setIsClicked(initialState);
    setSearchTerm("");
    setFilteredEmployees([]);
  };

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-lg dark:text-gray-200">Employee Search</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
          onClick={handleCancel}
        />
      </div>
      
      <input
        type="text"
        className="search-input w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        placeholder="Search by name, email, or position"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="search-results max-h-60 overflow-auto">
        {filteredEmployees.length > 0 ? (
          <ul>
            {filteredEmployees.map((employee) => (
              <li
                key={employee._id}
                className="p-3 border-b border-color dark:hover:bg-[#42464D] hover:bg-light-gray cursor-pointer"
              >
                {employee.employee} - {employee.email} - {employee.position}
              </li>
            ))}
          </ul>
        ) : (
          searchTerm && <p className="text-gray-500 dark:text-gray-400">No results found</p>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
