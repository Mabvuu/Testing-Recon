// src/controllers/managerController.js
const db = require('../config/db')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || '2e569d7bba958cc72e273a9e2b9ac9056ddcb991d09f50cf8911ba5393ad712c';

// list all managers
exports.listManagers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, name, role, id_number FROM account_managers'
    )
    res.json(rows)
  } catch (err) {
    console.error('Error listing managers:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// register account manager
exports.addAccountManager = async (req, res) => {
  const { email, name } = req.body
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' })
  }

  try {
    let idNumber, exists
    do {
      idNumber = Math.floor(1_000_000 + Math.random() * 9_000_000).toString()
      const [rows] = await db.query(
        'SELECT 1 FROM account_managers WHERE id_number = ? LIMIT 1',
        [idNumber]
      )
      exists = rows.length > 0
    } while (exists)

    await db.query(
      'INSERT INTO account_managers (email, name, role, id_number) VALUES (?, ?, ?, ?)',
      [email, name, 'account_manager', idNumber]
    )

    res.status(201).json({
      message: 'Account manager added successfully!',
      id_number: idNumber
    })
  } catch (error) {
    console.error('Error adding manager:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// login account manager
exports.loginManager = async (req, res) => {
  const { email, idNumber } = req.body;
  if (!email || !idNumber) {
    return res.status(400).json({ error: 'Email and ID number required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email FROM account_managers WHERE email = ? AND id_number = ?',
      [email, idNumber]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const manager = rows[0];
    // **Generate a token**:
    const payload = { sub: manager.id, email: manager.email, is_admin: false };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // **Return the token**:
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// delete account manager
exports.deleteManager = async (req, res) => {
  const { idNumber } = req.params
  if (!idNumber) {
    return res.status(400).json({ error: 'Manager ID number is required' })
  }

  try {
    const [result] = await db.query(
      'DELETE FROM account_managers WHERE id_number = ?',
      [idNumber]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Manager not found' })
    }
    res.json({ message: 'Manager deleted successfully' })
  } catch (error) {
    console.error('Error deleting manager:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// update account manager
exports.updateManager = async (req, res) => {
  const { idNumber } = req.params
  const { email, name } = req.body
  if (!idNumber || (!email && !name)) {
    return res
      .status(400)
      .json({ error: 'ID number and at least one field (email or name) are required' })
  }

  try {
    const [result] = await db.query(
      'UPDATE account_managers SET email = ?, name = ? WHERE id_number = ?',
      [email || null, name || null, idNumber]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Manager not found' })
    }
    res.json({ message: 'Manager updated successfully' })
  } catch (error) {
    console.error('Error updating manager:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
