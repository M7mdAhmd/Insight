const sql = require('mssql')

// Create a new search log
const createSearchLog = async (researcherId, query) => {
    try {
        // Get the last Search_ID
        const lastIdQuery = `SELECT MAX(Search_ID) AS lastId FROM Search`
        const lastIdResult = await sql.query(lastIdQuery)
        const newSearchId = (lastIdResult.recordset[0].lastId || 0) + 1
        
        const request = new sql.Request()
        request.input('searchId', sql.Int, newSearchId)
        request.input('query', sql.NVarChar, query)
        request.input('searchDate', sql.Date, new Date())
        request.input('researcherId', sql.Int, researcherId)
        
        const insertQuery = `
            INSERT INTO Search (Search_ID, Query, Search_Date, Researcher_ID)
            VALUES (@searchId, @query, @searchDate, @researcherId)
        `
        
        await request.query(insertQuery)
        
        return {
            Search_ID: newSearchId,
            Query: query,
            Search_Date: new Date(),
            Researcher_ID: researcherId
        }
    } catch (err) {
        throw new Error(`Error creating search log: ${err.message}`)
    }
}

// Get user search history
const getSearchHistory = async (researcherId, limit = 20) => {
    try {
        const request = new sql.Request()
        request.input('researcherId', sql.Int, researcherId)
        request.input('limit', sql.Int, limit)
        
        const query = `
            SELECT TOP (@limit)
                Search_ID,
                Query,
                Search_Date,
                Researcher_ID
            FROM Search
            WHERE Researcher_ID = @researcherId
            ORDER BY Search_Date DESC
        `
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching search history: ${err.message}`)
    }
}

// Get popular search queries
const getPopularSearches = async (limit = 10) => {
    try {
        const request = new sql.Request()
        request.input('limit', sql.Int, limit)
        
        const query = `
            SELECT TOP (@limit)
                Query,
                COUNT(*) AS Search_Count
            FROM Search
            GROUP BY Query
            ORDER BY Search_Count DESC
        `
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching popular searches: ${err.message}`)
    }
}

module.exports = {
    createSearchLog,
    getSearchHistory,
    getPopularSearches
}