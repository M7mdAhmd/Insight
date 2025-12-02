
const recommendPapers = async (req, res) => {
    const userId = req.body.userId
    const recommendations = [
        { Paper_ID: 301, Title: 'Advanced Neural Networks for Image Recognition' },
        { Paper_ID: 305, Title: 'Graph Theory Algorithms for Optimization' },
        { Paper_ID: 309, Title: 'Ethics in Artificial Intelligence' }
    ]
    res.json({ userId, recommendations })
}

module.exports = { recommendPapers }
