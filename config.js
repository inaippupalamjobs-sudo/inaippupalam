// =====================================================
// BATCH 8.1 - மைய கட்டுப்பாட்டு பாலம் (config.js) - FIXED
// =====================================================

/*jshint esversion: 8 */

/* ================================================================
   PATCH 1: GOOGLE SHEETS - SUBMISSION URL
   (Form → Sheet Data Entry)
   
   This URL receives ALL form submissions from THREE places:
   
   ┌────────────────────────────────────────────────────────────┐
   │ FORM TYPE     │ PAGE PATH                    │ TAB NAME    │
   ├────────────────────────────────────────────────────────────┤
   │ Job Seeker    │ job-seeker/job-seeker.html  │ "Seekers"   │
   │ Job Provider  │ job-provider/job-provider.html│ "Employers"│
   │ Daily Wages   │ daily-wages/daily-wages.html│ "MASTER"    │
   └────────────────────────────────────────────────────────────┘
   
   ⚠️ All three use SAME URL - Apps Script routes by "type" field
   
   HOW IT WORKS:
   1. Form submits JSON payload with "type": "seeker"/"employer"/"wages"
   2. Apps Script reads "type" and inserts into correct tab
   3. no-cors mode prevents hang issues
================================================================ */

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbygfMoIa4q88zyc9KX0b0PYUxXnex-MIaZtFEg5Yt9kqoDtOjlpLZDz2rmyRoyI45uDtw/exec";

// ┌─────────────────────────────────────────────────────────────┐
// │ VARIABLE: GOOGLE_SHEET_URL                                  │
// │ CONTROLS: All form submissions (3 forms)                   │
// │ SENDS TO: Google Sheets via Apps Script Web App            │
// │ METHOD: POST request                                       │
// │ DATA FORMAT: JSON payload with "type" field               │
// │                                                             │
// │ ✅ ALREADY WORKING - DO NOT CHANGE THIS URL               │
// │ ℹ️ It handles Seeker, Provider, AND Wages submissions     │
// └─────────────────────────────────────────────────────────────┘

// Backward Compatibility - பழைய File எல்லாம் SHEET_API_URL-னু கூப்பிடும், அதனால ரெண்டு பேரும் ஒரே URL
const SHEET_API_URL = GOOGLE_SHEET_URL;

console.log("Config Loaded - Seekers Version - FIXED");

// Public-க்கு எதனை மறைக்க வேண்டும்
const HIDE_FROM_PUBLIC = ["phone", "address"];

/* ================================================================
   PATCH 2: NEW VARIABLE ADDED FOR DAILY WAGES PUBLIC VIEW
   (Sheet → Public Page Data Fetch)
   
   ⚠️ THIS IS THE ONLY LINE YOU NEED TO ADD!
   
   WHY THIS IS NEEDED:
   - Job Seeker/Provider pages already have their public URLs working
   - Daily Wages page (public/wages/wages.html) needs ITS OWN URL
   - Different tab in Sheet = Different read-only URL
   
   ┌────────────────────────────────────────────────────────────┐
   │ PAGE               │ FETCH FROM TAB       │ VARIABLE NAME  │
   ├────────────────────────────────────────────────────────────┤
   | Seekers Public     │ "Public Seekers"    │ (existing var) │
   │ Providers Public   │ "Public Employers"  │ (existing var) │
   │ Daily Wages Public │ "PUBLIC VIEW"       │ NEW BELOW      │
   └────────────────────────────────────────────────────────────┘
   
   HOW IT WORKS:
   1. wages.js sends GET request to this URL
   2. Apps Script queries "PUBLIC VIEW" tab
   3. Returns ONLY public columns (no phone/address)
   4. Displayed as worker cards on public/wages/wages.html
================================================================ */

// ┌─────────────────────────────────────────────────────────────┐
// │ NEW VARIABLE (ADDED TODAY):                                 │
// │ VARIABLE: GOOGLE_SHEET_PUBLIC_URL                           │
// │ CONTROLS: Daily Wages public page (public/wages/wages.html) │
// │ FETCHES FROM: "PUBLIC VIEW" tab in Google Sheet            │
// │ METHOD: GET request                                        │
// │ RESPONSE: JSON array of worker objects                    │
// │                                                             │
// │ ⚠️ MUST ADD THIS to enable Daily Wages public listing     │
// │ ℹ️ Get this URL from your Apps Script doGet() endpoint   │
// └─────────────────────────────────────────────────────────────┘
const GOOGLE_SHEET_PUBLIC_URL = "YOUR_DAILY_WAGES_PUBLIC_WEB_APP_URL_HERE";


