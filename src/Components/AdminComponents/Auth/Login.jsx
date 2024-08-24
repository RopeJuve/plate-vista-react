import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const response = await axios.post(`${import.meta.env.VITE_VERCEL_API_URL}/auth/employee/login`, {
        employee: username,
        password: password,
      });

      if (response.status === 200) {
        const authHeader = response.headers.get("authorization");
        const token = authHeader.split(" ")[1];
        login(token, response.data.position);
        if (response.data.position === "admin") {
          navigate("/admin/overview");
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
    <div className="flex items-center justify-center min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <form 
        onSubmit={handleLogin} 
        className="bg-white dark:bg-secondary-dark-bg p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Login</h2>
        
        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Username</label>
          <input
            type="text"
            name="employee"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Password</label>
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
        
        <p className="mt-6 text-gray-600 dark:text-gray-300 text-center">
          Don't have an account? <Link to="/register" className="text-dark-yellow-bg hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
