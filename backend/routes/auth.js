// routes/auth.js
require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()

const { ALLOWED_EMAIL, ALLOWED_PASSWORD_HASH, SECRET } = process.env

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (email !== ALLOWED_EMAIL) 
    return res.status(403).send('Unauthorized email')

  const valid = await bcrypt.compare(password, ALLOWED_PASSWORD_HASH)
  if (!valid) 
    return res.status(401).send('Wrong password')

  const token = jwt.sign(
    { email, is_admin: true },  // set is_admin: true for your allowed admin
    SECRET
  )
  res.json({ token })
})

module.exports = router
