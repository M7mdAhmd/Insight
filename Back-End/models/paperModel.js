const sql = require('mssql')

// Get all papers with filters and pagination
const getPapers = async (filters = {}) => {
    try {
        const { field, rating, year, sortBy, limit = 50, offset = 0 } = filters
        
        let query = `
            SELECT 
                p.Paper_ID,
                p.Title,
                p.Abstract,
                p.Publication_Date,
                p.Path,
                f.Field_Name,
                f.Field_ID,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating,
                COUNT(DISTINCT d.Download_ID) AS Download_Count,
                COUNT(DISTINCT r.Review_ID) AS Review_Count
            FROM Paper p
            LEFT JOIN Field f ON p.Field_ID = f.Field_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            LEFT JOIN Download d ON p.Paper_ID = d.Paper_ID
            WHERE 1=1
        `
        
        const request = new sql.Request()
        
        // Apply field filter
        if (field && field !== 'all') {
            query += ` AND f.Field_Name = @field`
            request.input('field', sql.NVarChar, field)
        }
        
        // Apply year filter
        if (year && year !== 'all') {
            query += ` AND YEAR(p.Publication_Date) = @year`
            request.input('year', sql.Int, parseInt(year))
        }
        
        query += ` GROUP BY p.Paper_ID, p.Title, p.Abstract, p.Publication_Date, p.Path, f.Field_Name, f.Field_ID`
        
        // Apply rating filter
        if (rating) {
            query += ` HAVING COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) >= @rating`
            request.input('rating', sql.Float, parseFloat(rating))
        }
        
        // Apply sorting
        switch (sortBy) {
            case 'downloads':
                query += ` ORDER BY Download_Count DESC`
                break
            case 'rating':
                query += ` ORDER BY Avg_Rating DESC`
                break
            case 'recent':
                query += ` ORDER BY p.Publication_Date DESC`
                break
            default:
                query += ` ORDER BY p.Paper_ID DESC`
        }
        
        // Add pagination
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
        request.input('offset', sql.Int, offset)
        request.input('limit', sql.Int, limit)
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching papers: ${err.message}`)
    }
}

// FIXED: Search papers by query - prevents duplicate rows
const searchPapersByQuery = async (searchQuery, filters = {}) => {
    try {
        const { field, rating, year, sortBy, limit = 50, offset = 0 } = filters
        
        // Use DISTINCT and subquery to avoid duplicates from Paper_Keywords
        let query = `
            SELECT 
                p.Paper_ID,
                p.Title,
                p.Abstract,
                p.Publication_Date,
                p.Path,
                f.Field_Name,
                f.Field_ID,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating,
                COUNT(DISTINCT d.Download_ID) AS Download_Count,
                COUNT(DISTINCT r.Review_ID) AS Review_Count
            FROM Paper p
            LEFT JOIN Field f ON p.Field_ID = f.Field_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            LEFT JOIN Download d ON p.Paper_ID = d.Paper_ID
            WHERE (
                p.Title LIKE @searchQuery 
                OR p.Abstract LIKE @searchQuery
                OR EXISTS (
                    SELECT 1 
                    FROM Paper_Keywords pk 
                    WHERE pk.Paper_ID = p.Paper_ID 
                    AND pk.Keywords LIKE @searchQuery
                )
            )
        `
        
        const request = new sql.Request()
        request.input('searchQuery', sql.NVarChar, `%${searchQuery}%`)
        
        // Apply field filter
        if (field && field !== 'all') {
            query += ` AND f.Field_Name = @field`
            request.input('field', sql.NVarChar, field)
        }
        
        // Apply year filter
        if (year && year !== 'all') {
            query += ` AND YEAR(p.Publication_Date) = @year`
            request.input('year', sql.Int, parseInt(year))
        }
        
        query += ` GROUP BY p.Paper_ID, p.Title, p.Abstract, p.Publication_Date, p.Path, f.Field_Name, f.Field_ID`
        
        // Apply rating filter
        if (rating) {
            query += ` HAVING COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) >= @rating`
            request.input('rating', sql.Float, parseFloat(rating))
        }
        
        // Apply sorting
        switch (sortBy) {
            case 'downloads':
                query += ` ORDER BY Download_Count DESC`
                break
            case 'rating':
                query += ` ORDER BY Avg_Rating DESC`
                break
            case 'recent':
                query += ` ORDER BY p.Publication_Date DESC`
                break
            default:
                query += ` ORDER BY p.Paper_ID DESC`
        }
        
        // Add pagination
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
        request.input('offset', sql.Int, offset)
        request.input('limit', sql.Int, limit)
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error searching papers: ${err.message}`)
    }
}

