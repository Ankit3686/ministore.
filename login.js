const BASE_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : "https://ministore-1.onrender.com";
function toggleMenu() {
    document.getElementById("nav").classList.toggle("show");
}

/* ===== MOBILE DROPDOWN ===== */
document.addEventListener("DOMContentLoaded", function () {

    const dropdown = document.querySelector(".dropdown");
    const dropdownLink = dropdown.querySelector("a");

    dropdownLink.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle("active");
        }
    });

    /* ============================
       🔐 LOGIN (BACKEND BASED)
    ============================ */

    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })
                .then(res => res.json())
                .then(data => {

                    if (data.success) {

                        // ✅ MOST IMPORTANT
                        localStorage.setItem("user_id", data.user_id);

                        // UI ke liye
                        localStorage.setItem("loggedInUser", data.name);
                        localStorage.setItem("loggedInEmail", email);


                        alert("Login Successful ✅");

                        window.location.href = "index.html";

                    } else {
                        alert("Invalid Email or Password ❌");
                    }

                })
                .catch(() => {
                    alert("Server error ❌");
                });

        });
    }


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


/* ===== ADMIN LINK ===== */
let adminEmail = "kumar22102001ankit@gmail.com";
let currentEmail = localStorage.getItem("loggedInEmail");

if (currentEmail === adminEmail) {
    document.getElementById("adminLink").style.display = "inline-block";
} else {
    document.getElementById("adminLink").style.display = "none";
}
