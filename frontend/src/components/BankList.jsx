import React, { useState } from 'react';
import Navbar from './Navbarr';
import AdminNav from '../components/AdminNav';

const BankList = ({ banks, addBank, deleteBank, isAccountManager }) => {
  const [newBankName, setNewBankName] = useState('');

  const handleAddBank = (e) => {
    e.preventDefault();
    if (!newBankName.trim()) return;
    addBank(newBankName.trim());
    setNewBankName('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAccountManager ? <Navbar /> : <AdminNav />}
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-6">Bank List</h1>
        <form onSubmit={handleAddBank} className="flex mb-6">
          <input
            type="text"
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            placeholder="Enter bank name"
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
          />
          <button
            type="submit"
            className="ml-2 bg-[#808000] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Add Bank
          </button>
        </form>
        <ul className="list-none space-y-4">
          {banks.map((bank) => (
            <li
              key={bank.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
            >
              <a
                href={`/banks/${bank.id}`}
                className="text-gray-800 hover:underline"
              >
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    POS ID: {bank.posId}
                  </div>
                  <div className="text-lg font-semibold">
                    {bank.name}
                  </div>
                </div>
              </a>
              <button
                onClick={() => deleteBank(bank.id)}
                className="bg-red-500 hover:bg-[#808000] text-white font-bold py-1 px-3 rounded-lg"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BankList;
