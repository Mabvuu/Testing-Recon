// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/admin'; // axios instance, baseURL = http://localhost:3001

const AdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [managers, setManagers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    axios
      .get('/manager')
      .then(res => setManagers(res.data))
      .catch(() => {});
  }, []);

  const handleAddOrEdit = async () => {
    setMessage('');
    setError('');
    if (!email.trim() || !name.trim()) {
      return setError('Name and email are required.');
    }
    if (editIndex === null && managers.some(m => m.email === email)) {
      return setError('Email already in use.');
    }

    try {
      if (editIndex !== null) {
        const mgr = managers[editIndex];
        await axios.put(`/manager/${mgr.id_number}`, { email, name });
        setManagers(ms =>
          ms.map((m, i) => (i === editIndex ? { ...m, email, name } : m))
        );
        setMessage('Manager updated.');
      } else {
        const res = await axios.post('/manager/register', { email, name });
        setManagers(ms => [
          ...ms,
          { email, name, id_number: res.data.id_number },
        ]);
        setMessage('Manager added.');
      }
      setEmail('');
      setName('');
      setEditIndex(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  const handleDelete = async idNumber => {
    setMessage('');
    setError('');
    try {
      await axios.delete(`/manager/${idNumber}`);
      setManagers(ms => ms.filter(m => m.id_number !== idNumber));
      setMessage('Manager removed.');
    } catch {
      setError('Delete failed.');
    }
  };

  const startEdit = i => {
    const m = managers[i];
    setEditIndex(i);
    setName(m.name);
    setEmail(m.email);
    setMessage('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Form Section */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl text-gray-800 mb-4">
            {editIndex !== null ? 'Edit Manager' : 'Add New Manager'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleAddOrEdit}
              className="mt-2 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition"
            >
              {editIndex !== null ? 'Update' : 'Add'}
            </button>
            {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
          </div>
        </section>

        {/* Managers List */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl text-gray-800 mb-4">Account Managers</h2>
          {managers.length === 0 ? (
            <p className="text-gray-600">No managers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-gray-800">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left border-b border-gray-200">
                      Name
                    </th>
                    <th className="py-2 px-3 text-left border-b border-gray-200">
                      Email
                    </th>
                    <th className="py-2 px-3 text-left border-b border-gray-200">
                      ID Number
                    </th>
                    <th className="py-2 px-3 text-left border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((m, i) => (
                    <tr key={`${m.id_number}-${i}`}>
                      <td className="py-2 px-3 border-b border-gray-100">
                        {m.name}
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        {m.email}
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        {m.id_number}
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100 space-x-2">
                        <button
                          onClick={() => startEdit(i)}
                          className="text-sm text-green-600 hover:underline focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id_number)}
                          className="text-sm text-red-600 hover:underline focus:outline-none"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
