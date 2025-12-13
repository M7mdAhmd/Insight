const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

const queryCache = new Map();
const CACHE_TTL = 60000;

function getCacheKey(params) {
  return JSON.stringify(params);
}

function getCachedQuery(key) {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
}

function setCachedQuery(key, data) {
  queryCache.set(key, { data, timestamp: Date.now() });
  if (queryCache.size > 100) {
    const firstKey = queryCache.keys().next().value;
    queryCache.delete(firstKey);
  }
}

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const fieldId = req.query.fieldId;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    const cacheKey = getCacheKey({ page, limit, fieldId, search });
    const cached = getCachedQuery(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT 
        p.Paper_ID, 
        p.Title, 
        p.Abstract, 
        p.Publication_Date, 
        p.Path,
        f.Field_Name,
        f.Field_ID,
        ISNULL((SELECT COUNT(*) FROM Author_Paper WHERE Paper_ID = p.Paper_ID), 0) as Author_Count,
        ISNULL((SELECT COUNT(*) FROM Download WHERE Paper_ID = p.Paper_ID), 0) as Download_Count,
        ISNULL((SELECT AVG(CAST(Rating as FLOAT)) FROM Review WHERE Paper_ID = p.Paper_ID), 0) as Average_Rating
      FROM Paper p WITH (NOLOCK)
      LEFT JOIN Field f WITH (NOLOCK) ON p.Field_ID = f.Field_ID
      WHERE 1=1
    `;

    if (fieldId) {
      query += ' AND p.Field_ID = @fieldId';
      request.input('fieldId', sql.Int, fieldId);
    }

    if (search) {
      query += " AND (p.Title LIKE @search OR p.Abstract LIKE @search)";
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += `
      ORDER BY p.Publication_Date DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);

    let countQuery = `SELECT COUNT(*) as total FROM Paper p WITH (NOLOCK) WHERE 1=1`;
    const countRequest = pool.request();
    
    if (fieldId) {
      countQuery += ' AND p.Field_ID = @fieldId';
      countRequest.input('fieldId', sql.Int, fieldId);
    }
    if (search) {
      countQuery += " AND (p.Title LIKE @search OR p.Abstract LIKE @search)";
      countRequest.input('search', sql.NVarChar, `%${search}%`);
    }

    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    const response = {
      success: true,
      message: 'Papers retrieved successfully',
      data: {
        papers: result.recordset,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve papers',
      data: null,
    });
  }
});

