import React, { useState, useEffect } from 'react';
import { MdOutlineTableRestaurant } from "react-icons/md";
import { fetchTables } from '../services/tableDataFetch';
import { Header } from '../Components/AdminComponents';
import { tableColors } from '../data/data';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTables()
      .then(response => setTables(response.data))
      .catch(error => console.error("Error fetching tables:", error));
  }, []);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  // Function to format the date and time (Used help from Chat GPT :))
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out ">
      <Header title="Tables" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table, index) => (
          <div
            key={index}
            className="e-card e-card-horizontal rounded-lg shadow-lg overflow-hidden flex items-center bg-white p-4" 
            style={{ backgroundColor: tableColors[index % tableColors.length] }}
            onClick={() => handleTableClick(table)}
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog Popup with all the info from the API */}
      {selectedTable && (
        <DialogComponent
          style={{
            borderRadius: '10px', overflow: 'hidden' }}
          width='500px'
          height='400px'
          visible={isModalOpen}
          header={`Table ${selectedTable.tableNumber} Details`}
          close={() => setIsModalOpen(false)}
          showCloseIcon={true}
          animationSettings={{ effect: 'Zoom' }}
        >
          <div>
            <p><strong>Table Number:</strong> {selectedTable.tableNumber}</p>
            <p><strong>Capacity:</strong> {selectedTable.capacity}</p>
            <p><strong>Status:</strong> {selectedTable.status}</p>
            <p><strong>Orders:</strong> {selectedTable.orders}</p>
            <p><strong>Customers:</strong> {selectedTable.customers}</p>
            <p><strong>Occupied from:</strong> {formatDateTime(selectedTable.createdAt)}</p>
            <p><strong>Updated at:</strong> {formatDateTime(selectedTable.updatedAt)}</p>
          </div>
        </DialogComponent>
      )}
    </div>
  );
};

export default Tables;