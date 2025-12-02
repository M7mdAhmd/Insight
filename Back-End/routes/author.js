const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.get('/', authorController.fetchAuthors);
router.get('/stats', authorController.fetchAuthorStats);

module.exports = router;
