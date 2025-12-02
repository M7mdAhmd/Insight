const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    try {
        const decoded = jwt.verify(token, 'secretkey')
        req.user = decoded
        next()
    } catch {
        res.status(401).json({ message: 'Not authorized' })
    }
}

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Admin only' })
    next()
}

module.exports = { protect, adminOnly }
