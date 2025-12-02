const sql = require('mssql')

// Log a download
const createDownload = async (paperId, researcherId) => {
    try {
        // Get the last Download_ID
        const lastIdQuery = `SELECT MAX(Download_ID) AS lastId FROM Download`
        const lastIdResult = await sql.query(lastIdQuery)
        const newDownloadId = (lastIdResult.recordset[0].lastId || 0) + 1
        
        const request = new sql.Request()
        request.input('downloadId', sql.Int, newDownloadId)
        request.input('downloadDate', sql.Date, new Date())
        request.input('paperId', sql.Int, paperId)
        request.input('researcherId', sql.Int, researcherId)
        
        const query = `
            INSERT INTO Download (Download_ID, Download_Date, Paper_ID, Researcher_ID)
            VALUES (@downloadId, @downloadDate, @paperId, @researcherId)
        `
        
        await request.query(query)
        
        return {
            Download_ID: newDownloadId,
            Download_Date: new Date(),
            Paper_ID: paperId,
            Researcher_ID: researcherId
        }
    } catch (err) {
        throw new Error(`Error creating download log: ${err.message}`)
    }
}

// Get user download history
const getUserDownloads = async (researcherId, limit = 50) => {
    try {
        const request = new sql.Request()
        request.input('researcherId', sql.Int, researcherId)
        request.input('limit', sql.Int, limit)
        
        const query = `
            SELECT TOP (@limit)
                d.Download_ID,
                d.Download_Date,
                p.Paper_ID,
                p.Title,
                p.Abstract,
                f.Field_Name
            FROM Download d
            INNER JOIN Paper p ON d.Paper_ID = p.Paper_ID
            LEFT JOIN Field f ON p.Field_ID = f.Field_ID
            WHERE d.Researcher_ID = @researcherId
            ORDER BY d.Download_Date DESC
        `
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching download history: ${err.message}`)
    }
}

// Check if user has downloaded a paper
const hasUserDownloaded = async (paperId, researcherId) => {
    try {
        const request = new sql.Request()
        request.input('paperId', sql.Int, paperId)
        request.input('researcherId', sql.Int, researcherId)
        
        const query = `
            SELECT COUNT(*) AS count
            FROM Download
            WHERE Paper_ID = @paperId AND Researcher_ID = @researcherId
        `
        
        const result = await request.query(query)
        return result.recordset[0].count > 0
    } catch (err) {
        throw new Error(`Error checking download status: ${err.message}`)
    }
}

module.exports = {
    createDownload,
    getUserDownloads,
    hasUserDownloaded
}