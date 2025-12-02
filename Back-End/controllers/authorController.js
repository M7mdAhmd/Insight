const authorModel = require('../models/authorModel');

const fetchAuthors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const sortBy = req.query.sortBy || 'papers';
        const filters = {
            country: req.query.country || 'all',
            minPapers: req.query.minPapers || 0
        };

        const authors = await authorModel.getAuthors(filters, page, limit, sortBy);
        res.json({
            data: authors,
            pagination: { page, limit, hasMore: authors.length === limit }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const fetchAuthorStats = async (req, res) => {
    try {
        const stats = await authorModel.getAuthorStats();
        res.json({ data: stats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    fetchAuthors,
    fetchAuthorStats
};
