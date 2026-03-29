let menuItems = [];
let itemsQty  = [];

// =======================
// LOAD MENU — grouped into accordion dropdowns
// =======================
async function loadMenu() {
    const main = document.getElementById("menu-main");

    try {
        const res = await fetch("/menu");
        menuItems = await res.json();
        itemsQty  = new Array(menuItems.length).fill(0);

        const grouped = {};
        for (const item of menuItems) {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        }

        let html = "";

        for (const [category, items] of Object.entries(grouped)) {
            const catId = category.replace(/\s+/g, "-").toLowerCase();

            html += `
            <div class="category-block">
                <button class="cat-toggle" onclick="toggleCategory('${catId}')">
                    <span>${categoryEmoji(category)} ${category}</span>
                    <span class="cat-arrow" id="arrow-${catId}">▼</span>
                </button>
                <div class="cat-items" id="cat-${catId}">`;

            for (const item of items) {
                const i = menuItems.indexOf(item);
                html += `
                    <div class="menu-item">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}"
                                 onerror="this.src='https://placehold.co/90x90/1a2a3a/ffffff?text=🍽'">
                        </div>
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p class="price">₹${item.price}</p>
                        </div>
                        <div class="item-qty">
                            <button onclick="Decrease(${i})">−</button>
                            <span id="qty-${i}">0</span>
                            <button onclick="increaseQuantity(${i})">+</button>
                        </div>
                    </div>`;
            }

            html += `</div></div>`;
        }

        html += `
        <p id="empty-msg" class="empty-msg"></p>
        <button id="cart" onclick="submit()">🛒 Place Order</button>`;

        main.innerHTML = html;

        // Open first category by default
        const firstId = Object.keys(grouped)[0].replace(/\s+/g, "-").toLowerCase();
        openCategory(firstId);

    } catch (err) {
        main.innerHTML = `<p style="color:#ff6b6b;text-align:center;padding:40px;">Failed to load menu. Please refresh.</p>`;
        console.error(err);
    }
}

function categoryEmoji(cat) {
    const map = { "Non-Veg":"🍖", "Veg":"🥗", "Starters":"🍟", "Pizza":"🍕", "Beverages":"🥤", "Desserts":"🍰" };
    return map[cat] || "🍽";
}

function toggleCategory(catId) {
    const box  = document.getElementById(`cat-${catId}`);
    const open = box.classList.contains("open");
    if (open) {
        box.classList.remove("open");
        document.getElementById(`arrow-${catId}`).innerText = "▼";
    } else {
        openCategory(catId);
    }
}

function openCategory(catId) {
    const box = document.getElementById(`cat-${catId}`);
    if (!box) return;
    box.classList.add("open");
    document.getElementById(`arrow-${catId}`).innerText = "▲";
}

// =======================
// QTY
// =======================
function increaseQuantity(i) {
    itemsQty[i] = (itemsQty[i] || 0) + 1;
    document.getElementById(`qty-${i}`).innerText = itemsQty[i];
    updateCartBtn();
}

function Decrease(i) {
    if ((itemsQty[i] || 0) > 0) {
        itemsQty[i]--;
        document.getElementById(`qty-${i}`).innerText = itemsQty[i];
        updateCartBtn();
    }
}

function updateCartBtn() {
    const total = itemsQty.reduce((s, v) => s + v, 0);
    const btn   = document.getElementById("cart");
    if (!btn) return;
    btn.innerText = total > 0 ? `🛒 Place Order (${total} item${total > 1 ? "s" : ""})` : "🛒 Place Order";
}

// =======================
// SUBMIT
// =======================
function submit() {
    let cart = [];
    for (let i = 0; i < menuItems.length; i++) {
        if (itemsQty[i] > 0) {
            cart.push({ name: menuItems[i].name, quantity: itemsQty[i], price: Number(menuItems[i].price) });
        }
    }

    const emptyMsg = document.getElementById("empty-msg");
    if (cart.length === 0) { emptyMsg.innerText = "⚠ Please select at least one item."; return; }
    emptyMsg.innerText = "";

    const total = cart.reduce((s, item) => s + item.price * item.quantity, 0);

    document.getElementById("confirm-body").innerHTML = cart.map(item => `
        <tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${item.price}</td><td>₹${item.price * item.quantity}</td></tr>
    `).join("");
    document.getElementById("confirm-total").innerText = `Total: ₹${total}`;
    document.getElementById("confirm-overlay").style.display = "flex";
    window._pendingCart = cart;
}

function cancelOrder() {
    document.getElementById("confirm-overlay").style.display = "none";
}

// =======================
// CONFIRM ORDER
// =======================
async function confirmOrder() {
    document.getElementById("confirm-overlay").style.display = "none";
    const cart = window._pendingCart;

    try {
        const a   = await fetch('/order', { method:'POST', headers:{"Content-Type":"application/json"}, body: JSON.stringify(cart) });
        const res = await a.json();

        if (a.status === 200) {
            itemsQty.fill(0);
            menuItems.forEach((_, i) => { const el = document.getElementById(`qty-${i}`); if (el) el.innerText = "0"; });
            updateCartBtn();

            const b    = await fetch(`/bill/${res.id}`);
            const bill = await b.json();

            document.body.innerHTML = `
            <style>
                body{background:linear-gradient(135deg,#141e30,#243b55);min-height:100vh;padding:40px 20px;color:white;font-family:'Poppins',sans-serif;margin:0;}
                .bw{max-width:600px;margin:auto;}
                .bw h1{text-align:center;font-size:2rem;margin-bottom:6px;}
                .bw .sub{text-align:center;opacity:0.6;margin-bottom:30px;}
                .bt{width:100%;border-collapse:collapse;margin-bottom:20px;}
                .bt th,.bt td{border:1px solid rgba(255,255,255,0.2);padding:12px;text-align:center;}
                .bt th{background:rgba(255,255,255,0.1);}
                .bt tr:nth-child(even){background:rgba(255,255,255,0.05);}
                .ba{font-size:22px;font-weight:bold;text-align:right;color:#ffcc00;margin-bottom:24px;}
                .bacts{display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;}
                .bacts button{padding:12px 24px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;}
                .bp{background:linear-gradient(135deg,#5f2c82,#49a09d);color:white;}
                .bb{background:transparent;border:1px solid rgba(255,255,255,0.3)!important;color:white;}
            </style>
            <div class="bw">
                <h1>🧾 Your Bill</h1>
                <p class="sub">Order #${res.id}</p>
                <table class="bt">
                    <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                    <tbody>${bill.items.map(item=>`<tr><td>${item.name}</td><td>${item.qty}</td><td>₹${item.price}</td><td>₹${item.price*item.qty}</td></tr>`).join("")}</tbody>
                </table>
                <div class="ba">Total: ₹${bill.amount}</div>
                <div class="bacts">
                    <button class="bb" onclick="location.href='order.html'">← New Order</button>
                    <button class="bp" onclick="window.print()">🖨 Print</button>
                </div>
            </div>`;
        } else {
            document.getElementById("empty-msg").innerText = res.message || "Something went wrong.";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("empty-msg").innerText = "Server error. Check backend.";
    }
}

loadMenu();