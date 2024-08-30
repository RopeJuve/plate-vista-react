import React, { useState, useEffect } from 'react';
import { MdOutlineTableRestaurant } from "react-icons/md";
import { fetchTables } from '../services/tableDataFetch';
import { Header } from '../Components/AdminComponents';

const Tables = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetchTables()
      .then(response => setTables(response.data))
      .catch(error => console.error("Error fetching tables:", error));
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out ">
      <Header title="Tables" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table, index) => (
          <div
            key={index}
            className="e-card e-card-horizontal rounded-lg shadow-lg overflow-hidden flex items-center bg-white p-4"
          >
            <div className="flex-shrink-0 mr-4">
              <MdOutlineTableRestaurant size={40} className="text-gray-700" />
            </div>
            <div className="e-card-stacked">
              <div className="e-card-header">
                <div className="e-card-title font-bold">Table {table.tableNumber}</div>
              </div>
              <div className="e-card-content text-gray-600">
                <p>Capacity: {table.capacity}</p>
                <p>Status: {table.status}</p>
                <p>Order Status: Occupied</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tables;