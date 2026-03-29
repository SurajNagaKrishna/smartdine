const express = require("express");
const rout = express.Router({ mergeParams: true });
const db = require("../sql.js");

rout.get("/", async (req, res) => {
    try {
        const id = req.params.id;
        const [items] = await db.query(
            "SELECT item_name AS name, quantity AS qty, price FROM order_items WHERE order_id = ?",
            [id]
        );
        const amount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        res.status(200).json({ items, amount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch bill" });
    }
});

module.exports = rout;