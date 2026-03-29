// ================= AUTH GUARD =================
const role = localStorage.getItem("role");
if (!role) window.location.href = "login.html";
if (role !== "chef" && role !== "admin") {
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:100px;color:white;'>Access Denied</h2>";
}

let currentOrders = "";

async function load() {
    try {
        const a   = await apiFetch("/orders/dashboard");
        const res = await a.json();

        const newOrders = JSON.stringify(res);
        if (newOrders === currentOrders) return;
        currentOrders = newOrders;

        if (!res || res.length === 0) {
            document.getElementById("dboard").innerHTML = `<p class="no-orders">No active orders</p>`;
            return;
        }

        document.getElementById("dboard").innerHTML = res.map(order => `
        <div class="order-container">
            <h2>Order #${order.items[0].order_id} | ${order.orderStatus}</h2>
            ${order.items.map(item => `
                <div class="order">
                    <h3>${item.item_name}</h3>
                    <p>Qty: ${item.quantity}</p>
                </div>
            `).join("")}
            <button onclick="orderDone(${order.items[0].order_id})">✓ Done</button>
        </div>`).join("");

    } catch (err) {
        if (err.message !== "Unauthorized") {
            document.getElementById("dboard").innerHTML = "<p style='color:#ef4444;text-align:center'>Error loading orders</p>";
        }
    }
}

async function orderDone(id) {
    try {
        await apiFetch(`/orderDone/${id}`, { method: "DELETE" });
        load();
    } catch (err) {
        console.error(err);
    }
}

load();
setInterval(load, 5000);