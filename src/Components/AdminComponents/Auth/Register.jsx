import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (password) {
      const employeeData = {
        employee: username,
        email: email,
        password: password,
        position: 'bar',
      };
  
      try {
        const response = await axios.post(`${import.meta.env.VITE_RENDER_API_URL}/employee`, employeeData);
        console.log('Registration successful:', response.data);
         navigate('/admin/login');
         
      } catch (error) {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <form 
        onSubmit={handleRegister} 
        className="bg-white dark:bg-secondary-dark-bg p-6 rounded shadow-md w-400"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Register</h2>

        <div className="mb-4">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Username</label>
          <input
            type="text"
            className="border border-color p-2 w-full dark:bg-main-dark-bg dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Email</label>
          <input
            type="email"
            className="border border-color p-2 w-full dark:bg-main-dark-bg dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Password</label>
          <input
            type="password"
            className="border border-color p-2 w-full dark:bg-main-dark-bg dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded w-full">
          Register
        </button>
        
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Already have an account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
