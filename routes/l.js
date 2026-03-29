const express  = require("express");
const db       = require("../sql.js");
const rout     = express.Router();
const bcrypt   = require("bcrypt");
const jwt      = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "smartdine_secret_key";

rout.post("/", async (req, res) => {
    try {
        const { uname, pass } = req.body;

        if (!uname || !pass)
            return res.status(400).json({ message: "Username and password required" });

        const [q] = await db.query("SELECT * FROM data WHERE uname=?", [uname]);

        if (q.length === 0)
            return res.status(401).json({ message: "Invalid username or password" });

        const user  = q[0];
        const match = await bcrypt.compare(pass, user.password);

        if (!match)
            return res.status(401).json({ message: "Invalid username or password" });

        // Issue JWT token
        const token = jwt.sign(
            { id: user.id, uname: user.uname, role: user.role },
            SECRET,
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            role:  user.role,
            uname: user.uname
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = rout;