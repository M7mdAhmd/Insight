const sql = require('mssql')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' })
    try {
        const result = await sql.query`SELECT User_ID, Name, Role, Email, [Password] FROM [User] WHERE Email=${email}`
        if (result.recordset.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' })
        const user = result.recordset[0]
        if (user.Password !== password) return res.status(401).json({ success: false, message: 'Invalid credentials' })
        const token = jwt.sign({ id: user.User_ID, role: user.Role }, 'secretkey', { expiresIn: '1d' })
        res.json({ success: true, user: { User_ID: user.User_ID, Name: user.Name, Role: user.Role }, token })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
}

const signup = async (req, res) => {
    const { name, email, password, affiliation, specialization } = req.body
    if (!name || !email || !password || !affiliation || !specialization)
        return res.status(400).json({ success: false, message: 'All fields are required' })

    try {
        const existing = await sql.query`SELECT User_ID FROM [User] WHERE Email=${email}`
        if (existing.recordset.length > 0) return res.status(400).json({ success: false, message: 'Email already exists' })

        const lastIdResult = await sql.query`SELECT MAX(User_ID) AS lastId FROM [User]`
        const newUserId = (lastIdResult.recordset[0].lastId || 0) + 1

        await sql.query`
            INSERT INTO [User] (User_ID, Name, Email, Password, Role)
            VALUES (${newUserId}, ${name}, ${email}, ${password}, 'Researcher')
        `

        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const joinDate = `${yyyy}-${mm}-${dd}`

        await sql.query`
            INSERT INTO Researcher (Researcher_ID, Affiliation, Specialization, Join_Date)
            VALUES (${newUserId}, ${affiliation}, ${specialization}, ${joinDate})
        `

        const token = jwt.sign({ id: newUserId, role: 'Researcher' }, 'secretkey', { expiresIn: '1d' })

        res.status(201).json({
            success: true,
            user: { User_ID: newUserId, Name: name, Role: 'Researcher' },
            token
        })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

const getUserById = async (req, res) => {
    const userId = req.params.id
    try {
        const result = await sql.query`SELECT User_ID, Name, Email, Role FROM [User] WHERE User_ID=${userId}`
        if (result.recordset.length > 0) res.json(result.recordset[0])
        else res.status(404).json({ message: 'User not found' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = { login, signup, getUserById }
