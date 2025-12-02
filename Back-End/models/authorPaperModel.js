
const sql = require('mssql')
const config = require('../config/dbConfig')

const getAllAuthorPapers = async () => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request().query("SELECT * FROM [Author's Paper]")
        return result.recordset
    } catch (err) {
        throw err
    }
}

const getPapersByAuthor = async (authorId) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Author_ID', sql.Int, authorId)
            .query("SELECT * FROM [Author's Paper] WHERE Author_ID = @Author_ID")
        return result.recordset
    } catch (err) {
        throw err
    }
}

const addAuthorPaper = async (authorPaper) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Author_ID', sql.Int, authorPaper.Author_ID)
            .input('Paper_ID', sql.Int, authorPaper.Paper_ID)
            .input('Write_Date', sql.Date, authorPaper.Write_Date)
            .query("INSERT INTO [Author's Paper] (Author_ID, Paper_ID, Write_Date) VALUES (@Author_ID, @Paper_ID, @Write_Date)")
        return result
    } catch (err) {
        throw err
    }
}

module.exports = { getAllAuthorPapers, getPapersByAuthor, addAuthorPaper }
