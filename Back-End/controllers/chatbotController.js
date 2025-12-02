
const chatWithBot = async (req, res) => {
    const message = req.body.message
    const reply = "This is a placeholder response"
    res.json({ reply })
}

module.exports = { chatWithBot }
