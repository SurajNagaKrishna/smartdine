// ================= AUTH GUARD =================
const role        = localStorage.getItem("role");
const currentUser = localStorage.getItem("uname");

if (!role) window.location.href = "login.html";

if (role !== "admin") {
    document.body.innerHTML = `
        <div style="text-align:center;margin-top:100px;font-family:sans-serif;color:#ccc;">
            <h2>🚫 Access Denied</h2><p>Admin only.</p>
        </div>`;
}

// ================= LOGOUT =================
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// ================= TOGGLE USERS =================
function toggleUsers() {
    const box  = document.getElementById("users-container");
    const icon = document.getElementById("users-toggle");
    const open = box.style.display === "block";
    box.style.display = open ? "none" : "block";
    icon.innerText    = open ? "▼" : "▲";
}

// ================= MENU =================
async function loadMenu() {
    try {
        const res   = await apiFetch("/menu");
        const items = await res.json();

        document.getElementById("dboard").innerHTML = items.map(item => `
        <div class="menu-card">
            <div><b>${item.name}</b></div>
            <div class="card-category">${item.category}</div>
            <div class="price-row">
                ₹ <input type="number" id="price-${item.index}" value="${item.price}" min="1">
                <button onclick="updatePrice(${item.index})">Update</button>
            </div>
            <p class="item-msg" id="msg-${item.index}"></p>
            <button onclick="deleteItem(${item.index})">Delete</button>
        </div>`).join("");

    } catch (err) {
        if (err.message !== "Unauthorized")
            toast("Failed to load menu", "error");
    }
}

// ================= ADD ITEM =================
async function addItem() {
    const name     = document.getElementById("new-name").value.trim();
    const price    = document.getElementById("new-price").value.trim();
    const category = document.getElementById("new-category").value;
    const file     = document.getElementById("new-image").files[0];
    const msg      = document.getElementById("add-msg");

    if (!name || !price || !category || !file) {
        msg.className = "msg error";
        msg.innerText = "⚠ Fill all fields";
        return;
    }

    const formData = new FormData();
    formData.append("name",     name);
    formData.append("price",    price);
    formData.append("category", category);
    formData.append("image",    file);

    try {
        const res = await apiFetch("/menu", { method: "POST", body: formData });

        if (res.ok) {
            msg.className = "msg success";
            msg.innerText = "";
            document.getElementById("new-name").value  = "";
            document.getElementById("new-price").value = "";
            document.getElementById("new-category").value = "";
            document.getElementById("new-image").value = "";
            toast("✓ Item added successfully", "success");
            loadMenu();
        } else {
            const d = await res.json();
            toast(d.message || "Failed to add item", "error");
        }
    } catch (err) {
        if (err.message !== "Unauthorized") toast("Failed to add item", "error");
    }
}

// ================= DELETE =================
async function deleteItem(index) {
    if (!confirm("Delete this item?")) return;

    try {
        const res = await apiFetch(`/menu/${index}`, { method: "DELETE" });
        if (res.ok) {
            toast("Item deleted", "info");
            loadMenu();
        } else {
            toast("Failed to delete item", "error");
        }
    } catch (err) {
        if (err.message !== "Unauthorized") toast("Delete failed", "error");
    }
}

// ================= UPDATE PRICE =================
async function updatePrice(index) {
    const input    = document.getElementById(`price-${index}`);
    const msg      = document.getElementById(`msg-${index}`);
    const newPrice = input.value;

    if (!newPrice || newPrice <= 0) {
        msg.className = "item-msg error";
        msg.innerText = "Enter valid price";
        return;
    }

    try {
        const res = await apiFetch(`/menu/${index}`, {
            method: "PUT",
            body:   JSON.stringify({ price: Number(newPrice) })
        });

        if (res.ok) {
            toast("✓ Price updated", "success");
            setTimeout(() => { msg.innerText = ""; }, 100);
        } else {
            msg.className = "item-msg error";
            msg.innerText = "❌ Failed";
        }
    } catch (err) {
        if (err.message !== "Unauthorized") toast("Update failed", "error");
    }
}

// ================= USERS =================
async function loadUsers() {
    try {
        const res   = await apiFetch("/users");
        const users = await res.json();

        document.getElementById("users").innerHTML = users.map(u => `
        <div class="user-card">
            <div class="user-name">${u.uname}</div>
            <input type="email"    value="${u.email}" id="email-${u.id}" placeholder="Email">
            <input type="password" placeholder="New password (leave blank to keep)" id="pass-${u.id}">
            <select class="role-dropdown" id="role-${u.id}">
                <option value="admin" ${u.role==="admin"?"selected":""}>Admin</option>
                <option value="chef"  ${u.role==="chef" ?"selected":""}>Chef</option>
            </select>
            <p class="user-msg" id="user-msg-${u.id}"></p>
            <div class="user-actions">
                <button class="btn-save" onclick="updateUser(${u.id})">Save</button>
                ${u.uname === currentUser
                    ? `<button class="btn-delete" disabled>Self</button>`
                    : `<button class="btn-delete" onclick="deleteUser(${u.id}, '${u.uname}')">Delete</button>`
                }
            </div>
        </div>`).join("");

    } catch (err) {
        if (err.message !== "Unauthorized") toast("Failed to load users", "error");
    }
}

// ================= UPDATE USER =================
async function updateUser(id) {
    const email   = document.getElementById(`email-${id}`).value.trim();
    const password= document.getElementById(`pass-${id}`).value.trim();
    const newRole = document.getElementById(`role-${id}`).value;

    try {
        const res = await apiFetch(`/users/${id}`, {
            method: "PUT",
            body:   JSON.stringify({ email, password, role: newRole })
        });

        const data = await res.json();

        if (res.ok) {
            toast(`✓ ${data.message}`, "success");
            // clear password field after save
            document.getElementById(`pass-${id}`).value = "";
        } else {
            toast(data.message || "Update failed", "error");
        }
    } catch (err) {
        if (err.message !== "Unauthorized") toast("Update failed", "error");
    }
}

// ================= DELETE USER =================
async function deleteUser(id, uname) {
    if (!confirm(`Delete user "${uname}"? This cannot be undone.`)) return;

    try {
        const res  = await apiFetch(`/users/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (res.ok) {
            toast(`✓ ${data.message}`, "success");
            loadUsers();
        } else {
            toast(data.message || "Delete failed", "error");
        }
    } catch (err) {
        if (err.message !== "Unauthorized") toast("Delete failed", "error");
    }
}

// ================= INIT =================
loadMenu();
loadUsers();