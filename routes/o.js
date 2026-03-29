const express = require("express");
const rout = express.Router();
const db = require("../sql.js");

// ================= PLACE ORDER =================
rout.post("/", async (req, res) => {
    const cart = req.body;

    try {
        // create order
        const [r] = await db.query("INSERT INTO orders() VALUES ()");
        const orderId = r.insertId;

        // insert items
        for (let i = 0; i < cart.length; i++) {
            const { name, quantity, price } = cart[i];

            await db.query(
                "INSERT INTO order_items (order_id,item_name,quantity,price) VALUES (?,?,?,?)",
                [orderId, name, quantity, price]
            );
        }

        res.status(200).json({ id: orderId, message: "Order placed successfully" });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = rout;