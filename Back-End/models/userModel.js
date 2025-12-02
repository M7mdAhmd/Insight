
const { poolPromise, sql } = require('../config/db')

const findUserByEmail = async (email) => {
    const pool = await poolPromise
    const result = await pool.request().input('email', sql.NVarChar, email).query('SELECT * FROM [User] WHERE Email = @email')
    return result.recordset[0]
}

module.exports = { findUserByEmail }
