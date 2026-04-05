const BASE_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : "https://ministore-v1v3.onrender.com";

// ===== NAV MENU =====
function toggleMenu() {
    document.getElementById("nav").classList.toggle("show");
}

// ===== MOBILE DROPDOWN =====
document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        const dropdownLink = dropdown.querySelector("a");
        dropdownLink.addEventListener("click", (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle("active");
            }
        });
    }
});

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

// ===== ADMIN LINK SHOW =====
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

// ===== LOAD PRODUCTS =====
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("productsContainer");
    const watchContainer = document.getElementById("watchContainer");
    if (!productsContainer && !watchContainer) return; // cart page

    fetch(`${BASE_URL}/products`)
        .then(res => res.json())
        .then(data => {
            productsContainer.innerHTML = "";
            watchContainer.innerHTML = "";

            data.forEach(product => {
                const card = document.createElement("div");
                card.classList.add("product-card");
                card.innerHTML = `
                    <div class="img-box">
                        <img src="${product.image}" onerror="this.src='https://via.placeholder.com/150'">
                        <button class="cart-btn" data-id="${product.id}" data-name="${product.name}">Add To Cart</button>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>₹${product.price}</p>
                    </div>
                `;
                if (product.type === "Phones") productsContainer.appendChild(card);
                else watchContainer.appendChild(card);
            });

            attachCartEvents();
        });
});

// ===== ADD TO CART =====
function attachCartEvents() {
    document.querySelectorAll(".cart-btn").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;
            const productName = button.dataset.name;
            const user_id = localStorage.getItem("user_id");

            if (!user_id) {
                alert("Please login first ❌");
                return;
            }

            fetch(`${BASE_URL}/cart/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, product_id: productId })
            })
                .then(res => res.json())
                .then(data => {
                    alert(`${productName} added to cart ✅`);
                })
                .catch(err => console.error("Add to cart error:", err));
        });
    });
}

// ===== CART PAGE FUNCTIONALITY =====
document.addEventListener("DOMContentLoaded", () => {
    const cartBody = document.getElementById("cartBody");
    if (!cartBody) return; // not cart page

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("Please login first ❌");
        window.location.href = "login.html";
        return;
    }

    loadCart(user_id);
});

// ===== LOAD CART =====
function loadCart(user_id) {
    fetch(`${BASE_URL}/cart/${user_id}`)
        .then(res => res.json())
        .then(data => renderCart(data))
        .catch(err => console.error("Cart Load Error:", err));
}

// ===== RENDER CART =====
function renderCart(cart) {
    const cartBody = document.getElementById("cartBody");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
    const emptyCart = document.getElementById("emptyCart");
    const cartTable = document.getElementById("cartTable");

    cartBody.innerHTML = "";

    let subtotal = 0;

    if (!cart || cart.length === 0) {
        if (cartTable) cartTable.style.display = "none";
        if (emptyCart) emptyCart.style.display = "block";
        if (subtotalEl) subtotalEl.innerText = "$0";
        if (totalEl) totalEl.innerText = "$0";
        return;
    }

    if (cartTable) cartTable.style.display = "block";
    if (emptyCart) emptyCart.style.display = "none";

    cart.forEach(item => {
        const qty = item.quantity || 1;
        const sub = item.price * qty;
        subtotal += sub;

        cartBody.innerHTML += `
            <tr id="row-${item.id}">
                <td>
                    <img src="${item.image}" width="60" onerror="this.src='https://via.placeholder.com/60'">
                    ${item.name}
                </td>
                <td>$${item.price}</td>
                <td>
                    <div class="qty-box">
                        <button onclick="changeQty(${item.id}, 'dec')">-</button>
                        <span id="qty-${item.id}">${qty}</span>
                        <button onclick="changeQty(${item.id}, 'inc')">+</button>
                    </div>
                </td>
                <td id="sub-${item.id}">$${sub}</td>
                <td>
                    <button onclick="removeItem(${item.id})">Remove</button>
                </td>
            </tr>
        `;
    });

    if (subtotalEl) subtotalEl.innerText = "$" + subtotal;

    updateTotal();
}

// ===== UPDATE TOTAL =====
function updateTotal() {
    const subtotalText = document.getElementById("subtotal")?.innerText || "$0";
    let subtotal = Number(subtotalText.replace("$", ""));

    const shipping = 20;

    const coupon = localStorage.getItem("coupon");
    let discount = 0;
    if (coupon && coupon.toUpperCase() === "ANKIT20") discount = 20;

    let finalTotal = subtotal + shipping - discount;
    if (finalTotal < 0) finalTotal = 0;

    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.innerText = "$" + finalTotal;
}

// ===== CHANGE QTY =====
function changeQty(cart_id, action) {
    fetch(`${BASE_URL}/cart/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id, action })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const user_id = localStorage.getItem("user_id");
                loadCart(user_id);
            }
        });
}

// ===== REMOVE ITEM =====
function removeItem(cart_id) {
    fetch(`${BASE_URL}/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const user_id = localStorage.getItem("user_id");
                loadCart(user_id);
            }
        });
}

// ===== COUPON =====
function applyCoupon() {
    const code = document.getElementById("couponInput")?.value.trim();
    if (!code) return;

    if (code.toUpperCase() === "ANKIT20") {
        localStorage.setItem("coupon", "ANKIT20");
        document.getElementById("couponMessage").innerText = "₹20 OFF Applied 🎉";
    } else {
        document.getElementById("couponMessage").innerText = "Invalid Coupon ❌";
    }
    updateTotal();
}

// ===== CLEAR COUPON =====
function clearCoupon() {
    localStorage.removeItem("coupon");
    document.getElementById("couponMessage").innerText = "Coupon Removed";
    updateTotal();
}

