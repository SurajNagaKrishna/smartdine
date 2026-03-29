const express = require("express");
const rout    = express.Router();
const db      = require("../sql.js");
const multer  = require("multer");
const path    = require("path");
const { auth } = require("../middleware/auth");

const IMAGES_DIR = path.join(__dirname, "../public/images");
const storage    = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGES_DIR),
    filename:    (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// GET — public (customers need it)
rout.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM menu_items ORDER BY id");
        res.json(rows.map((r, i) => ({ index: i, id: r.id, name: r.name, price: r.price, category: r.category, image: r.image })));
    } catch (err) {
        res.status(500).json({ message: "Failed to load menu" });
    }
});

// ADD — admin only
rout.post("/", auth("admin"), upload.single("image"), async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const file = req.file;
        if (!name || !price || !category || !file)
            return res.status(400).json({ message: "All fields required" });
        await db.query(
            "INSERT INTO menu_items (name, price, category, image) VALUES (?,?,?,?)",
            [name, Number(price), category, `images/${file.originalname}`]
        );
        res.json({ message: "Item added" });
    } catch (err) {
        res.status(500).json({ message: "Error adding item" });
    }
});

// DELETE — admin only
rout.delete("/:index", auth("admin"), async (req, res) => {
    try {
        const index = Number(req.params.index);
        const [rows] = await db.query("SELECT id FROM menu_items ORDER BY id");
        if (index >= rows.length || index < 0)
            return res.status(404).json({ message: "Item not found" });
        await db.query("DELETE FROM menu_items WHERE id=?", [rows[index].id]);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// UPDATE PRICE — admin only
rout.put("/:index", auth("admin"), async (req, res) => {
    try {
        const index = Number(req.params.index);
        const { price } = req.body;
        if (!price || Number(price) < 1)
            return res.status(400).json({ message: "Invalid price" });
        const [rows] = await db.query("SELECT id FROM menu_items ORDER BY id");
        if (index >= rows.length || index < 0)
            return res.status(404).json({ message: "Item not found" });
        await db.query("UPDATE menu_items SET price=? WHERE id=?", [Number(price), rows[index].id]);
        res.json({ message: "Price updated" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = rout;