import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('bar');
  const navigate = useNavigate();

  // useEffect(() => {
  //   setUsername('');
  //   setEmail('');
  //   setPassword('');
  //   setPosition('bar');
  // }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (password) {
      const employeeData = {
        employee: username,
        email: email,
        password: password,
        position: position,
      };
  
      try {
        console.log(employeeData);
        const response = await axios.post(`${import.meta.env.VITE_VERCEL_API_URL}/employee`, employeeData);
        console.log('Registration successful:', response.data); 
        navigate('/');
         
      } catch (error) {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
      }
    }
  };

  // Data for the dropdown
  const positionData = [
    { text: 'Bar', value: 'bar' },
    { text: 'Kitchen', value: 'kitchen' }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <form 
        onSubmit={handleRegister} 
        className="bg-white dark:bg-secondary-dark-bg p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Register</h2>

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Username</label>
          <input
            type="text"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Email</label>
          <input
            type="email"
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className="mb-6">
          <label className="block mb-2 text-gray-600 dark:text-gray-300">Position</label>

          {/* Syncfusion DropDownListComponent for selecting position */}
          <DropDownListComponent
            id="position"
            dataSource={positionData}
            fields={{ text: 'text', value: 'value' }}
            placeholder="Select a position"
            value={position}
            change={(e) => setPosition(e.value)}
            className="border border-color p-3 w-full rounded-md dark:bg-main-dark-bg dark:text-gray-100"
          />
        </div>

        <button 
          type="submit" 
          className="bg-dark-yellow-bg hover:bg-yellow-600 text-white py-3 px-6 rounded-md w-full"
        >
          Register
        </button>
        
        <p className="mt-6 text-gray-600 dark:text-gray-300 text-center">
          Already have an account? <Link to="/" className="text-dark-yellow-bg hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
