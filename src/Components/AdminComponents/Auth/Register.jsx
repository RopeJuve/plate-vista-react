import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import api from '../../../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('bar');
  const [error, setError] = useState('');
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
      setError('');
      const employeeData = {
        employee: username,
        email: email,
        password: password,
        position: position,
      };
  
      try {
        const response = await api.post('/employee', employeeData);
        navigate('/admin/Employees');
        return response;
      } catch (error) {
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Add Staff</h2>
        {error && (
          <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-center text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

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
          <Link to="/admin/Employees" className="text-dark-yellow-bg hover:underline">Back to employees</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
