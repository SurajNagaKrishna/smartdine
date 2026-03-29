const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "smartdine_secret_key";

// ================= SIGN TOKEN =================
function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

// ================= VERIFY MIDDLEWARE =================
// Usage: router.get("/", auth(), handler)         — any logged-in user
// Usage: router.get("/", auth("admin"), handler)  — admin only
function auth(requiredRole) {
    return (req, res, next) => {
        const header = req.headers["authorization"] || "";
        const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

        if (!token) return res.status(401).json({ message: "Not authenticated" });

        try {
            const decoded = jwt.verify(token, SECRET);
            req.user = decoded; // { id, uname, role }

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: "Access denied" });
            }

            next();
        } catch (err) {
            return res.status(401).json({ message: "Session expired, please login again" });
        }
    };
}

module.exports = { signToken, auth };