router.get('/search/query', async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        data: null,
      });
    }

    const cacheKey = getCacheKey({ search: query, page, limit });
    const cached = getCachedQuery(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const pool = await getPool();
    const searchTerm = `%${query}%`;

    const result = await pool
      .request()
      .input('search', sql.NVarChar, searchTerm)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        WITH SearchResults AS (
          SELECT DISTINCT
            p.Paper_ID, 
            p.Title, 
            p.Abstract, 
            p.Publication_Date, 
            p.Path, 
            f.Field_ID,
            f.Field_Name,
            ISNULL((SELECT COUNT(*) FROM Author_Paper WHERE Paper_ID = p.Paper_ID), 0) as Author_Count,
            ISNULL((SELECT COUNT(*) FROM Download WHERE Paper_ID = p.Paper_ID), 0) as Download_Count,
            ISNULL((SELECT AVG(CAST(Rating as FLOAT)) FROM Review WHERE Paper_ID = p.Paper_ID), 0) as Average_Rating,
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM Paper_Keywords pk 
                WHERE pk.Paper_ID = p.Paper_ID 
                AND pk.Keywords LIKE @search
              ) THEN 1
              WHEN p.Title LIKE @search THEN 2
              WHEN p.Abstract LIKE @search THEN 3
              WHEN f.Description LIKE @search THEN 4
              ELSE 5
            END as Relevance
          FROM Paper p WITH (NOLOCK)
          LEFT JOIN Field f WITH (NOLOCK) ON p.Field_ID = f.Field_ID
          WHERE 
            EXISTS (
              SELECT 1 FROM Paper_Keywords pk2 
              WHERE pk2.Paper_ID = p.Paper_ID 
              AND pk2.Keywords LIKE @search
            )
            OR p.Title LIKE @search 
            OR p.Abstract LIKE @search 
            OR f.Description LIKE @search
        )
        SELECT 
          Paper_ID,
          Title,
          Abstract,
          Publication_Date,
          Path,
          Field_ID,
          Field_Name,
          Author_Count,
          Download_Count,
          Average_Rating
        FROM SearchResults
        ORDER BY 
          Relevance ASC, 
          Average_Rating DESC, 
          Download_Count DESC,
          Publication_Date DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool
      .request()
      .input('search', sql.NVarChar, searchTerm)
      .query(`
        SELECT COUNT(DISTINCT p.Paper_ID) as total 
        FROM Paper p WITH (NOLOCK)
        LEFT JOIN Field f WITH (NOLOCK) ON p.Field_ID = f.Field_ID
        WHERE 
          EXISTS (
            SELECT 1 FROM Paper_Keywords pk2 
            WHERE pk2.Paper_ID = p.Paper_ID 
            AND pk2.Keywords LIKE @search
          )
          OR p.Title LIKE @search 
          OR p.Abstract LIKE @search 
          OR f.Description LIKE @search
      `);

    const total = countResult.recordset[0].total;

    const response = {
      success: true,
      message: 'Search completed successfully',
      data: {
        papers: result.recordset,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      data: null,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paperId = req.params.id;
    
    const cacheKey = getCacheKey({ paperId });
    const cached = getCachedQuery(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const pool = await getPool();

    const paperResult = await pool
      .request()
      .input('paperId', sql.Int, paperId)
      .query(`
        SELECT 
          p.Paper_ID, 
          p.Title, 
          p.Abstract, 
          p.Publication_Date, 
          p.Path, 
          p.Field_ID,
          f.Field_Name,
          ISNULL((SELECT COUNT(*) FROM Download WHERE Paper_ID = p.Paper_ID), 0) as Download_Count,
          ISNULL((SELECT AVG(CAST(Rating as FLOAT)) FROM Review WHERE Paper_ID = p.Paper_ID), 0) as Average_Rating,
          ISNULL((SELECT COUNT(*) FROM Review WHERE Paper_ID = p.Paper_ID), 0) as Review_Count
        FROM Paper p WITH (NOLOCK)
        LEFT JOIN Field f WITH (NOLOCK) ON p.Field_ID = f.Field_ID
        WHERE p.Paper_ID = @paperId
      `);

    if (paperResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found',
        data: null,
      });
    }

    const paper = paperResult.recordset[0];

    const [authorsResult, keywordsResult, reviewsResult] = await Promise.all([
      pool
        .request()
        .input('paperId', sql.Int, paperId)
        .query(`
          SELECT a.Author_ID, a.First_Name, a.Last_Name, a.Email, a.Country
          FROM Author a WITH (NOLOCK)
          INNER JOIN Author_Paper ap WITH (NOLOCK) ON a.Author_ID = ap.Author_ID
          WHERE ap.Paper_ID = @paperId
        `),
      pool
        .request()
        .input('paperId', sql.Int, paperId)
        .query('SELECT Keywords FROM Paper_Keywords WITH (NOLOCK) WHERE Paper_ID = @paperId'),
      pool
        .request()
        .input('paperId', sql.Int, paperId)
        .query(`
          SELECT 
            r.Review_ID,
            r.Rating,
            r.Review_Date,
            r.Researcher_ID,
            u.Name as User_Name
          FROM Review r WITH (NOLOCK)
          INNER JOIN [User] u WITH (NOLOCK) ON r.Researcher_ID = u.User_ID
          WHERE r.Paper_ID = @paperId
          ORDER BY r.Review_Date DESC
        `)
    ]);

    const response = {
      success: true,
      message: 'Paper retrieved successfully',
      data: {
        ...paper,
        authors: authorsResult.recordset,
        keywords: keywordsResult.recordset.length > 0 ? keywordsResult.recordset[0].Keywords : '',
        reviews: reviewsResult.recordset,
      },
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Get paper error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve paper',
      data: null,
    });
  }
});

