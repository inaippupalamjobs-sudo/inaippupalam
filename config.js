// =====================================================
// BATCH 8.1 - மைய கட்டுப்பாட்டு பாலம் (config.js) - FIXED
// =====================================================

/*jshint esversion: 8 */

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbygfMoIa4q88zyc9KX0b0PYUxXnex-MIaZtFEg5Yt9kqoDtOjlpLZDz2rmyRoyI45uDtw/exec";
// Backward Compatibility - பழைய File எல்லாம் SHEET_API_URL-னு கூப்பிடும், அதனால ரெண்டு பேரும் ஒரே URL
const SHEET_API_URL = GOOGLE_SHEET_URL;

console.log("Config Loaded - Seekers Version - FIXED");

// Public-க்கு எதை மறைக்கணும்
const HIDE_FROM_PUBLIC = ["phone", "address"];

// =====================================================
// PATCH 3-க்கு தேவையான ADMIN_CONFIG
// =====================================================
const ADMIN_CONFIG = {
  dataKeys: {
    seekers: "inaippu_seekers",
    employers: "inaippu_employers",
    contact: "inaippu_contact" 
  },
  sheetNames: {
    seekers: "Seekers",
    employers: "Employers",
    contact: "Contact"
  }
};

// =====================================================
// CONTACT FORM - HANG FIX உடன்
// =====================================================
const CONTACT_RECEIVER_EMAIL = "inaippupalamjob@gmail.com";

// DOM Load ஆன பிறகு தான் Form-அ பிடிக்கணும் - இதான் Hang Fix
document.addEventListener("DOMContentLoaded", function() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const btn = contactForm.querySelector(".contact-submit-btn");
      const oldText = btn.innerHTML;
      btn.innerHTML = "<span>அனுப்புகிறது...</span>";
      btn.disabled = true;

      const payload = {
        type: "contactMessage",
        name: document.getElementById("contactName").value.trim(),
        phone: document.getElementById("contactPhone").value.trim(),
        message: document.getElementById("contactMessage").value.trim(),
        toEmail: CONTACT_RECEIVER_EMAIL,
        timestamp: new Date().toISOString()
      };

      try {
        await fetch(SHEET_API_URL, {
          method: "POST",
          mode: "no-cors", // CORS Hang-அ தடுக்க
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        alert("✅ நன்றி! உங்கள் செய்தி அனுப்பப்பட்டது");
        contactForm.reset();
      } catch (err) {
        console.error("Contact Mail Error:", err);
        window.location.href = "mailto:" + CONTACT_RECEIVER_EMAIL + "?subject=Inaippu Palam Contact - " + encodeURIComponent(payload.name) + "&body=" + encodeURIComponent("Phone: " + payload.phone + "\n\nMessage: " + payload.message);
      } finally {
        btn.innerHTML = oldText;
        btn.disabled = false;
      }
    });
  }
});