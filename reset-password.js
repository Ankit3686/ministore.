const BASE_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : "https://ministore-1.onrender.com";

// ===== RESET PASSWORD (BACKEND) =====
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("resetForm");

    if (form) {
        form.addEventListener("submit", function (e) {

            e.preventDefault();

            let email = document.getElementById("email").value.trim();
            let newPassword = document.getElementById("newPassword").value.trim();

            if (!email || !newPassword) {
                alert("Please fill all fields ❌");
                return;
            }

            fetch(`${BASE_URL}/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: newPassword
                })
            })
                .then(res => res.json())
                .then(data => {

                    if (data.success) {
                        alert("Password Reset Successful ✅");
                        window.location.href = "login.html";
                    } else {
                        alert(data.message || "Reset failed ❌");
                    }

                })
                .catch(err => {
                    console.error("Reset error:", err);
                    alert("Server error ❌");
                });

        });
    }

});


// ===== MENU =====
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
document.addEventListener("DOMContentLoaded", function () {

    const adminEmail = "kumar22102001ankit@gmail.com";
    const currentEmail = localStorage.getItem("loggedInEmail");
    const adminEl = document.getElementById("adminLink");

    if (adminEl) {
        adminEl.style.display = (currentEmail === adminEmail)
            ? "inline-block"
            : "none";
    }

});
