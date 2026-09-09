// =====================================================
// FILE: public/jobs/jobs.js - FINAL CLEAN - NO DUPLICATE
// HTML: jobs.html உடன் 100% Match - jobsGrid + jobsResultCount
// CSS: jobs.css PATCH 07 - 4 Column Grid-க்கு Match
// =====================================================

// =====================================================
// BATCH 01 - START - SHEET URL + CACHE
// எதுக்கு: Sheet-ல இருந்து Employers (Jobs) Data எடுக்க + Cache-ல வைக்க
// =====================================================
const PUBLIC_JOBS_SHEET_URL = "https://script.google.com/macros/s/AKfycbygfMoIa4q88zyc9KX0b0PYUxXnex-MIaZtFEg5Yt9kqoDtOjlpLZDz2rmyRoyI45uDtw/exec?type=employers";
let allJobsCache = [];
// =====================================================
// BATCH 01 - END
// =====================================================

// =====================================================
// BATCH 02 - START - AVATAR FIX - JOB TYPE BASE AVATAR
// எதுக்கு: Photo Upload பண்ணலனா, என்ன வேலை-னு பார்த்து அதுக்கு தகுந்த படம் காமிக்கும்
// =====================================================
function getPublicPhoto(s){
  let url = s.photo || s.Photo || s.photoLink || s.PhotoLink || "";
  url = String(url).trim();

  // 1. Photo இருந்தா அதையே காட்டும்
  if(url && url!== "" && url.toLowerCase()!== "no photo" && url.includes("http")){
    if(url.includes("/file/d/")){
      try{ let id = url.split("/file/d/")[1].split("/")[0]; return "https://drive.google.com/thumbnail?id="+id+"&sz=w200"; }catch(e){ return url; }
    }
    return url;
  }

  // 2. Photo இல்லனா - என்ன வேலை-னு பார்த்து Avatar காட்டும்
  let job = String(s.jobType || s.JobType || s.wantedJob || "").toLowerCase().trim();

  // இங்க தான் நீங்க Image Path-ஐ மாத்திக்கலாம் - உங்க assets-ல இருக்குற Icon
  if(job.includes("office") || job.includes("computer") || job.includes("data entry")){
    return "../../assets/avatars/office.png"; // Office - Building Icon - நீங்க Office Building Photo வைக்கலாம்
  }
  if(job.includes("shop") || job.includes("sales") || job.includes("store")){
    return "../../assets/avatars/shop.png"; // Shop - சின்ன கடை Icon
  }
  if(job.includes("driver") || job.includes("driving")){
    return "../../assets/avatars/driver.png"; // Driver - Car/Van Icon
  }
  if(job.includes("tailor") || job.includes("cutting")){
    return "../../assets/avatars/tailor.png"; // Tailor - தையல் மிஷின்
  }
  if(job.includes("teacher") || job.includes("tutor")){
    return "../../assets/avatars/teacher.png";
  }
  if(job.includes("cook") || job.includes("kitchen") || job.includes("hotel")){
    return "../../assets/avatars/cook.png";
  }
  if(job.includes("electrician") || job.includes("plumber") || job.includes("technician")){
    return "../../assets/avatars/technician.png";
  }

  // 3. எதுவுமே Match ஆகலனா - Default Avatar (Gender பார்த்து)
  let gender = String(s.gender || "").toLowerCase();
  if(gender.includes("female") || gender.includes("பெண்")){
    return "../../assets/avatars/female.png"; // பெண் Default
  } else {
    return "../../assets/avatars/male.png"; // ஆண் Default
  }
}
// =====================================================
// BATCH 02 - END
// =====================================================

