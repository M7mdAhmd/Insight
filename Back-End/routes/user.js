const express = require('express')
const router = express.Router()
const { login, signup, getUserById } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

router.post('/login', login)
router.post('/signup', signup)
router.get('/:id', protect, getUserById)

module.exports = router
