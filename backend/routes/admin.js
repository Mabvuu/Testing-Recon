const express = require('express');
const { addAccountManager } = require('../controller/adminController');

const router = express.Router();

// Route to add a new account manager
router.post('/add-manager', addAccountManager);

module.exports = router;
