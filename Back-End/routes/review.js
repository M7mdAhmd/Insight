const express = require('express')
const router = express.Router()
const {
    getPaperReviews,
    addReview,
    modifyReview,
    removeReview
} = require('../controllers/reviewController')
const { protect } = require('../middleware/auth')

// Get reviews for a paper (public)
router.get('/paper/:paperId', getPaperReviews)

// Add a review (protected - requires authentication)
router.post('/paper/:paperId', protect, addReview)

// Update a review (protected)
router.put('/:reviewId', protect, modifyReview)

// Delete a review (protected)
router.delete('/:reviewId', protect, removeReview)

module.exports = router