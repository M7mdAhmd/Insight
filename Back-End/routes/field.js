const express = require('express');
const router = express.Router();

const {
    getFields,
    getField,
    getFieldByNameParam,
    search,
    getTrending,
    getStats
} = require('../controllers/fieldController');

router.get('/search', search);
router.get('/trending', getTrending);
router.get('/stats/overall', getStats);
router.get('/name/:name', getFieldByNameParam);
router.get('/:id', getField);
router.get('/', getFields);

module.exports = router;