router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const paperId = req.params.id;
    const researcherId = req.user.userId;

    const pool = await getPool();

    const paperCheck = await pool
      .request()
      .input('paperId', sql.Int, paperId)
      .query('SELECT Paper_ID, Path FROM Paper WHERE Paper_ID = @paperId');

    if (paperCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found',
        data: null,
      });
    }

    await pool
      .request()
      .input('paperId', sql.Int, paperId)
      .input('researcherId', sql.Int, researcherId)
      .query(`
        INSERT INTO Download (Paper_ID, Researcher_ID, Download_Date)
        VALUES (@paperId, @researcherId, GETDATE())
      `);

    queryCache.delete(getCacheKey({ paperId }));

    res.json({
      success: true,
      message: 'Download recorded successfully',
      data: {
        path: paperCheck.recordset[0].Path,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record download',
      data: null,
    });
  }
});

router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const paperId = req.params.id;
    const researcherId = req.user.userId;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        data: null,
      });
    }

    const pool = await getPool();

    const paperCheck = await pool
      .request()
      .input('paperId', sql.Int, paperId)
      .query('SELECT Paper_ID FROM Paper WHERE Paper_ID = @paperId');

    if (paperCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found',
        data: null,
      });
    }

    const existingReview = await pool
      .request()
      .input('paperId', sql.Int, paperId)
      .input('researcherId', sql.Int, researcherId)
      .query('SELECT Review_ID FROM Review WHERE Paper_ID = @paperId AND Researcher_ID = @researcherId');

    if (existingReview.recordset.length > 0) {
      await pool
        .request()
        .input('reviewId', sql.Int, existingReview.recordset[0].Review_ID)
        .input('rating', sql.Int, rating)
        .query('UPDATE Review SET Rating = @rating, Review_Date = GETDATE() WHERE Review_ID = @reviewId');

      queryCache.delete(getCacheKey({ paperId }));

      return res.json({
        success: true,
        message: 'Review updated successfully',
        data: null,
      });
    }

    await pool
      .request()
      .input('paperId', sql.Int, paperId)
      .input('researcherId', sql.Int, researcherId)
      .input('rating', sql.Int, rating)
      .query(`
        INSERT INTO Review (Paper_ID, Researcher_ID, Rating, Review_Date)
        VALUES (@paperId, @researcherId, @rating, GETDATE())
      `);

    queryCache.delete(getCacheKey({ paperId }));

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      data: null,
    });
  }
});

router.get('/top-rated/by-field', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const cacheKey = getCacheKey({ topRated: true, limit });
    const cached = getCachedQuery(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input('limit', sql.Int, limit)
      .query(`
        WITH RankedPapers AS (
          SELECT 
            p.Paper_ID,
            p.Title,
            p.Abstract,
            p.Publication_Date,
            p.Path,
            f.Field_ID,
            f.Field_Name,
            ISNULL((SELECT AVG(CAST(Rating as FLOAT)) FROM Review WHERE Paper_ID = p.Paper_ID), 0) as Average_Rating,
            ISNULL((SELECT COUNT(*) FROM Download WHERE Paper_ID = p.Paper_ID), 0) as Download_Count,
            ISNULL((SELECT COUNT(*) FROM Review WHERE Paper_ID = p.Paper_ID), 0) as Review_Count,
            ROW_NUMBER() OVER (PARTITION BY f.Field_ID ORDER BY 
              ISNULL((SELECT AVG(CAST(Rating as FLOAT)) FROM Review WHERE Paper_ID = p.Paper_ID), 0) DESC,
              ISNULL((SELECT COUNT(*) FROM Review WHERE Paper_ID = p.Paper_ID), 0) DESC,
              p.Publication_Date DESC
            ) as RowNum
          FROM Paper p WITH (NOLOCK)
          INNER JOIN Field f WITH (NOLOCK) ON p.Field_ID = f.Field_ID
          WHERE EXISTS (SELECT 1 FROM Review WHERE Paper_ID = p.Paper_ID)
        )
        SELECT 
          Paper_ID,
          Title,
          Abstract,
          Publication_Date,
          Path,
          Field_ID,
          Field_Name,
          Average_Rating,
          Download_Count,
          Review_Count
        FROM RankedPapers
        WHERE RowNum <= @limit
        ORDER BY Field_Name, Average_Rating DESC
      `);

    const response = {
      success: true,
      message: 'Top-rated papers retrieved successfully',
      data: {
        papers: result.recordset,
      },
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Get top-rated papers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve top-rated papers',
      data: null,
    });
  }
});

module.exports = router;