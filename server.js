const path    = require("path");
const express = require("express");
const app     = express();
require("dotenv").config();

const db = require("./sql.js");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ================= ROUTES =================
app.use("/login",    require("./routes/l.js"));
app.use("/register", require("./routes/r.js"));
app.use("/order",    require("./routes/o.js"));
app.use("/orders",   require("./routes/d.js"));
app.use("/menu",     require("./routes/m.js"));
app.use("/users",    require("./routes/users.js"));
app.use("/bill/:id", require("./routes/b.js"));

// ================= DELETE ORDER =================
app.delete("/orderDone/:id", async (req, res) => {
    const oid = req.params.id;
    try {
        await db.query("DELETE FROM order_items WHERE order_id=?", [oid]);
        await db.query("DELETE FROM orders WHERE id=?", [oid]);
        res.status(200).json({ message: "Order deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete order" });
    }
});

// ================= 404 =================
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));