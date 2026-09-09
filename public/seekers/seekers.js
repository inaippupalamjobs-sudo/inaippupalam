// =====================================================
// FILE பேரு: public/seekers/seekers.js - FINAL PUBLIC
// இடம்: public/seekers / seekers.js
// வேலை: Public-ல் Approved Seekers மட்டும் - Photo / Avatar
// =====================================================

// =====================================================
// BATCH 01 - START - SHEET URL
// விளக்கம்: Admin-ல் இருக்கிற அதே URL தான் Public-க்கும்
// =====================================================
const PUBLIC_SHEET_URL = "https://script.google.com/macros/s/AKfycbygfMoIa4q88zyc9KX0b0PYUxXnex-MIaZtFEg5Yt9kqoDtOjlpLZDz2rmyRoyI45uDtw/exec?type=seekers";

const AVATAR_PATHS = {
  male: "../../assets/avatars/avatar-male.svg",
  female: "../../assets/avatars/avatar-female.svg",
  other: "../../assets/avatars/avatar-other.svg"
};
// =====================================================
// BATCH 01 - END
// =====================================================

// =====================================================
// BATCH 02 - START - AVATAR LOGIC - MAIN BATCH
// விளக்கம்:
// Allow = Yes + Link இருந்தா -> உண்மையான Photo
// Allow = No -> Gender பார்த்து Avatar
// =====================================================
function getPublicPhoto(s) {
  let allow = String(s.photoAllow || "").toLowerCase();
  let link = s.photoLink || "";

  // BATCH 02-A: Yes-னா உண்மையான Photo
  if (allow === "yes" && link.indexOf("http") !== -1) {
    return link;
  }

  // BATCH 02-B: No-னா Avatar
  let gender = String(s.gender || "").toLowerCase();
  if (gender.indexOf("female") !== -1 || gender === "பெண்") {
    return AVATAR_PATHS.female;
  } else if (gender.indexOf("other") !== -1) {
    return AVATAR_PATHS.other;
  } else {
    return AVATAR_PATHS.male;
  }
}
// =====================================================
// BATCH 02 - END
// =====================================================

// =====================================================
// BATCH 03 - START - PUBLIC LOAD + DISPLAY - FINAL LOCK - 10K ID + FULL DETAILS
// விளக்கம்: ID மேல மட்டும் + பேரு, வயசு, பாலினம், கல்வி, Course, மாவட்டம், அனுபவம் எல்லாம்
// =====================================================
async function loadPublicSeekers() {
  const grid = document.getElementById("seekersGrid");
  if (!grid) return;

  grid.innerHTML = "<p style='text-align:center;'>Loading...</p>";

  try {
    const res = await fetch(PUBLIC_SHEET_URL);
    const all = await res.json();

    const list = all.filter(x => String(x.status).toLowerCase() === "active");
    grid.innerHTML = "";

    if (list.length === 0) {
      grid.innerHTML = "<p style='text-align:center;'>No Approved Seekers</p>";
      return;
    }

    list.reverse().forEach(s => {
      let photo = getPublicPhoto(s);
      let card = document.createElement("div");
      card.style.cssText = "border:1px solid #ddd; border-radius:12px; padding:15px; text-align:center; background:#fff; position:relative; overflow:hidden;";

      // ID மேல மட்டும் - கீழே வேண்டாம் - நீங்க சொன்ன Final
      card.innerHTML = 
        '<div style="position:absolute; top:0; left:0; background:#28a745; color:white; padding:5px 12px; font-size:11px; font-weight:bold; border-bottom-right-radius:12px;">' + (s.id || "") + '</div>' +
        '<img src="' + photo + '" style="width:85px; height:85px; border-radius:50%; object-fit:cover; border:2px solid #28a745; margin-top:15px;">' +
        '<h3 style="margin:10px 0 5px 0; font-size:16px;">' + (s.name || "") + '</h3>' +
        // நீங்க கேட்ட Full Details
        '<div style="font-size:13px; line-height:1.7; color:#333; text-align:left; margin-top:10px; background:#fafafa; padding:8px; border-radius:8px;">' +
          '<div>🎂 வயது: <b>' + (s.age || "-") + '</b> | 👤 ' + (s.gender || "") + '</div>' +
          '<div>🎓 கல்வி: <b>' + (s.education || "-") + '</b></div>' +
          (s.course ? '<div>📚 Course: <b>' + s.course + '</b></div>' : '') +
          '<div>📍 மாவட்டம்: <b>' + (s.district || "") + '</b></div>' +
          '<div>💼 விரும்பும் வேலை: <b>' + (s.jobType ? s.jobType.charAt(0).toUpperCase() + s.jobType.slice(1) : "-") + '</b></div>' +
          '<div>⭐ அனுபவம்: <b>' + (s.experience || s.Experience || "Fresher") + '</b></div>' +
        '</div>';

      grid.appendChild(card);
    });

  } catch (e) {
    grid.innerHTML = "<p>Error</p>";
  }
}
// =====================================================
// BATCH 03 - END
// =====================================================

// =====================================================
// BATCH 04 - START - PAGE START
// =====================================================
document.addEventListener("DOMContentLoaded", loadPublicSeekers);
// =====================================================
// BATCH 04 - END
// =====================================================

/* ===== PUBLIC PAGES MOBILE MENU FIX ===== */
document.addEventListener("DOMContentLoaded", function() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    navLinks.classList.toggle("open", isOpen);
    navLinks.classList.toggle("active", isOpen);
    navLinks.classList.toggle("show", isOpen);
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open", "open", "active", "show");
      menuToggle.classList.remove("is-open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("is-open", "open", "active", "show");
      menuToggle.classList.remove("is-open");
    }
  });
});