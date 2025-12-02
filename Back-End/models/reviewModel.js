const sql = require('mssql')

// Get reviews for a paper
const getReviewsByPaperId = async (paperId) => {
    try {
        const request = new sql.Request()
        request.input('paperId', sql.Int, paperId)
        
        const query = `
            SELECT 
                r.Review_ID,
                r.Rating,
                r.Review_Date,
                u.Name AS Reviewer_Name,
                res.Affiliation,
                res.Specialization
            FROM Review r
            INNER JOIN Researcher res ON r.Researcher_ID = res.Researcher_ID
            INNER JOIN [User] u ON res.Researcher_ID = u.User_ID
            WHERE r.Paper_ID = @paperId
            ORDER BY r.Review_Date DESC
        `
        
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        throw new Error(`Error fetching reviews: ${err.message}`)
    }
}

// Create a new review
const createReview = async (paperId, researcherId, rating) => {
    try {
        // Check if user already reviewed this paper
        const checkQuery = `
            SELECT Review_ID 
            FROM Review 
            WHERE Paper_ID = @paperId AND Researcher_ID = @researcherId
        `
        
        const checkRequest = new sql.Request()
        checkRequest.input('paperId', sql.Int, paperId)
        checkRequest.input('researcherId', sql.Int, researcherId)
        
        const existing = await checkRequest.query(checkQuery)
        
        if (existing.recordset.length > 0) {
            throw new Error('You have already reviewed this paper')
        }
        
        // Get the last Review_ID
        const lastIdQuery = `SELECT MAX(Review_ID) AS lastId FROM Review`
        const lastIdResult = await sql.query(lastIdQuery)
        const newReviewId = (lastIdResult.recordset[0].lastId || 0) + 1
        
        const request = new sql.Request()
        request.input('reviewId', sql.Int, newReviewId)
        request.input('rating', sql.Int, rating)
        request.input('reviewDate', sql.Date, new Date())
        request.input('paperId', sql.Int, paperId)
        request.input('researcherId', sql.Int, researcherId)
        
        const insertQuery = `
            INSERT INTO Review (Review_ID, Rating, Review_Date, Paper_ID, Researcher_ID)
            VALUES (@reviewId, @rating, @reviewDate, @paperId, @researcherId)
        `
        
        await request.query(insertQuery)
        
        return {
            Review_ID: newReviewId,
            Rating: rating,
            Review_Date: new Date(),
            Paper_ID: paperId,
            Researcher_ID: researcherId
        }
    } catch (err) {
        throw new Error(`Error creating review: ${err.message}`)
    }
}

// Update a review
const updateReview = async (reviewId, rating) => {
    try {
        const request = new sql.Request()
        request.input('reviewId', sql.Int, reviewId)
        request.input('rating', sql.Int, rating)
        request.input('reviewDate', sql.Date, new Date())
        
        const query = `
            UPDATE Review 
            SET Rating = @rating, Review_Date = @reviewDate
            WHERE Review_ID = @reviewId
        `
        
        await request.query(query)
        return { Review_ID: reviewId, Rating: rating }
    } catch (err) {
        throw new Error(`Error updating review: ${err.message}`)
    }
}

// Delete a review
const deleteReview = async (reviewId, researcherId) => {
    try {
        const request = new sql.Request()
        request.input('reviewId', sql.Int, reviewId)
        request.input('researcherId', sql.Int, researcherId)
        
        const query = `
            DELETE FROM Review 
            WHERE Review_ID = @reviewId AND Researcher_ID = @researcherId
        `
        
        const result = await request.query(query)
        
        if (result.rowsAffected[0] === 0) {
            throw new Error('Review not found or unauthorized')
        }
        
        return { deleted: true }
    } catch (err) {
        throw new Error(`Error deleting review: ${err.message}`)
    }
}

module.exports = {
    getReviewsByPaperId,
    createReview,
    updateReview,
    deleteReview
}