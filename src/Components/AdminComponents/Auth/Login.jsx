import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // IMPORTANT: Do we need to add the authentication logic here?

    console.log('Login:', { email, password });
    navigate('/overview'); // Redirect to overview after login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <form 
        onSubmit={handleLogin} 
        className="bg-white dark:bg-secondary-dark-bg p-6 rounded shadow-md w-400"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Login</h2>
        
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
          Login
        </button>
        
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Don't have an account? <a href="/register" className="text-blue-500">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
