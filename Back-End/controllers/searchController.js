const {
    createSearchLog,
    getSearchHistory: getSearchHistoryModel,
    getPopularSearches
} = require('../models/searchModel')

// Log a search query
const logSearch = async (req, res) => {
    try {
        const { query } = req.body
        const userId = req.user.id
        const userRole = req.user.role
        
        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            })
        }
        
        // Only log searches for researchers
        if (userRole !== 'Researcher') {
            return res.status(403).json({
                success: false,
                message: 'Only researchers can log searches'
            })
        }
        
        const searchLog = await createSearchLog(userId, query.trim())
        
        res.json({
            success: true,
            data: searchLog
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Get user search history
const getUserSearchHistory = async (req, res) => {
    try {
        const userId = req.user.id
        const userRole = req.user.role
        const { limit = 20 } = req.query
        
        // Only researchers have search history
        if (userRole !== 'Researcher') {
            return res.status(403).json({
                success: false,
                message: 'Only researchers have search history'
            })
        }
        
        const history = await getSearchHistoryModel(userId, parseInt(limit))
        
        res.json({
            success: true,
            data: history
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    logSearch,
    getUserSearchHistory
}