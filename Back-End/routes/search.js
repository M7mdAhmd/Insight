const express = require('express')
const router = express.Router()
const { logSearch, getUserSearchHistory } = require('../controllers/searchController')
const { protect } = require('../middleware/auth')

// Log a search (protected - requires authentication)
router.post('/log', protect, logSearch)

// Get user search history (protected)
router.get('/history', protect, getUserSearchHistory)

module.exports = router