// FIXED: Get paper by ID with proper error handling
const getPaperByIdWithDetails = async (paperId) => {
    let pool;
    try {
        // Use connection pool to avoid creating too many requests
        pool = await sql.connect()
        
        // Fetch paper details
        const paperQuery = `
            SELECT 
                p.Paper_ID,
                p.Title,
                p.Abstract,
                p.Publication_Date,
                p.Path,
                f.Field_Name,
                f.Field_ID,
                f.Description AS Field_Description,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating,
                COUNT(DISTINCT d.Download_ID) AS Download_Count,
                COUNT(DISTINCT r.Review_ID) AS Review_Count
            FROM Paper p
            LEFT JOIN Field f ON p.Field_ID = f.Field_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            LEFT JOIN Download d ON p.Paper_ID = d.Paper_ID
            WHERE p.Paper_ID = @paperId
            GROUP BY p.Paper_ID, p.Title, p.Abstract, p.Publication_Date, p.Path, 
                     f.Field_Name, f.Field_ID, f.Description
        `
        
        const paperResult = await pool.request()
            .input('paperId', sql.Int, paperId)
            .query(paperQuery)
        
        if (paperResult.recordset.length === 0) {
            return null
        }
        
        const paper = paperResult.recordset[0]
        
        // Fetch authors
        const authorsQuery = `
            SELECT 
                a.Author_ID,
                a.First_Name,
                a.Last_Name,
                a.Email,
                a.Country,
                ap.Write_Date
            FROM Author a
            INNER JOIN Author_Paper ap ON a.Author_ID = ap.Author_ID
            WHERE ap.Paper_ID = @paperId
            ORDER BY ap.Write_Date
        `
        
        const authorsResult = await pool.request()
            .input('paperId', sql.Int, paperId)
            .query(authorsQuery)
        
        paper.Authors = authorsResult.recordset
        
        // Fetch keywords - handle case where no keywords exist
        const keywordsQuery = `
            SELECT Keywords
            FROM Paper_Keywords
            WHERE Paper_ID = @paperId
        `
        
        const keywordsResult = await pool.request()
            .input('paperId', sql.Int, paperId)
            .query(keywordsQuery)
        
        paper.Keywords = keywordsResult.recordset.length > 0 
            ? keywordsResult.recordset[0].Keywords 
            : ''
        
        return paper
    } catch (err) {
        console.error('Error in getPaperByIdWithDetails:', err)
        throw new Error(`Error fetching paper details: ${err.message}`)
    }
}

// Get popular papers (most downloaded)
const getPopularPapers = async (limit = 10) => {
    try {
        const request = new sql.Request()
        request.input('limit', sql.Int, limit)
        
        const query = `
            SELECT TOP (@limit)
                p.Paper_ID,
                p.Title,
                p.Abstract,
                p.Publication_Date,
                f.Field_Name,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating,
                COUNT(DISTINCT d.Download_ID) AS Download_Count
            FROM Paper p
            LEFT JOIN Field f ON p.Field_ID = f.Field_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            LEFT JOIN Download d ON p.Paper_ID = d.Paper_ID
            GROUP BY p.Paper_ID, p.Title, p.Abstract, p.Publication_Date, f.Field_Name
            ORDER BY Download_Count DESC
        `
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching popular papers: ${err.message}`)
    }
}

// Get papers by field
const getPapersByFieldId = async (fieldId) => {
    try {
        const request = new sql.Request()
        request.input('fieldId', sql.Int, fieldId)
        
        const query = `
            SELECT 
                p.Paper_ID,
                p.Title,
                p.Abstract,
                p.Publication_Date,
                f.Field_Name,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating,
                COUNT(DISTINCT d.Download_ID) AS Download_Count
            FROM Paper p
            LEFT JOIN Field f ON p.Field_ID = f.Field_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            LEFT JOIN Download d ON p.Paper_ID = d.Paper_ID
            WHERE p.Field_ID = @fieldId
            GROUP BY p.Paper_ID, p.Title, p.Abstract, p.Publication_Date, f.Field_Name
            ORDER BY p.Publication_Date DESC
        `
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching papers by field: ${err.message}`)
    }
}

module.exports = {
    getPapers,
    searchPapersByQuery,
    getPaperByIdWithDetails,
    getPopularPapers,
    getPapersByFieldId
}