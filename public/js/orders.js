const role = localStorage.getItem("role");
if (!role) window.location.href = "login.html";
if (role !== "chef" && role !== "admin") {
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:100px;color:white;'>Access Denied</h2>";
}

let currentOrders = "";

async function load() {
    try {
        const token = localStorage.getItem("token");
        const a = await fetch("/orders/dashboard", {
            headers: { "Authorization": `Bearer ${token}` }
        });
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
        console.error(err);
    }
}

async function orderDone(id) {
    try {
        const token = localStorage.getItem("token");
        await fetch(`/orderDone/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        load();
    } catch (err) {
        console.error(err);
    }
}

load();
setInterval(load, 5000);