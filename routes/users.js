const express = require("express");
const rout    = express.Router();
const db      = require("../sql.js");
const bcrypt  = require("bcrypt");
const { auth } = require("../middleware/auth");

// ================= GET USERS =================
rout.get("/", auth("admin"), async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, uname, email, role FROM data");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// ================= UPDATE USER =================
rout.put("/:id", auth("admin"), async (req, res) => {
    try {
        const { role: newRole, email, password } = req.body;

        let hashed = null;
        if (password && password.trim() !== "") {
            hashed = await bcrypt.hash(password, 10);
        }

        await db.query(
            "UPDATE data SET role=?, email=?, password=COALESCE(?, password) WHERE id=?",
            [newRole, email, hashed, req.params.id]
        );

        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

// ================= DELETE USER =================
rout.delete("/:id", auth("admin"), async (req, res) => {
    try {
        // prevent deleting yourself
        if (String(req.user.id) === String(req.params.id)) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        await db.query("DELETE FROM data WHERE id=?", [req.params.id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = rout;