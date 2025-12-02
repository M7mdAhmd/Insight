const {
    getAllFields,
    getFieldById,
    getFieldByName,
    getTopPapersInField,
    searchFields: searchFieldsModel,
    getTrendingFields,
    getOverallStats
} = require('../models/fieldModel');

const getFields = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let fields = search && search.trim()
            ? await searchFieldsModel(search.trim(), parseInt(limit), offset)
            : await getAllFields(parseInt(limit), offset);

        const trendingFieldIds = await getTrendingFields(5);
        const trendingIds = trendingFieldIds.map(f => f.Field_ID);

        const fieldsWithTrending = fields.map(field => ({
            ...field,
            Trending: trendingIds.includes(field.Field_ID)
        }));

        const fieldsWithTopPapers = await Promise.all(
            fieldsWithTrending.map(async (field) => {
                try {
                    const topPapers = await getTopPapersInField(field.Field_ID, 3);
                    return { ...field, Top_Papers: topPapers };
                } catch {
                    return { ...field, Top_Papers: [] };
                }
            })
        );

        res.json({ success: true, data: fieldsWithTopPapers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getField = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid field ID' });
        }

        const field = await getFieldById(id);
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }

        const topPapers = await getTopPapersInField(id, 3);

        res.json({
            success: true,
            data: { ...field, Top_Papers: topPapers }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getFieldByNameParam = async (req, res) => {
    try {
        const name = req.params.name
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        const field = await getFieldByName(name);
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }

        const topPapers = await getTopPapersInField(field.Field_ID, 3);

        res.json({
            success: true,
            data: { ...field, Top_Papers: topPapers }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const search = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const results = await searchFieldsModel(q || '', parseInt(limit), offset);
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getTrending = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const fields = await getTrendingFields(parseInt(limit));
        res.json({ success: true, data: fields });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await getOverallStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getFields,
    getField,
    getFieldByNameParam,
    search,
    getTrending,
    getStats
};
