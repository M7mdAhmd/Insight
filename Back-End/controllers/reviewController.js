const {
    getReviewsByPaperId,
    createReview,
    updateReview,
    deleteReview
} = require('../models/reviewModel')

// Get reviews for a paper
const getPaperReviews = async (req, res) => {
    try {
        const paperId = req.params.paperId
        
        if (!paperId || isNaN(paperId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid paper ID'
            })
        }
        
        const reviews = await getReviewsByPaperId(parseInt(paperId))
        
        res.json({
            success: true,
            data: reviews
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Create a review
const addReview = async (req, res) => {
    try {
        const paperId = req.params.paperId
        const { rating } = req.body
        const userId = req.user.id
        const userRole = req.user.role
        
        if (!paperId || isNaN(paperId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid paper ID'
            })
        }
        
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            })
        }
        
        // Only researchers can review
        if (userRole !== 'Researcher') {
            return res.status(403).json({
                success: false,
                message: 'Only researchers can submit reviews'
            })
        }
        
        const review = await createReview(parseInt(paperId), userId, parseInt(rating))
        
        res.status(201).json({
            success: true,
            data: review,
            message: 'Review submitted successfully'
        })
    } catch (err) {
        if (err.message.includes('already reviewed')) {
            res.status(400).json({
                success: false,
                message: err.message
            })
        } else {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }
}

// Update a review
const modifyReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId
        const { rating } = req.body
        
        if (!reviewId || isNaN(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            })
        }
        
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            })
        }
        
        const review = await updateReview(parseInt(reviewId), parseInt(rating))
        
        res.json({
            success: true,
            data: review,
            message: 'Review updated successfully'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Delete a review
const removeReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId
        const userId = req.user.id
        
        if (!reviewId || isNaN(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            })
        }
        
        await deleteReview(parseInt(reviewId), userId)
        
        res.json({
            success: true,
            message: 'Review deleted successfully'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    getPaperReviews,
    addReview,
    modifyReview,
    removeReview
}