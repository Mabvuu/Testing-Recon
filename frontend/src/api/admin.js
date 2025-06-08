import axios from 'axios';

const adminAPI = axios.create({
  baseURL: 'http://localhost:3001', // Hardcoded base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default adminAPI;
