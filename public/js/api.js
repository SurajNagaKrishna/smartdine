function getToken() {
    return localStorage.getItem("token");
}

function logout(msg) {
    localStorage.clear();
    window.location.href = "login.html" + (msg ? "?msg=" + encodeURIComponent(msg) : "");
}

async function apiFetch(url, options = {}) {
    const token = getToken();

    options.headers = { ...(options.headers || {}), "Authorization": `Bearer ${token}` };

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

// ===== TOAST =====
(function () {
    const style = document.createElement("style");
    style.textContent = `
        #toast-container { position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none; }
        .toast { display:flex; align-items:center; gap:10px; padding:14px 18px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; color:white; min-width:240px; max-width:340px; box-shadow:0 8px 24px rgba(0,0,0,0.35); pointer-events:all; animation:toastIn 0.3s ease; }
        .toast.success { background:#1a3a2a; border-left:4px solid #22c55e; }
        .toast.error   { background:#3a1a1a; border-left:4px solid #ef4444; }
        .toast.info    { background:#1a2a3a; border-left:4px solid #60a5fa; }
        @keyframes toastIn  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px); } }
    `;
    document.head.appendChild(style);
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
})();

function toast(message, type = "info", duration = 3000) {
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span>${message}</span>`;
    document.getElementById("toast-container").appendChild(el);
    setTimeout(() => {
        el.style.animation = "toastOut 0.3s ease forwards";
        setTimeout(() => el.remove(), 300);
    }, duration);
}