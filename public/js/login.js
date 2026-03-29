const urlMsg = new URLSearchParams(window.location.search).get("msg");
if (urlMsg) {
    const msg = document.getElementById("login-msg");
    msg.style.color = "#e59e3e";
    msg.innerText = urlMsg;
}

document.getElementById("bt2").addEventListener("click", function (e) {
    e.preventDefault();

    const uname = document.getElementById("username").value.trim();
    const pass  = document.getElementById("password").value.trim();
    const msg   = document.getElementById("login-msg");

    if (!uname || !pass) {
        msg.style.color = "#e53e3e";
        msg.innerText = "Please enter username and password.";
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uname, pass })
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
        if (status === 200) {
            localStorage.setItem("token", data.token);  // ← JWT token
            localStorage.setItem("role",  data.role);
            localStorage.setItem("uname", data.uname);

            msg.style.color = "#22a35a";
            msg.innerText = "✓ Login successful! Redirecting...";

            setTimeout(() => {
                window.location.href = data.role === "admin" ? "dashboard.html" : "orders.html";
            }, 800);
        } else {
            msg.style.color = "#e53e3e";
            msg.innerText = data.message || "Invalid username or password.";
        }
    })
    .catch(() => {
        msg.style.color = "#e53e3e";
        msg.innerText = "Server error.";
    });
});