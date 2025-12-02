const {
    getPapers,
    searchPapersByQuery,
    getPaperByIdWithDetails,
    getPopularPapers: getPopularPapersModel,
    getPapersByFieldId
} = require('../models/paperModel')

// Get all papers with optional filters
const getAllPapers = async (req, res) => {
    try {
        const { field, rating, year, sortBy, page = 1, limit = 12 } = req.query
        
        const offset = (parseInt(page) - 1) * parseInt(limit)
        
        const filters = {
            field,
            rating,
            year,
            sortBy,
            limit: parseInt(limit),
            offset
        }
        
        const papers = await getPapers(filters)
        
        res.json({
            success: true,
            data: papers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: papers.length === parseInt(limit)
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Search papers
const searchPapers = async (req, res) => {
    try {
        const { q, field, rating, year, sortBy, page = 1, limit = 12 } = req.query
        
        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            })
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit)
        
        const filters = {
            field,
            rating,
            year,
            sortBy,
            limit: parseInt(limit),
            offset
        }
        
        const papers = await searchPapersByQuery(q, filters)
        
        res.json({
            success: true,
            data: papers,
            query: q,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: papers.length === parseInt(limit)
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Get paper by ID
const getPaperById = async (req, res) => {
    try {
        const paperId = req.params.id
        
        console.log('Fetching paper with ID:', paperId) // للـ debugging
        
        if (!paperId || isNaN(paperId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid paper ID'
            })
        }
        
        const paper = await getPaperByIdWithDetails(parseInt(paperId))
        
        if (!paper) {
            return res.status(404).json({
                success: false,
                message: 'Paper not found'
            })
        }
        
        res.json({
            success: true,
            data: paper
        })
    } catch (err) {
        console.error('Error in getPaperById:', err) // للـ debugging
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Get popular papers
const getPopularPapers = async (req, res) => {
    try {
        const { limit = 10 } = req.query
        
        const papers = await getPopularPapersModel(parseInt(limit))
        
        res.json({
            success: true,
            data: papers
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Get papers by field
const getPapersByField = async (req, res) => {
    try {
        const fieldId = req.params.fieldId
        
        if (!fieldId || isNaN(fieldId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid field ID'
            })
        }
        
        const papers = await getPapersByFieldId(parseInt(fieldId))
        
        res.json({
            success: true,
            data: papers
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    getAllPapers,
    searchPapers,
    getPaperById,
    getPopularPapers,
    getPapersByField
}