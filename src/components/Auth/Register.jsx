import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: Add registration logic here
    if (password === confirmPassword) {
      console.log('Register:', { username, email, password });
      navigate('/overview'); // Redirect to Dashboard after registration 
      // navigate('/login'); // Redirect to Login after registration, Which one of these two should we use?
    } else {
      alert('Passwords do not match!');
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

        <div className="mb-4">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Confirm Password</label>
          <input
            type="password"
            className="border border-color p-2 w-full dark:bg-main-dark-bg dark:text-gray-100"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
