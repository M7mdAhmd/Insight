
const sql = require('mssql')
const config = require('../config/dbConfig')

const getAllPaperKeywords = async () => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request().query("SELECT * FROM [Paper's Keywords]")
        return result.recordset
    } catch (err) {
        throw err
    }
}

const getKeywordsByPaper = async (paperId) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Paper_ID', sql.Int, paperId)
            .query("SELECT * FROM [Paper's Keywords] WHERE Paper_ID = @Paper_ID")
        return result.recordset
    } catch (err) {
        throw err
    }
}

const addPaperKeyword = async (paperKeyword) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Paper_ID', sql.Int, paperKeyword.Paper_ID)
            .input('Keywords', sql.NVarChar, paperKeyword.Keywords)
            .query("INSERT INTO [Paper's Keywords] (Paper_ID, Keywords) VALUES (@Paper_ID, @Keywords)")
        return result
    } catch (err) {
        throw err
    }
}

module.exports = { getAllPaperKeywords, getKeywordsByPaper, addPaperKeyword }
