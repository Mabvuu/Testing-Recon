// src/routes/managerRoutes.js
const express = require('express')
const router = express.Router()

const {
  addAccountManager,
  loginManager,
  listManagers,
  deleteManager,
  updateManager
} = require('../controller/managerController')  // <-- controllers (plural) folder

// GET    /manager             → returns all managers
router.get('/', listManagers)

// POST   /manager/register    → add new manager
router.post('/register', addAccountManager)

// POST   /manager/login       → manager login
router.post('/login', loginManager)

// PUT    /manager/:idNumber   → update by 7-digit ID
router.put('/:idNumber', updateManager)

// DELETE /manager/:idNumber   → delete by 7-digit ID
router.delete('/:idNumber', deleteManager)

module.exports = router
