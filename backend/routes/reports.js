const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.post('/upload', async (req, res) => {
  const { name, posId, date, source, tableData } = req.body;
  if (!Array.isArray(tableData)) {
    return res.status(400).json({ message: 'Invalid or missing tableData' });
  }
  const sql = `
    INSERT INTO reports
      (name, posId, date, source, table_data)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [name, posId, date, source, JSON.stringify(tableData)];
  try {
    const [result] = await db.query(sql, params);
    res.status(200).json({
      message: 'Report saved successfully',
      reportId: result.insertId,
      name,
      posId,
      date,
      source
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, posId, date, source FROM reports ORDER BY date DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

module.exports = router;
