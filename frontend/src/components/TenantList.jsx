// src/components/TenantList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TenantList = ({ tenants, addTenant, removeTenant }) => {
  const [posIdInput, setPosIdInput] = useState('');
  const [tenantName, setTenantName] = useState('');

  const handleAddTenant = () => {
    const posId = posIdInput.trim();
    const name = tenantName.trim();
    if (posId && name) {
      addTenant({
        posId,
        name,
        dateAdded: new Date().toLocaleDateString(),
      });
      setPosIdInput('');
      setTenantName('');
    }
  };

  return (
    <div className="pt-29 px-4  mx-auto">
      {/* Add Tenant Form */}
      <div className="bg-white shadow-sm rounded p-6 mb-8">
        <h3 className="text-xl text-gray-700 mb-4">Add New Agent</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="POS ID"
            value={posIdInput}
            onChange={(e) => setPosIdInput(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Agent Name"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={handleAddTenant}
            className="w-full bg-[#808000] text-white rounded px-4 py-2 hover:bg-gray-700 transition"
          >
            Add Agent
          </button>
        </div>
      </div>

      {/* Tenant Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-gray-700">
          <thead>
            <tr>
              <th className="border-b border-gray-300 py-2 text-left text-base">
                Agent Name
              </th>
              <th className="border-b border-gray-300 py-2 text-left text-base">
                POS ID
              </th>
              <th className="border-b border-gray-300 py-2 text-left text-base">
                Date Added
              </th>
              <th className="border-b border-gray-300 py-2 text-left text-base">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, idx) => (
              <tr key={`${tenant.posId}-${tenant.dateAdded}-${idx}`}>
                <td className="border-b border-gray-200 py-2">
                  <Link
                    to={`/cashbook/${tenant.posId}`}
                    state={{ name: tenant.name }}
                    className="text-black hover:underline font-normal"
                  >
                    {tenant.name}
                  </Link>
                </td>
                <td className="border-b border-gray-200 py-2">{tenant.posId}</td>
                <td className="border-b border-gray-200 py-2">
                  {tenant.dateAdded}
                </td>
                <td className="border-b border-gray-200 py-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this tenant?')) {
                        removeTenant(tenant.posId);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-4 text-center text-gray-500 font-normal"
                >
                  No Agents added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantList;
