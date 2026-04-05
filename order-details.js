const BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://ministore-production-ff58.up.railway.app";

// ===== BACK BUTTON =====
function goBack() {
    window.history.back();
}


// ===== LOAD ORDER DETAILS =====
document.addEventListener("DOMContentLoaded", function () {

    let params = new URLSearchParams(window.location.search);
    let orderId = params.get("id");

    if (!orderId) return;

    fetch(`${BASE_URL}/order/${orderId}`)
        .then(res => res.json())
        .then(order => {

            if (!order || !order.id) return;

            // ===== BASIC INFO =====
            document.getElementById("invId").innerText = order.id;
            document.getElementById("invDate").innerText = order.date || "-";
            document.getElementById("invStatus").innerText = order.status || "-";
            document.getElementById("invUser").innerText = order.name || "-";
            document.getElementById("invPhone").innerText = order.phone || "-";
            document.getElementById("invAddress").innerText = order.address || "-";
            document.getElementById("invTotal").innerText = order.total || 0;

            // ===== PRODUCTS =====
            let productsHTML = "";

            if (Array.isArray(order.items)) {
                order.items.forEach(item => {

                    const name = item.name || "Item";
                    const qty = item.quantity || 1;
                    const img = item.image || "https://via.placeholder.com/50";

                    productsHTML += `
                        <tr>
                            <td>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <img src="${img}" width="50" height="50"
                                        style="border-radius:6px; object-fit:cover;"
                                        onerror="this.src='https://via.placeholder.com/50'">
                                    ${name}
                                </div>
                            </td>
                            <td>${qty}</td>
                            <td>$${item.price || 0}</td>
                        </tr>
                    `;
                });
            }

            document.getElementById("invProducts").innerHTML = productsHTML;

        })
        .catch(err => console.error("Order Detail Error:", err));
});


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