// =====================================================
// BATCH 03 - START - RENDER GRID - FONT BIG + CENTER ALIGN
// எதுக்கு: எழுத்து பெருசாக்கும் + எல்லாம் சென்டர்ல வரும்
// =====================================================
function renderJobsGrid(list) {
  const grid = document.getElementById("jobsGrid");
  const empty = document.getElementById("jobsEmpty");
  const countEl = document.getElementById("jobsResultCount");
  if (!grid) return;
  grid.innerHTML = "";
  if (countEl) countEl.textContent = list.length;
  if (list.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  list.slice().reverse().forEach(s => {
    let logoRaw = s.logoLink || s.LogoLink || s.Logo || s.photo || "";
    let logo = "../../assets/logo/logo.png";
    if(logoRaw && String(logoRaw).trim()!== "" && String(logoRaw).toLowerCase()!== "no logo"){
      logo = String(logoRaw).trim();
      if(logo.includes("/file/d/")){
        try{ let id = logo.split("/file/d/")[1].split("/")[0]; logo = "https://drive.google.com/thumbnail?id=" + id + "&sz=w200"; }catch(e){}
      }
    }
    let salaryText = (s.salaryMin||s.salaryMax)? ((s.salaryMin? "₹"+s.salaryMin:"") + (s.salaryMin&&s.salaryMax?" - ":"") + (s.salaryMax? "₹"+s.salaryMax:"")) : "பேசி முடிவு";

    const card = document.createElement("div");
    card.className = "job-card";
    // சென்டர் அலைன்மென்ட் - இது தான் Main
    card.style.textAlign = "center";

    card.innerHTML =
      '<div style="position:absolute; top:0; left:0; background:#7c3aed; color:white; padding:5px 12px; font-size:11px; font-weight:bold; border-bottom-right-radius:10px;">' + (s.id||"") + '</div>' +
      // Photo Center
      '<div style="display:flex; justify-content:center; margin-top:18px; margin-bottom:8px;">' +
        '<img src="' + logo + '" alt="Logo" style="width:60px; height:60px; border-radius:12px; object-fit:cover; border:1px solid #e5e7eb; background:#fff;" onerror="this.onerror=null; this.src=\'../../assets/logo/logo.png\'">' +
      '</div>' +
      '<div style="margin-bottom:8px;"><span style="padding:4px 10px; border-radius:50px; background:#f3f0ff; color:#7040d6; font-size:11px; font-weight:800;">' + (s.jobCategory||"Job") + '</span></div>' +
      // எழுத்து பெருசு - 14px-ல இருந்து 16px
      '<h3 style="margin:0 0 5px 0; font-size:16px; font-weight:800; color:#25283a; line-height:1.3;">' + (s.jobTitle||"வேலை") + '</h3>' +
      '<p style="margin:0 0 10px 0; font-size:14px; font-weight:600; color:#555;">' + (s.businessName||"") + '</p>' +
      // Details - எழுத்து 11px-ல இருந்து 13px - Center
      '<div style="display:grid; gap:6px; padding:8px 0; border-top:1px solid #f0f0f5; border-bottom:1px solid #f0f0f5; font-size:13px; color:#444; text-align:center; line-height:1.6;">' +
        '<div>📍 <b>' + (s.district||"") + (s.area?" - "+s.area:"") + '</b></div>' +
        '<div>👥 ' + (s.vacancies||"1") + ' பேர் | 💰 <b style="color:#15803d; font-size:14px;">' + salaryText + '</b></div>' +
        '<div>⭐ அனுபவம்: <b>' + (s.experience||"Fresher") + '</b></div>' +
        (s.education? '<div>🎓 <b>' + s.education + '</b></div>' : '') +
      '</div>';

    grid.appendChild(card);
  });
}
// =====================================================
// BATCH 03 - END
// =====================================================

// =====================================================
// BATCH 04 - START - LOAD JOBS - ACTIVE மட்டும் - SINGLE FUNCTION
// எதுக்கு: Sheet-ல இருந்து Active Jobs மட்டும் Load பண்ணும் - Duplicate நீக்கியாச்சு
// =====================================================
async function loadPublicJobs() {
  const grid = document.getElementById("jobsGrid");
  const empty = document.getElementById("jobsEmpty");

  if (!grid) {
    console.log("jobsGrid ID இல்லை");
    return;
  }

  grid.innerHTML = "<p style='text-align:center; padding:30px; color:#666;'>வேலைவாய்ப்புகள் ஏற்றுகிறது...</p>";
  if (empty) empty.hidden = true;

  try {
    const res = await fetch(PUBLIC_JOBS_SHEET_URL);
    const all = await res.json();
    allJobsCache = all.filter(x => String(x.status || "").toLowerCase().trim() === "active");
    console.log("BATCH 04: Total", all.length, "Active", allJobsCache.length);
    renderJobsGrid(allJobsCache);
  } catch (e) {
    console.error("Public Jobs Error", e);
    grid.innerHTML = "<p style='text-align:center; color:red; padding:20px;'>Error - " + e.toString() + "</p>";
  }
}
// =====================================================
// BATCH 04 - END
// =====================================================

// =====================================================
// BATCH 05 - START - SEARCH + SORT + CLEAR
// எதுக்கு: தேடல் + வரிசைப்படுத்து - HTML ID-களுடன் 100% Match
// =====================================================
function setupJobsSearch() {
  const searchInput = document.getElementById("jobSearch");
  const locInput = document.getElementById("locationSearch");
  const typeFilter = document.getElementById("jobTypeFilter");
  const searchBtn = document.getElementById("jobsSearchButton");
  const sortSelect = document.getElementById("jobsSort");
  const clearBtn = document.getElementById("jobsClearButton");

  function doSearch() {
    let filtered = allJobsCache.slice();
    const q = (searchInput?.value || "").toLowerCase().trim();
    const loc = (locInput?.value || "").toLowerCase().trim();
    const type = (typeFilter?.value || "all").toLowerCase();

    if (q) {
      filtered = filtered.filter(j =>
        String(j.jobTitle || "").toLowerCase().includes(q) ||
        String(j.businessName || "").toLowerCase().includes(q) ||
        String(j.jobCategory || "").toLowerCase().includes(q)
      );
    }
    if (loc) {
      filtered = filtered.filter(j => String(j.district || "").toLowerCase().includes(loc) || String(j.area || "").toLowerCase().includes(loc));
    }
    if (type!== "all") {
      filtered = filtered.filter(j => String(j.jobCategory || j.jobType || "").toLowerCase().includes(type));
    }
    // Sort
    const sortVal = sortSelect?.value || "latest";
    if (sortVal === "salary-high") {
      filtered.sort((a,b) => (parseInt(b.salaryMax)||0) - (parseInt(a.salaryMax)||0));
    } else if (sortVal === "salary-low") {
      filtered.sort((a,b) => (parseInt(a.salaryMax)||0) - (parseInt(b.salaryMax)||0));
    }
    renderJobsGrid(filtered);
  }

  searchBtn?.addEventListener("click", doSearch);
  searchInput?.addEventListener("keyup", (e) => { if(e.key==="Enter") doSearch(); });
  locInput?.addEventListener("keyup", (e) => { if(e.key==="Enter") doSearch(); });
  typeFilter?.addEventListener("change", doSearch);
  sortSelect?.addEventListener("change", doSearch);
  clearBtn?.addEventListener("click", () => {
    if(searchInput) searchInput.value = "";
    if(locInput) locInput.value = "";
    if(typeFilter) typeFilter.value = "all";
    if(sortSelect) sortSelect.value = "latest";
    renderJobsGrid(allJobsCache);
  });
}
// =====================================================
// BATCH 05 - END
// =====================================================

// =====================================================
// BATCH 06 - START - PAGE START + MENU TOGGLE
// எதுக்கு: Page Load ஆனதும் Jobs Load ஆகும் + Mobile Menu
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  loadPublicJobs();
  setupJobsSearch();

  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navLinks");
  toggle?.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });
});
// =====================================================
// BATCH 06 - END
// =====================================================