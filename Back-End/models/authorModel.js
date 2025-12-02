const sql = require('mssql');

const getAuthors = async (filters, page, limit, sortBy) => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT Author_ID, First_Name, Last_Name, Email, Country, Picture, 
               ISNULL(numeber_of_papers, '0') AS numeber_of_papers
        FROM Author
        WHERE 1=1
    `;

    if (filters.country && filters.country !== 'all') {
        query += ` AND Country = @country`;
    }
    if (filters.minPapers) {
        query += ` AND CAST(numeber_of_papers AS INT) >= @minPapers`;
    }

    switch(sortBy) {
        case 'papers':
            query += ` ORDER BY CAST(numeber_of_papers AS INT) DESC`;
            break;
        case 'name':
            query += ` ORDER BY First_Name, Last_Name`;
            break;
        default:
            query += ` ORDER BY First_Name, Last_Name`;
            break;
    }

    query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const pool = await sql.connect();
    const result = await pool.request()
        .input('country', sql.VarChar, filters.country)
        .input('minPapers', sql.Int, filters.minPapers || 0)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);

    return result.recordset;
};

const getAuthorStats = async () => {
    const query = `
        SELECT 
            COUNT(*) AS Total_Authors,
            COUNT(DISTINCT Country) AS Total_Countries,
            AVG(CAST(numeber_of_papers AS FLOAT)) AS Avg_Papers_Per_Author
        FROM Author
    `;
    const pool = await sql.connect();
    const result = await pool.request().query(query);
    return result.recordset[0];
};

module.exports = {
    getAuthors,
    getAuthorStats
};
