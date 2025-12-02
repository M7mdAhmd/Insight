const express = require('express')
const router = express.Router()
const { 
    getAllPapers, 
    getPaperById, 
    searchPapers,
    getPapersByField,
    getPopularPapers
} = require('../controllers/paperController')

router.get('/search', searchPapers)
router.get('/popular', getPopularPapers)
router.get('/field/:fieldId', getPapersByField)
router.get('/', getAllPapers)
router.get('/:id', getPaperById)

module.exports = router