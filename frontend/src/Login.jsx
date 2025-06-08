// src/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken, setIsAdmin }) {
  const [view, setView] = useState('admin'); // 'admin' or 'manager'

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [managerEmail, setManagerEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const navigate = useNavigate();

  const submitAdmin = async () => {
    try {
      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/auth/login`,
  {
    email: adminEmail,
    password: adminPassword
  }
);

      setToken(res.data.token);
      const payload = JSON.parse(atob(res.data.token.split('.')[1]));
      setIsAdmin(payload.is_admin);
      // after successful admin login, go to AdminDashboard:
      navigate('/add');
    } catch (err) {
      alert(err.response?.data || 'Admin login failed');
    }
  };

  const submitManager = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/manager/login`,
        { email: managerEmail, idNumber }
      );
      setToken(res.data.token);
      setIsAdmin(false);
      navigate('/tenants');
    } catch (err) {
      alert(err.response?.data?.error || 'Manager login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] text-gray-700">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setView('admin')}
          className={`px-4 py-2 rounded-md font-semibold border border-white ${
            view === 'admin' ? 'bg-[#0f2f03] text-white' : 'bg-[#808000] text-white'
          }`}
        >
          ADMIN
        </button>
        <button
          onClick={() => setView('manager')}
          className={`px-4 py-2 rounded-md font-semibold border border-white ${
            view === 'manager' ? 'bg-[#0f2f03] text-white' : 'bg-[#808000] text-white'
          }`}
        >
          ACCOUNT MANAGER
        </button>
      </div>

      {view === 'admin' && (
        <div className="w-full max-w-sm bg-[#808000] rounded-lg shadow-md p-6">
          <div className="flex justify-center mb-6">
           <img src="/Testing-Recon/images/logo1.png" alt="Logo" className="h-42 w-42 "/> </div>
           
          <h1 className="text-2xl font-bold text-center mb-6 text-[#ffffff]">
            ADMIN LOGIN
          </h1>
          <div className="mb-4">
            <label htmlFor="adminEmail" className="block mb-2 text-m text-white">
              Email
            </label>
            <input
              id="adminEmail"
              type="email"
              placeholder="Enter your email"
              onChange={e => setAdminEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="adminPassword" className="block mb-2 text-m text-white">
              Password
            </label>
            <input
              id="adminPassword"
              type="password"
              placeholder="Enter your password"
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
            />
          </div>
          <button
            onClick={submitAdmin}
            className="w-full bg-[#ffffff] text-[#6B8E23] py-2 rounded-md hover:bg-[#556B2F] transition-colors"
          >
            LOGIN
          </button>
        </div>
      )}

      {view === 'manager' && (
        <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center mb-6">
           <img src="/Testing-Recon/images/logo1.png" alt="Logo" className="h-42 w-42 "/> </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-[#6B8E23]">
            ACCOUNT MANAGER LOGIN
          </h1>
          <div className="mb-4">
            <label htmlFor="managerEmail" className="block mb-2 text-m text-gray-700">
              Email
            </label>
            <input
              id="managerEmail"
              type="email"
              placeholder="Enter your email"
              onChange={e => setManagerEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="idNumber" className="block mb-2 text-m text-gray-700">
              ID Number
            </label>
            <input
              id="idNumber"
              type="text"
              placeholder="Enter your ID number"
              onChange={e => setIdNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
            />
          </div>
          <button
            onClick={submitManager}
            className="w-full bg-[#6B8E23] text-white py-2 rounded-md hover:bg-[#556B2F] transition-colors"
          >
            LOGIN
          </button>
        </div>
      )}
    </div>
  );
}
