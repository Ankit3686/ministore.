const BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://ministore-production-ff58.up.railway.app";

function toggleMenu() {
    document.getElementById("nav").classList.toggle("show");
}
/* ===== MOBILE DROPDOWN  ===== */

document.addEventListener("DOMContentLoaded", function () {

    const dropdown = document.querySelector(".dropdown");
    const dropdownLink = dropdown.querySelector("a");

    dropdownLink.addEventListener("click", function (e) {

        if (window.innerWidth <= 768) {
            e.preventDefault(); // sirf pages menu toggle karega
            dropdown.classList.toggle("active");
        }

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
// ==== ADMIN LINK =====
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
