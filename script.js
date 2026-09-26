// ============================================================
// INAIPPU PALAM - script.js - FINAL CLEAN SHEET - HANG FIX
// ============================================================

/*jshint esversion: 8 */

// ============================================================
// BATCH 1 - DOM READY - Page Load ஆன பிறகு தான் Script Run ஆகணும்
// இது இல்லைனா Hang ஆகும்
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
  console.log("✅ Inaippu Palam - script.js Loaded");

  // ============================================================
  // BATCH 2 - NAVBAR TOGGLE - Mobile Menu Open / Close
  // இது தான் Menu Button வேலை
  // ============================================================
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function() {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // ============================================================
  // BATCH 3 - FOOTER YEAR - Auto Year Update (2026)
  // Footer-ல் © 2026னு வர இது தான்
  // ============================================================
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ============================================================
  // BATCH 4 - INFORMATION SLIDER - Main Slider Logic - HANG FIX
  // உங்க index.html-ல் இருக்கிற PATCH 4 Slider-க்கானது
  // Screenshot-ல் Stuck ஆனது இதனால தான் - இப்போ Fix
  // ============================================================
  const slider = document.getElementById("messageSlider");
  const slides = document.querySelectorAll(".message-slide");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");
  const dots = document.querySelectorAll(".slider-dot");

  // Slider இருந்தா மட்டும் Run ஆகும், இல்லைனா Skip - இதான் Hang Fix
  if (slider && slides.length > 0) {
    let current = 0;
    let autoSlideInterval;

    // எந்த Slide-அ காட்டணும்னு முடிவு பண்ணும் Function
    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      current = index;

      // எல்லா Slide-யும் Hide பண்ணி, Current Slide மட்டும் Show
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === current);
      });

      // Dot-களை Update பண்ணும்
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === current);
      });
    }

    function nextSlide() { showSlide(current + 1); }
    function prevSlide() { showSlide(current - 1); }

    // Button Click Event - முன்னாடி மாதிரி document-ல் எல்லா Button-ம் பிடிக்காம
    // சரியான Button-அ மட்டும் பிடிக்கும் - இதான் Main Fix
    if (nextBtn) {
      nextBtn.addEventListener("click", function() {
        nextSlide();
        resetAuto();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function() {
        prevSlide();
        resetAuto();
      });
    }

    // Dot Click Event
    dots.forEach((dot, i) => {
      dot.addEventListener("click", function() {
        showSlide(i);
        resetAuto();
      });
    });

    // Auto Slide - 5 Second-க்கு ஒரு தடவை
    function startAuto() {
      autoSlideInterval = setInterval(nextSlide, 5000);
    }
    function resetAuto() {
      clearInterval(autoSlideInterval);
      startAuto();
    }

    // Start Slider
    showSlide(0);
    startAuto();
    console.log("✅ Slider Fixed - No Hang");
  }

  // ============================================================
  // BATCH 5 - BACK TO TOP BUTTON - மேலே போகும் Button
  // ============================================================
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

}); // DOMContentLoaded End