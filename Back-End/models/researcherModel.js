
const sql = require('mssql')
const config = require('../config/dbConfig')

const getAllResearchers = async () => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request().query('SELECT * FROM Researcher')
        return result.recordset
    } catch (err) {
        throw err
    }
}

const getResearcherById = async (id) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Researcher_ID', sql.Int, id)
            .query('SELECT * FROM Researcher WHERE Researcher_ID = @Researcher_ID')
        return result.recordset[0]
    } catch (err) {
        throw err
    }
}

const addResearcher = async (researcher) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Researcher_ID', sql.Int, researcher.Researcher_ID)
            .input('Affiliation', sql.NVarChar, researcher.Affiliation)
            .input('Specialization', sql.NVarChar, researcher.Specialization)
            .input('Join_Date', sql.Date, researcher.Join_Date)
            .query('INSERT INTO Researcher (Researcher_ID, Affiliation, Specialization, Join_Date) VALUES (@Researcher_ID, @Affiliation, @Specialization, @Join_Date)')
        return result
    } catch (err) {
        throw err
    }
}

const updateResearcher = async (id, researcher) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Researcher_ID', sql.Int, id)
            .input('Affiliation', sql.NVarChar, researcher.Affiliation)
            .input('Specialization', sql.NVarChar, researcher.Specialization)
            .input('Join_Date', sql.Date, researcher.Join_Date)
            .query('UPDATE Researcher SET Affiliation=@Affiliation, Specialization=@Specialization, Join_Date=@Join_Date WHERE Researcher_ID=@Researcher_ID')
        return result
    } catch (err) {
        throw err
    }
}

const deleteResearcher = async (id) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Researcher_ID', sql.Int, id)
            .query('DELETE FROM Researcher WHERE Researcher_ID=@Researcher_ID')
        return result
    } catch (err) {
        throw err
    }
}

module.exports = { getAllResearchers, getResearcherById, addResearcher, updateResearcher, deleteResearcher }
