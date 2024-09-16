import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Table1 from "../../../data/QrCodes/table-1-qr-code.png";
import Table2 from "../../../data/QrCodes/table-2-qr-code.png";
import Table3 from "../../../data/QrCodes/table-3-qr-code.png";
import Table4 from "../../../data/QrCodes/table-4-qr-code.png";
import Table5 from "../../../data/QrCodes/table-5-qr-code.png";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_VERCEL_API_URL}/auth/employee/login`,
        {
          employee: username,
          password: password,
        }
      );

      if (response.status === 200) {
        const authHeader = response.headers.get("authorization");
        const token = authHeader.split(" ")[1];
        login(token, response.data.position);
        if (response.data.position === "admin") {
          navigate("/admin");
        } else if (
          response.data.position === "bar" ||
          response.data.position === "kitchen"
        ) {
          navigate("/bar");
        }
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="md:flex items-center md:gap-[10rem] max-w-screen-lg mx-auto min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-secondary-dark-bg p-8 rounded-2xl shadow-md w-96 mx-auto md:w-[50%]"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Login
        </h2>

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="employee"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-dark-yellow-bg hover:bg-yellow-600 text-white py-3 px-6 rounded-md w-full"
        >
          Login
        </button>
        <button
          type="button"
          className="bg-dark-yellow-bg hover:bg-yellow-600 text-white py-3 px-6 rounded-md w-full mt-2"
          onClick={() => {
            setUsername("Admin 1");
            setPassword("admin");
          }}
        >
          Login as Admin
        </button>
        <button
          type="button"
          className="bg-dark-yellow-bg hover:bg-yellow-600 text-white py-3 px-6 rounded-md w-full mt-2"
          onClick={() => {
            setUsername("Bartender");
            setPassword("1234567");
          }}
        >
          Login as Bar
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-dark-yellow-bg hover:underline">
            Register
          </Link>
        </p>
      </form>
      <div className="bg-white dark:bg-secondary-dark-bg py-9 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Scan QR Code
        </h2>
        <div className="flex flex-wrap justify-center">
          <div className="text-center font-semibold">
            <h3>Table 1</h3>
            <img src={Table1} alt="Table 1 QR Code" className="w-30 h-30" />
          </div>
          <div className="text-center font-semibold">
            <h3>Table 2</h3>
            <img src={Table2} alt="Table 2 QR Code" className="w-30 h-30" />
          </div>
          <div className="text-center font-semibold">
            <h3>Table 3</h3>
            <img src={Table3} alt="Table 3 QR Code" className="w-30 h-30" />
          </div>
          <div className="text-center font-semibold">
            <h3>Table 4</h3>
            <img src={Table4} alt="Table 4 QR Code" className="w-30 h-30" />
          </div>
          <div className="text-center font-semibold">
            <h3>Table 5</h3>
            <img src={Table5} alt="Table 5 QR Code" className="w-30 h-30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
