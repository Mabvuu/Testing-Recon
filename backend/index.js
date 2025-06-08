require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const managerRoutes = require('./routes/managerRoutes');
const reportsRouter = require('./routes/Reports');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('Database connected!');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1);
  }
})();

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/api/reports', reportsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
