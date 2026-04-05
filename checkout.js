const BASE_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : "https://ministore-v1v3.onrender.com";

// ===== MENU =====
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

// ===== LOAD CHECKOUT DATA FROM DB =====
document.addEventListener("DOMContentLoaded", () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch(`${BASE_URL}/cart/${user_id}`)
        .then(res => res.json())
        .then(cart => renderCheckout(cart))
        .catch(err => console.error("Checkout error:", err));
});

// ===== RENDER CHECKOUT =====
function renderCheckout(cart) {
    const itemsContainer = document.getElementById("checkoutItems");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const totalEl = document.getElementById("checkoutTotal");

    itemsContainer.innerHTML = "";
    let subtotal = 0;
    const shipping = 20;

    if (!cart || cart.length === 0) {
        itemsContainer.innerHTML = "<p>Your cart is empty 🛒</p>";
        subtotalEl.innerText = "$0";
        totalEl.innerText = "$0";
        return;
    }

    cart.forEach(item => {
        const qty = item.quantity || 1;
        const itemTotal = item.price * qty;
        subtotal += itemTotal;

        itemsContainer.innerHTML += `
            <div class="order-row">
                <span>${item.name} × ${qty}</span>
                <span>$${itemTotal}</span>
            </div>
        `;
    });

    subtotalEl.innerText = "$" + subtotal;

    // ===== COUPON =====
    let coupon = localStorage.getItem("coupon");
    let discount = 0;
    if (coupon && coupon.toUpperCase() === "ANKIT20") discount = 20;

    let finalTotal = subtotal + shipping - discount;
    if (finalTotal < 0) finalTotal = 0;
    totalEl.innerText = "$" + finalTotal;
}

// ===== PLACE ORDER =====
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".place-order-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return alert("Please login first ❌");

        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!paymentMethod) return alert("Select a payment method ❌");

        // ===== CARD VALIDATION =====
        if (paymentMethod === "Card") {
            const cardNumber = document.getElementById("cardNumber").value;
            const cardName = document.getElementById("cardName").value;
            const expiry = document.getElementById("expiry").value;
            const cvv = document.getElementById("cvv").value;

            if (!cardNumber || !cardName || !expiry || !cvv) {
                alert("Please fill all card details ❌");
                return;
            }
        }

        // ===== ADDRESS =====
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const phone = document.getElementById("phone").value;
        const fullAddress =
            document.getElementById("address").value + ", " +
            document.getElementById("city").value + ", " +
            document.getElementById("state").value + " - " +
            document.getElementById("zip").value;

        if (!firstName || !lastName || !phone || !fullAddress) {
            alert("Please fill all address details ❌");
            return;
        }

        // ===== GET CART DATA FROM BACKEND =====
        fetch(`${BASE_URL}/cart/${user_id}`)
            .then(res => res.json())
            .then(cart => {
                if (!cart || cart.length === 0) return alert("Cart is empty ❌");

                // Calculate total
                let subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
                const shipping = 20;
                const coupon = localStorage.getItem("coupon");
                const discount = (coupon && coupon.toUpperCase() === "ANKIT20") ? 20 : 0;
                const total = subtotal + shipping - discount;

                // ===== PLACE ORDER API =====
                fetch(`${BASE_URL}/orders/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id,
                        items: cart,
                        total,
                        payment: paymentMethod,
                        name: firstName + " " + lastName,
                        phone,
                        address: fullAddress
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert("Order Placed Successfully 🎉");
                            localStorage.removeItem("coupon");
                            // optional: clear cart from backend here
                            window.location.href = "orders.html";
                        } else {
                            alert(data.message || "Failed to place order ❌");
                        }
                    })
                    .catch(err => console.error("Order API error:", err));
            });
    });
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

// ===== PAYMENT TOGGLE =====
function togglePayment() {
    const method = document.querySelector('input[name="payment"]:checked')?.value;
    document.getElementById("cardBox").style.display = "none";
    document.getElementById("upiBox").style.display = "none";

    if (method === "Card") document.getElementById("cardBox").style.display = "block";
    if (method === "UPI") document.getElementById("upiBox").style.display = "block";
}


