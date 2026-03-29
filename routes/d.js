const express = require("express");
const rout    = express.Router();
const db      = require("../sql.js");
const { auth } = require("../middleware/auth");

rout.get("/dashboard", auth(), async (req, res) => {
    try {
        const [orders] = await db.query("SELECT * FROM orders");
        let result = [];

        for (let o of orders) {
            const [items] = await db.query(
                "SELECT * FROM order_items WHERE order_id=?", [o.id]
            );
            result.push({ orderStatus: "Pending", items });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

module.exports = rout;