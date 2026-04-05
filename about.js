const BASE_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : "https://ministore-v1v3.onrender.com";

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



/* ===== BLOG SLIDER ===== */

let blogSlides = document.querySelectorAll(".blog-slide");
let blogIndex = 0;

function showBlogSlide(i) {

    blogSlides.forEach(slide => slide.classList.remove("active"));
    blogSlides[i].classList.add("active");

}

function nextBlog() {

    blogIndex++;
    if (blogIndex >= blogSlides.length) blogIndex = 0;

    showBlogSlide(blogIndex);
}

function prevBlog() {

    blogIndex--;
    if (blogIndex < 0) blogIndex = blogSlides.length - 1;

    showBlogSlide(blogIndex);
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


