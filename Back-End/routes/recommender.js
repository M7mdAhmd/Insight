const express = require('express')
const router = express.Router()
const { recommendPapers } = require('../controllers/recommenderController')
router.post('/', recommendPapers)
module.exports = router
