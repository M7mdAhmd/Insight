const sql = require('mssql')
const config = require('../config/dbConfig')

const getAllAdmins = async () => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request().query('SELECT * FROM Admin')
        return result.recordset
    } catch (err) {
        throw err
    }
}

const getAdminById = async (id) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .input('Admin_ID', sql.Int, id)
            .query('SELECT * FROM Admin WHERE Admin_ID = @Admin_ID')
        return result.recordset[0]
    } catch (err) {
        throw err
    }
}

module.exports = { getAllAdmins, getAdminById }
