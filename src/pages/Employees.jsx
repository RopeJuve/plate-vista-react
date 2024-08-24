import React, { useState, useEffect } from "react";
import {
  GridComponent,
  Inject,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Search,
  Page,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import { Header } from "../components/AdminComponents";
import { fetchEmployees } from "../services/employeeDataFetch";
import { useNavigate } from "react-router-dom";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { useStateContext } from "../contexts/ContextProvider";

const Employees = () => {
  const { currentColor } = useStateContext();
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees()
      .then((response) => {
        // to check if the data is coming from the API
        console.log("API response data:", response.data);

        const transformedEmployees = response.data.map((employee) => ({
          employeeId: 1234567, // Hardcoded for now
          employee: employee.employee,
          email: employee.email,
          position: employee.position,
        }));
        setEmployees(transformedEmployees);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });
  }, []);

  const toolbarOptions = ["Search"];

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-d-main-bg rounded-3xl">
      <Header title="Employees" />

      <div className="mt-2 flex justify-between mb-2">
        <button
          className="e-btn e-outline"
          onClick={() => navigate("/register")}
          style={{
            borderColor: currentColor,
            color: currentColor,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = currentColor;
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = currentColor;
          }}
        >
          Add New Employee
        </button>
      </div>
      <GridComponent
        dataSource={employees}
        allowPaging
        allowSorting
        toolbar={toolbarOptions}
        width="auto"
        style={{ backgroundColor: currentColor }}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="employeeId"
            headerText="Employee ID"
            width="150"
            textAlign="Center"
          />
          <ColumnDirective
            field="employee"
            headerText="Employee"
            width="200"
            textAlign="Center"
          />
          <ColumnDirective
            field="email"
            headerText="Email"
            width="250"
            textAlign="Center"
          />
          <ColumnDirective
            field="position"
            headerText="Position"
            width="150"
            textAlign="Center"
          />
        </ColumnsDirective>
        <Inject services={[Search, Page, Sort, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default Employees;
