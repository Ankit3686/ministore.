// ===== BASE URL =====
const BASE_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : "https://ministore-v1v3.onrender.com";


// ===== NAV MENU =====
function toggleMenu() {
    document.getElementById("nav").classList.toggle("show");
}


// ===== MOBILE DROPDOWN =====
document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        const dropdownLink = dropdown.querySelector("a");

        dropdownLink.addEventListener("click", function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle("active");
            }
        });
    }
});


// ===== ADMIN SECURITY =====
let adminEmail = "kumar22102001ankit@gmail.com";
let currentEmail = localStorage.getItem("loggedInEmail");

if (currentEmail !== adminEmail) {
    alert("Access Denied ❌");
    window.location.href = "login.html";
}


// ===== ADD PRODUCT =====
function addProduct() {

    let name = document.getElementById("pName").value;
    let price = document.getElementById("pPrice").value;
    let image = document.getElementById("pImage").value;
    let type = document.getElementById("sectionSelect").value === "1"
        ? "Phones"
        : "Watches";

    if (!name || !price || !image) {
        alert("Please fill all fields ❌");
        return;
    }

    fetch(`${BASE_URL}/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, image, type })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadProducts();

            document.getElementById("pName").value = "";
            document.getElementById("pPrice").value = "";
            document.getElementById("pImage").value = "";
        })
        .catch(err => console.error(err));
}


// ===== LOAD PRODUCTS =====
function loadProducts() {

    fetch(`${BASE_URL}/products`)
        .then(res => res.json())
        .then(data => {

            let container = document.getElementById("adminProducts");
            if (!container) return;

            container.innerHTML = "";

            data.forEach(product => {

                let row = document.createElement("tr");

                row.innerHTML = `
                <td>${product.id}</td>
                <td>
                    <img src="${product.image}" width="50"
                    onerror="this.src='https://via.placeholder.com/50'">
                </td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.type}</td>
                <td>
                    <button onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </td>
            `;

                container.appendChild(row);
            });

        })
        .catch(err => console.error(err));
}


// ===== DELETE PRODUCT =====
function deleteProduct(id) {

    if (!confirm("Delete this product? ❌")) return;

    fetch(`${BASE_URL}/delete-product/${id}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(() => {
            alert("Product deleted ✅");
            loadProducts();
        })
        .catch(err => console.error(err));
}


// ===== LOAD ALL ORDERS (ADMIN) =====
function loadOrdersAdmin() {

    fetch(`${BASE_URL}/admin/orders`)
        .then(res => res.json())
        .then(data => {

            let container = document.getElementById("adminOrders");
            if (!container) return;

            container.innerHTML = "";

            data.forEach(order => {

                let products = "";

                if (Array.isArray(order.items)) {
                    order.items.forEach(i => {

                        const name = i.name || "Item";
                        const qty = i.quantity || 1;
                        const img = i.image || i.img || i.product_image || "https://via.placeholder.com/40";

                        products += `
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                                <img src="${img}" width="35" height="35"
                                    style="border-radius:6px; object-fit:cover;"
                                    onerror="this.src='https://via.placeholder.com/40'">
                                <span>${name} × ${qty}</span>
                            </div>
                        `;
                    });
                }

                let row = document.createElement("tr");

                row.innerHTML = `
                    <td>
                        <span class="order-link" onclick="viewOrder(${order.id})"
                        style="cursor:pointer; color:blue;">
                            ${order.id}
                        </span>
                    </td>
                    <td>${order.name || "-"}</td>
                    <td>${order.phone || "-"}</td>
                    <td>${products || "-"}</td>
                    <td>$${order.total || 0}</td>
                    <td>${order.payment || "-"}</td>
                    <td>
                        <select onchange="updateStatus(${order.id}, this.value)">
                            <option ${order.status === "Processing" ? "selected" : ""}>Processing</option>
                            <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                            <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="deleteOrderAdmin(${order.id})">
                            Delete
                        </button>
                    </td>
                `;

                container.appendChild(row);
            });

        })
        .catch(err => console.error("Order Load Error:", err));
}


// ===== UPDATE ORDER STATUS =====
function updateStatus(orderId, status) {

    fetch(`${BASE_URL}/admin/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: status })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Status Updated ✅");
            } else {
                alert("Update Failed ❌");
            }
        })
        .catch(err => console.error(err));
}


// ===== DELETE ORDER =====
function deleteOrderAdmin(orderId) {

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
                loadOrdersAdmin();
            } else {
                alert("Delete Failed ❌");
            }
        })
        .catch(err => console.error(err));
}


// ===== VIEW ORDER DETAILS =====
function viewOrder(orderId) {
    window.location.href = "order-details.html?id=" + orderId;

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


// ===== LOAD DATA ON PAGE LOAD =====
document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
    loadOrdersAdmin();
});
