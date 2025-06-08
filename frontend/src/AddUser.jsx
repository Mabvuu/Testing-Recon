import { useState } from 'react';
import axios from 'axios';

export default function AddUser({ token }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const submit = async () => {
    try {
      await axios.post(
        'http://localhost:3001/admin/add-user',
        { email, password: pass },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      alert('User added successfully!');
    } catch (err) {
      alert(err.response?.data || 'Error adding user');
    }
  };

  return (
    <div>
      <input
        placeholder="New email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setPass(e.target.value)}
      />
      <button onClick={submit}>Add User</button>
    </div>
  );
}
