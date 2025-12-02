const sql = require('mssql');

// Get all fields with pagination
const getAllFields = async (limit = 20, offset = 0) => {
    try {
        const query = `
            SELECT 
                f.Field_ID,
                f.Field_Name,
                f.Description,
                COUNT(DISTINCT p.Paper_ID) AS Paper_Count,
                COUNT(DISTINCT ap.Author_ID) AS Author_Count,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating
            FROM Field f
            LEFT JOIN Paper p ON f.Field_ID = p.Field_ID
            LEFT JOIN Author_Paper ap ON p.Paper_ID = ap.Paper_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            GROUP BY f.Field_ID, f.Field_Name, f.Description
            ORDER BY Paper_Count DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const request = new sql.Request();
        request.input('limit', sql.Int, limit);
        request.input('offset', sql.Int, offset);
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error(`Error fetching fields: ${err.message}`);
    }
};

// Search fields with pagination
const searchFields = async (searchQuery, limit = 20, offset = 0) => {
    try {
        const request = new sql.Request();
        request.input('searchQuery', sql.NVarChar, `%${searchQuery}%`);
        request.input('limit', sql.Int, limit);
        request.input('offset', sql.Int, offset);

        const query = `
            SELECT 
                f.Field_ID,
                f.Field_Name,
                f.Description,
                COUNT(DISTINCT p.Paper_ID) AS Paper_Count,
                COUNT(DISTINCT ap.Author_ID) AS Author_Count,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating
            FROM Field f
            LEFT JOIN Paper p ON f.Field_ID = p.Field_ID
            LEFT JOIN Author_Paper ap ON p.Paper_ID = ap.Paper_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            WHERE f.Field_Name LIKE @searchQuery OR f.Description LIKE @searchQuery
            GROUP BY f.Field_ID, f.Field_Name, f.Description
            ORDER BY Paper_Count DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error(`Error searching fields: ${err.message}`);
    }
};

// Get field by ID
const getFieldById = async (fieldId) => {
    try {
        const request = new sql.Request();
        request.input('fieldId', sql.Int, fieldId);
        const query = `
            SELECT 
                f.Field_ID,
                f.Field_Name,
                f.Description,
                COUNT(DISTINCT p.Paper_ID) AS Paper_Count,
                COUNT(DISTINCT ap.Author_ID) AS Author_Count,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating
            FROM Field f
            LEFT JOIN Paper p ON f.Field_ID = p.Field_ID
            LEFT JOIN Author_Paper ap ON p.Paper_ID = ap.Paper_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            WHERE f.Field_ID = @fieldId
            GROUP BY f.Field_ID, f.Field_Name, f.Description
        `;
        const result = await request.query(query);
        return result.recordset[0] || null;
    } catch (err) {
        throw new Error(`Error fetching field: ${err.message}`);
    }
};

// Get field by name
const getFieldByName = async (fieldName) => {
    try {
        const request = new sql.Request();
        request.input('fieldName', sql.NVarChar, fieldName);
        const query = `
            SELECT 
                f.Field_ID,
                f.Field_Name,
                f.Description,
                COUNT(DISTINCT p.Paper_ID) AS Paper_Count,
                COUNT(DISTINCT ap.Author_ID) AS Author_Count,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating
            FROM Field f
            LEFT JOIN Paper p ON f.Field_ID = p.Field_ID
            LEFT JOIN Author_Paper ap ON p.Paper_ID = ap.Paper_ID
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            WHERE f.Field_Name = @fieldName
            GROUP BY f.Field_ID, f.Field_Name, f.Description
        `;
        const result = await request.query(query);
        return result.recordset[0] || null;
    } catch (err) {
        throw new Error(`Error fetching field by name: ${err.message}`);
    }
};

// Get top papers in a field
const getTopPapersInField = async (fieldId, limit = 3) => {
    try {
        const request = new sql.Request();
        request.input('fieldId', sql.Int, fieldId);
        request.input('limit', sql.Int, limit);

        const query = `
            SELECT TOP (@limit)
                p.Paper_ID,
                p.Title,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS Avg_Rating,
                COUNT(DISTINCT d.Download_ID) AS Download_Count
            FROM Paper p
            LEFT JOIN Review r ON p.Paper_ID = r.Paper_ID
            LEFT JOIN Download d ON p.Paper_ID = d.Paper_ID
            WHERE p.Field_ID = @fieldId
            GROUP BY p.Paper_ID, p.Title
            ORDER BY Download_Count DESC, Avg_Rating DESC
        `;
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error(`Error fetching top papers: ${err.message}`);
    }
};

// Get trending fields
const getTrendingFields = async (limit = 5) => {
    try {
        const request = new sql.Request();
        request.input('limit', sql.Int, limit);

        const query = `
            SELECT TOP (@limit)
                f.Field_ID,
                f.Field_Name,
                COUNT(DISTINCT d.Download_ID) AS Recent_Downloads
            FROM Field f
            INNER JOIN Paper p ON f.Field_ID = p.Field_ID
            INNER JOIN Download d ON p.Paper_ID = d.Paper_ID
            WHERE d.Download_Date >= DATEADD(MONTH, -1, GETDATE())
            GROUP BY f.Field_ID, f.Field_Name
            ORDER BY Recent_Downloads DESC
        `;
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error(`Error fetching trending fields: ${err.message}`);
    }
};

// Get overall statistics
const getOverallStats = async () => {
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT f.Field_ID) AS Total_Fields,
                COUNT(DISTINCT p.Paper_ID) AS Total_Papers,
                COUNT(DISTINCT a.Author_ID) AS Total_Authors
            FROM Field f
            LEFT JOIN Paper p ON f.Field_ID = p.Field_ID
            LEFT JOIN Author_Paper ap ON p.Paper_ID = ap.Paper_ID
            LEFT JOIN Author a ON ap.Author_ID = a.Author_ID
        `;
        const result = await sql.query(query);
        return result.recordset[0] || { Total_Fields: 0, Total_Papers: 0, Total_Authors: 0 };
    } catch (err) {
        throw new Error(`Error fetching overall stats: ${err.message}`);
    }
};

module.exports = {
    getAllFields,
    getFieldById,
    getFieldByName,
    getTopPapersInField,
    searchFields,
    getTrendingFields,
    getOverallStats
};
