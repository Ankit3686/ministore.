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
    const dropdownLink = dropdown.querySelector("a");

    dropdownLink.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle("active");
        }
    });

});


// ===== SLIDER =====
let slides = document.querySelectorAll(".slide");
let index = 0;

function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[i].classList.add("active");
}

function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
}

function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
}


// ===== BLOG SLIDER =====
let blogSlides = document.querySelectorAll(".blog-slide");
let blogIndex = 0;

function showBlogSlide(i) {
    blogSlides.forEach(slide => slide.classList.remove("active"));
    blogSlides[i].classList.add("active");
}

function nextBlog() {
    blogIndex = (blogIndex + 1) % blogSlides.length;
    showBlogSlide(blogIndex);
}

function prevBlog() {
    blogIndex = (blogIndex - 1 + blogSlides.length) % blogSlides.length;
    showBlogSlide(blogIndex);
}


// ===== NAV ACTIVE ON SCROLL =====
window.addEventListener("scroll", function () {

    const sections = [
        { id: "home", link: "homeLink" },
        { id: "services", link: "serviceLink" },
        { id: "products", link: "productLink" },
        { id: "watch", link: "watchLink" },
        { id: "sale", link: "saleLink" },
        { id: "blog", link: "blogLink" },
    ];

    let scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        let sec = document.getElementById(section.id);
        let navLink = document.getElementById(section.link);

        if (!sec) return;

        let top = sec.offsetTop;
        let bottom = top + sec.offsetHeight;

        if (scrollPos >= top && scrollPos < bottom) {
            document.querySelectorAll(".nav-link")
                .forEach(link => link.classList.remove("active"));

            navLink.classList.add("active");
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


// ===== LOAD PRODUCTS FROM BACKEND =====
document.addEventListener("DOMContentLoaded", function () {

    fetch(`${BASE_URL}/products`)
        .then(res => res.json())
        .then(data => {

            let productContainer = document.getElementById("productsContainer");
            let watchContainer = document.getElementById("watchContainer");

            productContainer.innerHTML = "";
            watchContainer.innerHTML = "";

            data.forEach(product => {

                let card = document.createElement("div");
                card.classList.add("product-card");

                card.innerHTML = `
                <div class="img-box">
                    <img src="${product.image}"
                         onerror="this.src='https://via.placeholder.com/150'">

                    <button class="cart-btn"
                        data-id="${product.id}">
                        Add To Cart
                    </button>
                </div>

                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                </div>
            `;

                if (product.type === "Phones") {
                    productContainer.appendChild(card);
                } else {
                    watchContainer.appendChild(card);
                }

            });

            attachCartEvents();

        });

});


// ===== ADD TO CART (BACKEND) =====
function attachCartEvents() {

    document.querySelectorAll(".cart-btn").forEach(button => {

        button.addEventListener("click", function () {

            let productId = this.dataset.id;
            let user_id = localStorage.getItem("user_id");

            if (!user_id) {
                alert("Please login first ❌");
                return;
            }

            fetch(`${BASE_URL}/cart/add`, {   // ✅ FIXED
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user_id,
                    product_id: productId
                })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || "Product Added To Cart 🛒");
                })
                .catch(err => {
                    console.error("Add to cart error:", err);
                });

        });

    });

}

