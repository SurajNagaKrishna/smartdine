const express = require("express");
const rout = express.Router();
const db = require("../sql.js");
const bcrypt = require("bcrypt"); // 🔥 added

rout.post("/", async (req, res) => {
    try {

        const { fname, mname, lname, email, uname, pass, dob, role } = req.body;

        // ================= VALIDATION =================
        if (!fname || !mname || !email || !uname || !pass || !dob || !role) {
            return res.status(400).json({ message: "All fields required" });
        }

        // 🔥 restrict roles
        if (!["admin", "chef"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // ================= CHECK USERNAME =================
        const [u] = await db.query(
            "SELECT * FROM data WHERE uname=?",
            [uname]
        );

        if (u.length) {
            return res.status(409).json({ message: "Username already exists" });
        }

        // ================= CHECK EMAIL =================
        const [e] = await db.query(
            "SELECT * FROM data WHERE email=?",
            [email]
        );

        if (e.length) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // ================= PREP DATA =================
        const fullname = `${fname} ${mname} ${lname || ""}`.trim();

        // 🔥 HASH PASSWORD (IMPORTANT)
        const hashedPass = await bcrypt.hash(pass, 10);

        // ================= INSERT =================
        await db.query(
            "INSERT INTO data (fullname, uname, password, email, dob, role) VALUES (?,?,?,?,?,?)",
            [fullname, uname, hashedPass, email, dob, role]
        );

        // ================= RESPONSE =================
        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

module.exports = rout;