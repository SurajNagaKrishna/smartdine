const express = require("express")
const db = require("../sql.js")
const rout = express.Router()
const bcrypt = require("bcrypt")

rout.post('/', async (req, res) => {
    try {
        const { uname, pass } = req.body

        // basic validation
        if (!uname || !pass) {
            return res.status(400).json({ message: "Username and password required" })
        }

        let sql = "SELECT * FROM data WHERE uname=?"
        const [q] = await db.query(sql, [uname])

        if (q.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" })
        }

        const user = q[0]

        // bcrypt compare
        const match = await bcrypt.compare(pass, user.password)

        if (!match) {
            return res.status(401).json({ message: "Invalid username or password" })
        }

        // success — also send uname so frontend can store it
        return res.status(200).json({
            message: "Login successful",
            role: user.role,
            uname: user.uname
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Server error" })
    }
})

// FIX: was "module.exports = routA" (routA is undefined → crash on startup)
module.exports = rout