// =============================================
// api.js — shared fetch wrapper with JWT
// Include in dashboard.html, orders.html BEFORE other scripts
// =============================================

function getToken() {
    return localStorage.getItem("token");
}

function logout(msg) {
    localStorage.clear();
    window.location.href = "login.html" + (msg ? "?msg=" + encodeURIComponent(msg) : "");
}

// Authenticated fetch — auto-attaches Bearer token
// If 401 received (expired/invalid), auto-logout
async function apiFetch(url, options = {}) {
    const token = getToken();

    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };

    // Don't set Content-Type for FormData (multer needs it unset)
    if (!(options.body instanceof FormData)) {
        options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
    }

    const res = await fetch(url, options);

    if (res.status === 401) {
        logout("Session expired. Please login again.");
        throw new Error("Unauthorized");
    }

    return res;
}

// =============================================
// TOAST NOTIFICATION SYSTEM
// =============================================
(function injectToastStyles() {
    if (document.getElementById("toast-styles")) return;
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `
        #toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .toast {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            border-radius: 10px;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: white;
            min-width: 240px;
            max-width: 340px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
            pointer-events: all;
            animation: toastIn 0.3s ease;
            border-left: 4px solid rgba(255,255,255,0.3);
        }
        .toast.success { background: #1a3a2a; border-left-color: #22c55e; }
        .toast.error   { background: #3a1a1a; border-left-color: #ef4444; }
        .toast.info    { background: #1a2a3a; border-left-color: #60a5fa; }
        .toast-icon    { font-size: 18px; flex-shrink: 0; }
        .toast-msg     { flex: 1; line-height: 1.4; }
        @keyframes toastIn {
            from { opacity: 0; transform: translateX(40px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(40px); }
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
})();

function toast(message, type = "info", duration = 3000) {
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    const container = document.getElementById("toast-container");

    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `
        <span class="toast-icon">${icons[type] || "ℹ"}</span>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(el);

    setTimeout(() => {
        el.style.animation = "toastOut 0.3s ease forwards";
        setTimeout(() => el.remove(), 300);
    }, duration);
}