const BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://ministore-production-ff58.up.railway.app";

// ===== LOAD ORDERS =====
document.addEventListener("DOMContentLoaded", () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = "login.html";
        return;
    }

    loadOrders(user_id);
    setupNav();
    showUserName();
    showAdminLink();
});

// ===== FETCH & RENDER ORDERS =====
function loadOrders(user_id) {
    fetch(`${BASE_URL}/orders/${user_id}`)
        .then(res => res.json())
        .then(orders => renderOrders(orders))
        .catch(err => console.error("Order Load Error:", err));
}

function renderOrders(orders) {
    const container = document.getElementById("orders");
    container.innerHTML = "";

    if (!orders || !orders.length) {
        container.innerHTML = "<tr><td colspan='5'>No Orders Found</td></tr>";
        return;
    }

    orders.forEach(order => {

        // ===== ITEMS SAFE HANDLE =====
        let products = "";

        if (typeof order.items === "string") {
            try {
                order.items = JSON.parse(order.items);
            } catch {
                order.items = [];
            }
        }

        if (Array.isArray(order.items)) {
            order.items.forEach(i => {
                const qty = i.quantity || 1;
                const name = i.name || "Item";
                products += `<div class="badge">${name} × ${qty}</div>`;
            });
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id || "-"}</td>
            <td>${order.name || "-"}</td>
            <td>${products || "-"}</td>
            <td><span class="status ${order.status || ""}">
                ${order.status || "pending"}
            </span></td>
            <td>
                <button class="delete-btn" onclick="deleteOrder(${order.id})">
                    Delete
                </button>
            </td>
        `;

        container.appendChild(row);
    });
}

// ===== OPEN ORDER DETAILS PAGE =====
function openOrderDetails(orderId) {
    window.location.href = `order-details.html?order_id=${orderId}`;
}

// ===== DELETE ORDER =====
function deleteOrder(orderId) {
    if (!confirm("Delete this order?")) return;

    fetch(`${BASE_URL}/order/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Order Deleted ✅");
                loadOrders(localStorage.getItem("user_id"));
            } else {
                alert("Delete Failed ❌");
            }
        })
        .catch(err => console.error("Delete error:", err));
}

// ===== NAV & DROPDOWN =====
function setupNav() {
    const dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        const dropdownLink = dropdown.querySelector("a");
        dropdownLink.addEventListener("click", e => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle("active");
            }
        });
    }
}

function toggleMenu() {
    document.getElementById("nav").classList.toggle("show");
}

// ===== USER LETTER (SAME AS PROFILE) =====
document.addEventListener("DOMContentLoaded", function () {

    let user_id = localStorage.getItem("user_id");
    let usernameEl = document.getElementById("username");

    if (!user_id || !usernameEl) {
        if (usernameEl) usernameEl.style.display = "none";
        return;
    }

    fetch(`${BASE_URL}/user/${user_id}`)
        .then(res => res.json())
        .then(user => {

            if (!user) return;

            let name = user.name || "User";
            usernameEl.innerText = name.charAt(0).toUpperCase();

        })
        .catch(err => {
            console.error("User fetch error:", err);
        });

});

// ===== ADMIN LINK =====
const adminEmail = "kumar22102001ankit@gmail.com";
const currentEmail = localStorage.getItem("loggedInEmail");
document.addEventListener("DOMContentLoaded", function () {
    let adminEl = document.getElementById("adminLink");

    if (adminEl) {
        adminEl.style.display = (currentEmail === adminEmail)
            ? "inline-block"
            : "none";
    }
});
