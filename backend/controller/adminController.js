// src/controllers/managerController.js
const db = require('../config/db');

exports.addAccountManager = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    // 1) generate a unique 7-digit ID number
    let idNumber;
    let exists = true;
    while (exists) {
      idNumber = Math.floor(1_000_000 + Math.random() * 9_000_000).toString(); 
      const [rows] = await db.query(
        'SELECT 1 FROM account_managers WHERE id_number = ? LIMIT 1',
        [idNumber]
      );
      exists = rows.length > 0;
    }

    // 2) insert with role = 'account_manager'
    const query = `
      INSERT INTO account_managers (email, name, role, id_number)
      VALUES (?, ?, 'account_manager', ?)
    `;
    await db.query(query, [email, name, idNumber]);

    // 3) return the generated ID
    res.status(201).json({
      message: 'Account manager added successfully!',
      id_number: idNumber
    });
  } catch (error) {
    console.error('Error adding manager:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