/* ================================================================
   PATCH 3: ADMIN CONFIG - LOCAL STORAGE KEYS
   (Offline Backup Settings)
   
   When Google Sheets are unavailable, data is saved locally
   in browser storage. These keys organize the data.
================================================================ */

// ┌─────────────────────────────────────────────────────────────┐
// │ VARIABLES: ADMIN_CONFIG                                     │
// │ CONTROLS: Local storage organization                      │
// │ KEY USAGE:                                                 │
// │   - inaippu_seekers: Job seeker data backup               │
// │   - inaippu_employers: Provider data backup              │
// │   - inaippu_contact: Contact form backups                │
// │                                                             │
// │ ✅ ALREADY WORKING - DO NOT CHANGE                        │
// └─────────────────────────────────────────────────────────────┘
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

/* ================================================================
   PATCH 4: CONTACT FORM EMAIL
   (Contact → Email Delivery)
   
   Sends contact form messages to admin email.
================================================================ */

// ┌─────────────────────────────────────────────────────────────┐
// │ VARIABLE: CONTACT_RECEIVER_EMAIL                            │
// │ CONTROLS: Where contact form messages go                  │
// │ METHOD: Direct email via Gmail                            │
// │ FALLBACK: Opens mail client if Apps Script fails          │
// │                                                             │
// │ ✅ ALREADY WORKING - DO NOT CHANGE                        │
// └─────────────────────────────────────────────────────────────┘
const CONTACT_RECEIVER_EMAIL = "inaippupalamjob@gmail.com";

/* ================================================================
   PATCH 5: CONTACT FORM HANDLER
   (Submit Button → Email/Sheet)
   
   Handles the contact form submission process:
   1. Captures form data
   2. Sends to Apps Script
   3. Falls back to email if network fails
   4. Shows success/failure message
================================================================ */

// ┌─────────────────────────────────────────────────────────────┐
// │ CODE BLOCK: DOM Event Listener                             │
// │ CONTROLS: #contactForm submission                          │
// │ EVENTS: Submit button click                               │
// │ ACTIONS:                                                   │
// │   - Show loading spinner                                  │
// │   - Send POST to SHEET_API_URL                           │
// │   - Reset form on success                                │
// │   - Open mail client on failure                          │
// │                                                             │
// │ ✅ ALREADY WORKING - DO NOT CHANGE                        │
// └─────────────────────────────────────────────────────────────┘
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
          mode: "no-cors", // CORS Hang-ஐ தடுக்கும்
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

/* ================================================================
   PATCH 6: WHAT YOU NEED TO DO NOW
   (Action Items for Daily Wages Setup)
================================================================ */

// ┌─────────────────────────────────────────────────────────────┐
// │ STEP-BY-STEP GUIDE:                                        │
// │                                                             │
// │ 1. ADD THIS LINE (Line 30 above):                          │
// │    const GOOGLE_SHEET_PUBLIC_URL = "YOUR_WEB_APP_URL";     │
// │                                                             │
// │ 2. CREATE Apps Script Web App for PUBLIC VIEW tab:         │
// │    - New script: https://script.google.com/home/projects/create│
// │    - Code: doGet() that queries "PUBLIC VIEW" tab         │
// │    - Deploy as Web App → Execute as "Me"                 │
// │    - Access: "Anyone" → Copy URL                         │
// │                                                             │
// │ 3. TEST: Open public/wages/wages.html                    │
// │    - Should load worker cards from sheet                │
// │    - Search/filter should work                          │
// │                                                             │
// │ 4. TROUBLESHOOTING:                                      │
// │    - Blank page? → Check console for errors             │
// │    - No workers? → Verify URL in GOOGLE_SHEET_PUBLIC_URL │
// │    - Wrong data? → Check "PUBLIC VIEW" tab has columns  │
// │                                                             │
// │ ✅ Rest of file remains UNCHANGED                       │
// └─────────────────────────────────────────────────────────────┘