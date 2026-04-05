const BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://ministore-production-ff58.up.railway.app";

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


// ===== REGISTER FORM (DB CONNECTED) =====
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        // ===== VALIDATION =====
        if (!name || !email || !password || !confirmPassword) {
            alert("Fill all fields ❌");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match ❌");
            return;
        }

        // ===== API CALL (FIXED) =====
        fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,        // ✅ FIXED (IMPORTANT)
                email: email,
                password: password
            })
        })
            .then(res => res.json())
            .then(data => {

                if (data.success) {

                    alert("Registration Successful ✅");

                    // save locally
                    localStorage.setItem("loggedInUser", name);
                    localStorage.setItem("loggedInEmail", email);

                    window.location.href = "login.html";

                } else {
                    alert(data.message || "Registration failed ❌");
                }

            })
            .catch(err => {
                console.error("Signup error:", err);
                alert("Server error ❌");
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

// ===== LOGOUT =====
function logout() {
    localStorage.clear();
    alert("Logged Out Successfully");
    window.location.href = "login.html";
}
