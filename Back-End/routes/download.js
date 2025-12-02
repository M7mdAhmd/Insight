const express = require('express')
const router = express.Router()
const {
    logDownload,
    getDownloadHistory,
    checkDownloadStatus
} = require('../controllers/downloadController')
const { protect } = require('../middleware/auth')

// Log a download (protected - requires authentication)
router.post('/paper/:paperId', protect, logDownload)

// Get user download history (protected)
router.get('/history', protect, getDownloadHistory)

// Check if user has downloaded a paper (protected)
router.get('/status/:paperId', protect, checkDownloadStatus)

module.exports = router