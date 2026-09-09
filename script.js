/* =====================================================
   PATCH 0 - JavaScript அடிப்படை
   இந்த File index.html Home Page-க்கு மட்டும்.
   ===================================================== */
"use strict";

/* =====================================================
   PATCH 1 - START - NAVIGATION BAR CONTROL
   ===================================================== */
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("navLinks"); // <-- இதை மாத்துங்க mainNav -> navLinks

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("is-open");
        menuToggle.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "மெனுவை மூடவும்" : "மெனுவை திறக்கவும்"
        );
    });

    const navLinks = mainNav.querySelectorAll("a"); // <-- .nav-link -> a

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("is-open");
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "மெனுவை திறக்க");
        });
    });
}
/* PATCH 1 - END */


/* =====================================================
   PATCH 4 - START - AUTO MESSAGE SLIDER CONTROL
   இதில் இருப்பது:
   தானாக மாறும் 3 தகவல்கள்
   Prev / Next Button
   Dot Button
   ===================================================== */

const slides = document.querySelectorAll(".message-slide");
const sliderDots = document.querySelectorAll(".slider-dot");
const prevSlideButton = document.getElementById("prevSlide");
const nextSlideButton = document.getElementById("nextSlide");
const messageSlider = document.getElementById("messageSlider");

let currentSlide = 0;
let sliderInterval;

function showSlide(index) {

    if (!slides.length) return;

    if (index < 0) {
        currentSlide = slides.length - 1;
    } 
    else if (index >= slides.length) {
        currentSlide = 0;
    } 
    else {
        currentSlide = index;
    }

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle(
            "active",
            slideIndex === currentSlide
        );
    });

    sliderDots.forEach((dot, dotIndex) => {
        dot.classList.toggle(
            "active",
            dotIndex === currentSlide
        );
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

function startAutoSlider() {

    stopAutoSlider();

    sliderInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopAutoSlider() {

    if (sliderInterval) {
        clearInterval(sliderInterval);
    }
}

if (nextSlideButton) {

    nextSlideButton.addEventListener("click", () => {
        nextSlide();
        startAutoSlider();
    });
}

if (prevSlideButton) {

    prevSlideButton.addEventListener("click", () => {
        previousSlide();
        startAutoSlider();
    });
}

sliderDots.forEach((dot) => {

    dot.addEventListener("click", () => {

        const slideNumber = Number(dot.dataset.slide);

        showSlide(slideNumber);

        startAutoSlider();
    });
});

if (messageSlider) {

    messageSlider.addEventListener(
        "mouseenter",
        stopAutoSlider
    );

    messageSlider.addEventListener(
        "mouseleave",
        startAutoSlider
    );
}

if (slides.length > 0) {

    showSlide(0);

    startAutoSlider();
}

/* =====================================================
   PATCH 4 - END
   ===================================================== */


/* =====================================================
   PATCH 5 - START
   CONTACT FORM + GOOGLE SHEET இணைப்பு

   BATCH 5.1:
   Validation - பெயர், போன் சரியா என்று பார்க்கும்

   BATCH 5.2:
   Google Sheet-க்கு அனுப்பும்

   BATCH 5.3:
   Admin-க்கு Full Data
   Public-க்கு தெரியாது
   ===================================================== */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        /* ---------------------------------------------
           BATCH 5.1
           Form-ல் இருந்து Data எடுக்கும்
        --------------------------------------------- */

        const name =
            document.getElementById("contactName")
                .value
                .trim();

        const phone =
            document.getElementById("contactPhone")
                .value
                .trim();

        const message =
            document.getElementById("contactMessage")
                .value
                .trim();

        if (formStatus) {

            formStatus.textContent = "";

            formStatus.classList.remove(
                "success",
                "error"
            );
        }


        /* ---------------------------------------------
           BATCH 5.1.1
           பெயர் சரிபார்ப்பு
        --------------------------------------------- */

        if (name.length < 2) {

            showFormStatus(
                "தயவுசெய்து உங்கள் சரியான பெயரை உள்ளிடுங்கள்.",
                "error"
            );

            return;
        }


        /* ---------------------------------------------
           BATCH 5.1.2
           போன் நம்பர் சரிபார்ப்பு
        --------------------------------------------- */

        const phoneDigits =
            phone.replace(/\D/g, "");

        if (
            phoneDigits.length < 10 ||
            phoneDigits.length > 15
        ) {

            showFormStatus(
                "தயவுசெய்து சரியான தொடர்பு எண்ணை உள்ளிடுங்கள்.",
                "error"
            );

            return;
        }


        /* ---------------------------------------------
           BATCH 5.1.3
           Message சரிபார்ப்பு
        --------------------------------------------- */

        if (message.length < 3) {

            showFormStatus(
                "தயவுசெய்து உங்கள் செய்தியை எழுதுங்கள்.",
                "error"
            );

            return;
        }


        /* ---------------------------------------------
           BATCH 5.2
           Google Sheet-க்கு அனுப்புதல்
        --------------------------------------------- */

        showFormStatus(
            "அனுப்பப்படுகிறது...",
            "success"
        );

        try {

            await fetch(GOOGLE_SHEET_URL, {

                method: "POST",

                mode: "no-cors",

                body: JSON.stringify({

                    type: "contact",

                    name: name,

                    phone: phone,

                    message: message
                })
            });


            /* -----------------------------------------
               BATCH 5.3
               Success Message
            ----------------------------------------- */

            showFormStatus(
                "நன்றி! உங்கள் செய்தி Google Sheet-ல் பதிவாகியது.",
                "success"
            );

            contactForm.reset();

        }
        catch (err) {

            showFormStatus(
                "பிழை! மீண்டும் முயற்சிக்கவும்.",
                "error"
            );
        }
    });
}


/* =====================================================
   FORM STATUS MESSAGE
   ===================================================== */

function showFormStatus(text, type) {

    if (!formStatus) return;

    formStatus.textContent = text;

    formStatus.classList.remove(
        "success",
        "error"
    );

    formStatus.classList.add(type);
}


/* =====================================================
   PATCH 5 - END
   ===================================================== */


/* =====================================================
   PATCH 7 - START
   FOOTER CURRENT YEAR CONTROL
   ===================================================== */

const currentYearElement =
    document.getElementById("currentYear");

if (currentYearElement) {

    currentYearElement.textContent =
        new Date().getFullYear();
}

/* =====================================================
   PATCH 7 - END
   ===================================================== */