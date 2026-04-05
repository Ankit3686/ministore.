const BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://ministore-production-ff58.up.railway.app";

document.addEventListener("DOMContentLoaded", function () {

    let user_id = localStorage.getItem("user_id");

    if (!user_id) {
        window.location.href = "login.html";
        return;
    }

    // ===== FETCH USER FROM DB =====
    fetch(`${BASE_URL}/user/${user_id}`)
        .then(res => res.json())
        .then(user => {

            if (!user) return;

            // ===== USERNAME LETTER (FIXED) =====
            let usernameEl = document.getElementById("username");

            if (usernameEl) {
                let name = user.name || "User";
                usernameEl.innerText = name.charAt(0).toUpperCase();
            }

            // ===== PROFILE DATA =====
            document.getElementById("profileName").innerText =
                user.name || "User";

            document.getElementById("profileEmail").innerText =
                user.email || "-";

            // ===== ACCOUNT TYPE =====
            let accountType = document.getElementById("accountType");

            if (accountType) {
                accountType.innerText =
                    user.email === "kumar22102001ankit@gmail.com"
                        ? "Admin"
                        : "User";
            }

            // ===== PROFILE IMAGE =====
            if (user.image) {
                document.getElementById("profileImage").src = user.image;
            }

        })
        .catch(err => console.error("Profile error:", err));


    // ===== IMAGE UPLOAD =====
    let uploadInput = document.getElementById("imageUpload");

    if (uploadInput) {
        uploadInput.addEventListener("change", function () {

            let file = this.files[0];
            if (!file) return;

            let formData = new FormData();
            formData.append("image", file);
            formData.append("user_id", user_id);

            fetch(`${BASE_URL}/upload-profile`, {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById("profileImage").src = data.image;
                    }
                });

        });
    }

    // ===== ADMIN LINK =====
    const adminEmail = "kumar22102001ankit@gmail.com";
    const currentEmail = localStorage.getItem("loggedInEmail");
    const adminEl = document.getElementById("adminLink");

    if (adminEl) {
        adminEl.style.display = (currentEmail === adminEmail)
            ? "inline-block"
            : "none";
    }

    // ===== MOBILE DROPDOWN (SAFE) =====
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


// ===== LOGOUT =====
function logout() {
    localStorage.clear();
    alert("Logged Out ✅");
    window.location.href = "login.html";
}


// ===== MENU =====
function toggleMenu() {
    document.getElementById("nav").classList.toggle("show");
}
