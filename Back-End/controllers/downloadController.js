const {
    createDownload,
    getUserDownloads,
    hasUserDownloaded
} = require('../models/downloadModel')

// Log a download
const logDownload = async (req, res) => {
    try {
        const paperId = req.params.paperId
        const userId = req.user.id
        const userRole = req.user.role
        
        if (!paperId || isNaN(paperId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid paper ID'
            })
        }
        
        // Only researchers can download
        if (userRole !== 'Researcher') {
            return res.status(403).json({
                success: false,
                message: 'Only researchers can download papers'
            })
        }
        
        const download = await createDownload(parseInt(paperId), userId)
        
        res.json({
            success: true,
            data: download,
            message: 'Download logged successfully'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Get user download history
const getDownloadHistory = async (req, res) => {
    try {
        const userId = req.user.id
        const userRole = req.user.role
        const { limit = 50 } = req.query
        
        // Only researchers have download history
        if (userRole !== 'Researcher') {
            return res.status(403).json({
                success: false,
                message: 'Only researchers have download history'
            })
        }
        
        const downloads = await getUserDownloads(userId, parseInt(limit))
        
        res.json({
            success: true,
            data: downloads
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Check if user has downloaded a paper
const checkDownloadStatus = async (req, res) => {
    try {
        const paperId = req.params.paperId
        const userId = req.user.id
        const userRole = req.user.role
        
        if (!paperId || isNaN(paperId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid paper ID'
            })
        }
        
        if (userRole !== 'Researcher') {
            return res.json({
                success: true,
                hasDownloaded: false
            })
        }
        
        const hasDownloaded = await hasUserDownloaded(parseInt(paperId), userId)
        
        res.json({
            success: true,
            hasDownloaded
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    logDownload,
    getDownloadHistory,
    checkDownloadStatus
}