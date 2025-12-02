const sql = require('mssql');

const getStats = async (req, res) => {
    try {
        const pool = await sql.connect();

        const papersRes = await pool.request().query('SELECT COUNT(*) AS totalPapers FROM Paper');
        const totalPapers = papersRes.recordset[0].totalPapers;

        const researchersRes = await pool.request().query('SELECT COUNT(*) AS totalResearchers FROM Researcher');
        const totalResearchers = researchersRes.recordset[0].totalResearchers;

        const fieldsRes = await pool.request().query('SELECT COUNT(*) AS totalFields FROM Field');
        const totalFields = fieldsRes.recordset[0].totalFields;

        res.json({
            success: true,
            data: { totalPapers, totalResearchers, totalFields }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getStats };
