// =====================================================
// FILE: public/jobs/jobs.js - FINAL V8 - BASED ON YOUR V4 FILE - CLEAN NAMES + 3 CORRECTIONS + LOCATION FULL FIX
// DATE: 2026-09-24 - Your V4 File Base - No Work Deleted - Only Correction - Full Explanation
// SHEET HEADER V8: id,timestamp,name,businessName,phone,email,district,taluk,addressLine,pincode,jobCategory,jobTitle,experience,vacancies,gender,ageRange,education,workingHours,vehicle,joiningDate,salary,workLocation,requiredSkills,photoUrl,status - 25 Columns - V8
// OLD HEADER (Your V4): district, area, salaryMin, salaryMax - Old - 27 Columns - Old
// FIX 1: Location Header "இடம் சார்ந்த தகவல்" Only - District+Taluk+AddressLine+WorkLocation - Public Card-ல் "வேலை செய்யும் இடம்" Full Detail-ஆ காட்டும் - Theni, Bodinayakkanur - தேனி பஸ் ஸ்டாண்ட் அருகில்
// FIX 2: Label "வேலைக்கு எப்போது ஆள் தேவை" - Vehicle Confuse Fix - V8 - joiningDate Label Fixed - Public Card-ல் வேலைக்கு எப்போது ஆள் தேவை
// FIX 3: salaryMin+Max -> salary Single + workLocation Detail - Salary Card Fix - V8 - Public Card-ல் "சம்பளம்: ₹15000" Single + "வேலை செய்யும் இடம்" Detail - Salary Card-ல் 2 Fields
// VERSION: PATCH 00 to 16 - Batch-wise Tamil Explanation - Clean Sheet - V8
// SHEET: Employers Sheet Only - No JobSeekers - Your File Same
// POWER: 13 Avatar + Location Full Fix + Single Salary + WorkLocation + Pagination + Search + Sort - Full Power - No Delete
// =====================================================

// =====================================================
// BATCH 00 : CONFIG - API URL + GLOBAL VARIABLES - Your File Same - No Delete - V8 URL Same
// வேலை: Public Jobs Page-க்கு தேவையான API URL, Cache Variables, Pagination Settings - Your File Same
// PUBLIC_JOBS_SHEET_URL: Google Apps Script Web App URL - Employers Data மட்டும் - ?type=employers - Your File Same
// allJobsCache: API-ல் இருந்து வந்த எல்லா Active Jobs-ஐ Store பண்ணும் - Main Cache - Your File Same
// filteredJobsCache: Search/Filter பண்ணின பிறகு வந்த Filtered Jobs - இதை தான் Grid-ல் காட்டும் - Your File Same
// currentPage: இப்ப எந்த Page-ல் இருக்கோம் - Pagination-க்கு - Your File Same
// JOBS_PER_PAGE: ஒரு Page-ல் எத்தனை Jobs காட்டணும் - 12 Jobs Per Page - Your File Same
// =====================================================
const PUBLIC_JOBS_SHEET_URL = "https://script.google.com/macros/s/AKfycbygfMoIa4q88zyc9KX0b0PYUxXnex-MIaZtFEg5Yt9kqoDtOjlpLZDz2rmyRoyI45uDtw/exec?type=employers";

let allJobsCache = []; // All Active Jobs - Original Data - Your File Same
let filteredJobsCache = []; // Filtered Jobs - Search Result - Your File Same
let currentPage = 1;
const JOBS_PER_PAGE = 12;

// =====================================================
// BATCH 01 : HELPER - getJobValue - Safe Field Get - Your File Same - No Delete - V8 Clean Names Support Added
// வேலை: Job Object-ல் இருந்து Field Value-வை Safe-ஆ எடுக்கும் - Error வராமல் - Your File Same
// ஏன்: Sheet-ல் Column Name மாறி மாறி இருக்கலாம் - jobTitle, JobTitle, wantedJob - எந்த பேர்ல இருந்தாலும் எடுக்கும் - Your File Same
// fieldNames: ["jobTitle", "JobTitle", "wantedJob"] - இதுல எது இருந்தாலும் முதல் Value-வை எடுக்கும் - Your File Same
// fallback: Value இல்லைனா என்ன காட்டணும் - Default Value - Your File Same
// V8 Fix: Clean Names Support - name, phone, email, vehicle, taluk, workLocation, salary Single - New Fields Support - Backward Compatibility Kept
// =====================================================
function getJobValue(job, fieldNames, fallback = "") {
    for (const fieldName of fieldNames) {
        const value = job?.[fieldName];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return String(value).trim();
        }
    }
    return fallback;
}

// =====================================================
// BATCH 02 : HELPER - escapeHTML - Security - Your File Same - No Delete
// வேலை: HTML Tag Injection-ஐ தடுக்கும் - Security-க்கு - XSS Attack தடுக்கும் - Your File Same
// உதாரணம்: <script>alert() -னு யாராவது Sheet-ல் போட்டா அதை Text-ஆ காட்டும், Code-ஆ Run பண்ணாது - Your File Same
// =====================================================
function escapeHTML(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// =====================================================
// BATCH 03 : AVATAR SYSTEM - 13 JOB TYPE AVATARS - PATCH-6 - FULL EXPLANATION - Your File Same - No Delete
// வேலை: Employer Logo இல்லைனா Job Type-க்கு ஏத்த மாதிரி Avatar Icon காட்டும் - 13 Types - Your File Same
// Avatar List: shop, driver, tailor, billing, security, delivery, housekeeping, technician, beauty, construction, cook, teacher, other, default - Your File Same
// Path: ../../assets/avatars/jobs/ - இந்த Folder-ல் 13 PNG Files இருக்கணும் - Your File Same
// default: Logo-க்கு பதிலா Other Icon தான் Default - No Logo வந்தா Other Icon காட்டும் - Your File Same
// =====================================================
const JOB_TYPE_AVATARS = {
    shop: "../../assets/avatars/jobs/shop.png",
    driver: "../../assets/avatars/jobs/driver.png",
    tailor: "../../assets/avatars/jobs/tailor.png",
    billing: "../../assets/avatars/jobs/billing.png",
    security: "../../assets/avatars/jobs/security.png",
    delivery: "../../assets/avatars/jobs/delivery.png",
    housekeeping: "../../assets/avatars/jobs/housekeeping.png",
    technician: "../../assets/avatars/jobs/technician.png",
    beauty: "../../assets/avatars/jobs/beauty.png",
    construction: "../../assets/avatars/jobs/construction.png",
    cook: "../../assets/avatars/jobs/cook.png",
    teacher: "../../assets/avatars/jobs/teacher.png",
    other: "../../assets/avatars/jobs/other.png",
    default: "../../assets/avatars/jobs/other.png" // Logo-க்கு பதிலா Other Icon தான் Default - Your File Same
};

// =====================================================
// BATCH 04 : getJobTypeAvatar - Job Category + Title-வை வச்சு Avatar Select பண்ணும் - Your File Same - No Delete
// வேலை: Job Category, Job Title Text-ஐ பார்த்து எந்த Avatar காட்டணும்னு முடிவு பண்ணும் - Your File Same
// Logic: Text-ல் "கடை" இருந்தா shop Avatar, "டிரைவர்" இருந்தா driver Avatar - Your File Same
// Tamil + English ரெண்டும் Support பண்ணும் - "கடை" or "shop" or "sales" - எது இருந்தாலும் shop Avatar - Your File Same
// 13 Types: கடை/விற்பனை, டிரைவர், தையல், அலுவலகம், பாதுகாவலர், ஹோட்டல்/சமையல், தொழிற்சாலை/கட்டுமானம், கல்வி, டெலிவரி, வீட்டு வேலை, டெக்னீஷியன், அழகுக்கலை, மற்றவை - Your File Same
// =====================================================
function getJobTypeAvatar(jobCategory, jobTitle) {
    let text = (String(jobCategory || "") + " " + String(jobTitle || "")).toLowerCase();
    
    // BATCH 04-A: கடை, விற்பனை - shop - Your File Same
    if (text.includes("கடை") || text.includes("shop") || text.includes("store") || text.includes("விற்பனை") || text.includes("sales")) return JOB_TYPE_AVATARS.shop;
    // BATCH 04-B: டிரைவர் - driver - Your File Same
    if (text.includes("டிரைவர்") || text.includes("driver") || text.includes("driving") || text.includes("வாகன") || text.includes("auto")) return JOB_TYPE_AVATARS.driver;
    // BATCH 04-C: தையல் - tailor - Your File Same
    if (text.includes("தையல்") || text.includes("டெய்லர்") || text.includes("tailor") || text.includes("stitching")) return JOB_TYPE_AVATARS.tailor;
    // BATCH 04-D: அலுவலகம் - billing - Your File Same
    if (text.includes("அலுவலக") || text.includes("billing") || text.includes("computer") || text.includes("கம்ப்யூட்டர்") || text.includes("account")) return JOB_TYPE_AVATARS.billing;
    // BATCH 04-E: பாதுகாவலர் - security - Your File Same
    if (text.includes("பாதுகாவலர்") || text.includes("security") || text.includes("செக்யூரிட்டி") || text.includes("காவலர்")) return JOB_TYPE_AVATARS.security;
    // BATCH 04-F: ஹோட்டல் + சமையல் - cook - Your File Same
    if (text.includes("ஹோட்டல்") || text.includes("hotel") || text.includes("சமையல்") || text.includes("cook") || text.includes("chef") || text.includes("சமையல்காரர்")) return JOB_TYPE_AVATARS.cook;
    // BATCH 04-G: தொழிற்சாலை + கட்டுமானம் - construction - Your File Same
    if (text.includes("தொழிற்சாலை") || text.includes("factory") || text.includes("கட்டுமானம்") || text.includes("construction") || text.includes("வெல்டிங்") || text.includes("welding")) return JOB_TYPE_AVATARS.construction;
    // BATCH 04-H: கல்வி - teacher - Your File Same
    if (text.includes("கல்வி") || text.includes("teacher") || text.includes("ஆசிரியர்") || text.includes("டியூஷன்") || text.includes("tuition") || text.includes("education")) return JOB_TYPE_AVATARS.teacher;
    // BATCH 04-I: டெலிவரி - delivery - Your File Same
    if (text.includes("டெலிவரி") || text.includes("delivery") || text.includes("கூரியர்") || text.includes("courier") || text.includes("swiggy") || text.includes("zomato")) return JOB_TYPE_AVATARS.delivery;
    // BATCH 04-J: வீட்டு வேலை - housekeeping - Your File Same
    if (text.includes("வீட்டு") || text.includes("housekeeping") || text.includes("வீட்டு வேலை") || text.includes("பராமரிப்பு")) return JOB_TYPE_AVATARS.housekeeping;
    // BATCH 04-K: டெக்னீஷியன் - technician - Your File Same
    if (text.includes("டெக்னீஷியன்") || text.includes("டெக்னிசியன்") || text.includes("எலக்ட்ரீஷியன்") || text.includes("technician") || text.includes("electrician") || text.includes("plumber")) return JOB_TYPE_AVATARS.technician;
    // BATCH 04-L: அழகுக்கலை - beauty - Your File Same
    if (text.includes("அழகுக்கலை") || text.includes("beauty") || text.includes("பார்லர்") || text.includes("parlour") || text.includes("saloon") || text.includes("அழகு")) return JOB_TYPE_AVATARS.beauty;
    // BATCH 04-M: மற்றவை - other - Your File Same
    if (text.includes("மற்றவை") || text.includes("other") || text.includes("மற்ற")) return JOB_TYPE_AVATARS.other;
    
    return JOB_TYPE_AVATARS.default; // Default - Other Icon - Your File Same
}

// =====================================================
// BATCH 05 : convertDriveImageUrl - Google Drive Link-ஐ Direct Image Link-ஆ மாத்தும் - Your File Same - No Delete
// வேலை: Drive-ல் Upload ஆன Photo Link "https://drive.google.com/file/d/ID/view" - இதை Direct Image Link "https://lh3.googleusercontent.com/d/ID" -னு மாத்தும் - Your File Same
// ஏன்: Drive Link நேரடியா <img> Tag-ல் வேலை செய்யாது, Direct Link தான் வேலை செய்யும் - Your File Same
// "No Photo", "No Logo" -னு இருந்தா Empty Return பண்ணும் - Avatar காட்டும் - Your File Same
// =====================================================

function convertDriveImageUrl(url) {
    let imageUrl = String(url || "").trim();
    if (!imageUrl) return "";
    if (imageUrl.length > 200) return ""; // Skills Text நீளமா இருந்தா Block - FIX
    if (imageUrl.toLowerCase() === "no photo" || imageUrl.toLowerCase() === "no logo" || imageUrl.toLowerCase().includes("no photo") || imageUrl.toLowerCase().includes("no logo") || imageUrl.toLowerCase().includes("upload failed")) return "";

    // FIX: Skills Text Check - Space + Text இருந்தா Image இல்லை - Avatar தான்
    // "Driving licence", "Basic Computer", "தமிழ்" - இதெல்லாம் Image இல்லை
    if (imageUrl.includes("licence") || imageUrl.includes("knowledge") || imageUrl.includes("must") || imageUrl.includes("Speech") || imageUrl.includes("தமிழ்") || imageUrl.includes("படிக்க")) {
        return ""; // Skills Text - Avatar காட்டும் - 404 Fix
    }

    // Real URL Check - http இல்லைனா Image இல்லை
    if (!imageUrl.startsWith("http") &&!imageUrl.startsWith("https://") &&!imageUrl.startsWith("data:image")) {
        // If not URL, check if it has spaces - Skills always has spaces
        if (imageUrl.includes(" ")) return "";
    }

    let fileId = "";
    if (imageUrl.includes("/file/d/")) { try { fileId = imageUrl.split("/file/d/")[1].split("/")[0]; } catch(e) {} }
    else if (imageUrl.includes("id=")) { try { fileId = imageUrl.split("id=")[1].split("&")[0]; } catch(e) {} }
    else if (imageUrl.includes("lh3.googleusercontent.com/d/")) { return imageUrl; }
    else if (imageUrl.startsWith("https://") && (imageUrl.includes(".png") || imageUrl.includes(".jpg") || imageUrl.includes(".jpeg") || imageUrl.includes(".webp"))) {
        return imageUrl; // Direct Image Link
    }

    if (fileId) return "https://lh3.googleusercontent.com/d/" + fileId;

    // If fileId not found and not a direct image link, return empty - Show Avatar - Don't return raw text
    if (imageUrl.startsWith("http")) return imageUrl;
    return ""; // FIX: Skills Text-க்கு Empty Return - Avatar காட்டும் - 404 Fix
}
// BATCH 05 END - FIXED

// =====================================================
// BATCH 06 : getPublicLogo - Logo இருக்கா? இல்ல Avatar-வா? - Decide பண்ணும் - Your File Same - No Delete - V8 Clean Names Support
// வேலை: Employer Logo இருந்தா அதை காட்டும், இல்லைனா Job Type-க்கு ஏத்த Avatar காட்டும் - Your File Same
// Priority: 1. Real Logo (Drive Link) 2. Job Type Avatar 3. Default Other Icon - Your File Same
// V8 Fix: photoUrl + logoLink + logo - Clean Names Support - photoUrl[23] = logoLink[25] - Backward Compatibility Kept
// =====================================================

function getPublicLogo(job) {
    const rawLogo = getJobValue(job, ["photoUrl","PhotoUrl","logoLink","LogoLink","Logo","photo","Photo","photoLink","PhotoLink"], ""); // V8 - photoUrl Added - Clean
    const convertedLogo = convertDriveImageUrl(rawLogo);
    if (convertedLogo) {
        return convertedLogo; // Real Logo இருந்தா அதை தான் காட்டும் - Your File Same
    }
    // Logo இல்லைனா Job Type Avatar - Your File Same
    const jobCategory = getJobValue(job, ["jobCategory", "JobCategory", "jobType", "JobType"], "");
    const jobTitle = getJobValue(job, ["jobTitle", "JobTitle", "wantedJob", "WantedJob"], "");
    return getJobTypeAvatar(jobCategory, jobTitle);
}

// =====================================================
// BATCH 07 : getSalaryText - Salary Text Format பண்ணும் - V8 FIX - Single Salary + WorkLocation Support - No Delete - Only Logic Changed
// OLD (Your V4): salaryMin + salaryMax - 2 Fields - "₹12000 - ₹30000" - Old
// V8 (New): salary Single - "₹15000" or "₹12000-25000" or "பேசி முடிவு" - Single - FIX 3 - Salary Card Fix - V8
// வேலை: Salary Single-ஐ "₹15000" Format-ல் காட்டும் - V8 - Backward Compatibility: salaryMin+Max இருந்தாலும் Support பண்ணும் - Delete இல்லை
// Min மட்டும் இருந்தா "₹12000 முதல்", Max மட்டும் இருந்தா "₹30000 வரை", ரெண்டும் இல்லைனா "பேசி முடிவு" - Your File Logic Same + V8 Single Support
// =====================================================

function getSalaryText(job) {
    // V8 - Single Salary - FIX 3 - "சம்பள விவரம்" Single - Ex: 15000, 12000-25000, பேசி முடிவு - Single
    const salarySingle = getJobValue(job, ["salary", "Salary"], ""); // V8 - salary Single - U - 20 - FIX 3
    const salaryMin = getJobValue(job, ["salaryMin", "SalaryMin"], ""); // Old - Backward Compatibility - Your File Same - Delete இல்லை
    const salaryMax = getJobValue(job, ["salaryMax", "SalaryMax"], ""); // Old - Backward Compatibility
    
    // V8 Priority: Single Salary First - If Single Exists, Use Single
    if (salarySingle) {
        // If Single is already like "12000-25000" or "15000" or "பேசி முடிவு"
        const s = String(salarySingle).trim();
        if (s.toLowerCase().includes("பேசி") || s.toLowerCase().includes("முடிவு")) return escapeHTML(s); // "பேசி முடிவு" Direct
        if (s.includes("-")) {
            // Range like "12000-25000" -> "₹12000 - ₹25000"
            const parts = s.split("-");
            if (parts.length === 2) return "₹" + escapeHTML(parts[0].trim()) + " - ₹" + escapeHTML(parts[1].trim());
        }
        // Single like "15000" -> "₹15000"
        if (!isNaN(s) || /^\d+$/.test(s)) return "₹" + escapeHTML(s);
        return escapeHTML(s); // Text like "15000 per month"
    }
    
    // Old Logic - Backward Compatibility - Your File Same - Min+Max Support - Delete இல்லை
    if (!salaryMin && !salaryMax) return "பேசி முடிவு";
    if (salaryMin && salaryMax) return "₹" + escapeHTML(salaryMin) + " - ₹" + escapeHTML(salaryMax);
    if (salaryMin) return "₹" + escapeHTML(salaryMin) + " முதல்";
    return "₹" + escapeHTML(salaryMax) + " வரை";
}

// =====================================================
// BATCH 08 : createJobCard - ஒரு Job-க்கு Card Create பண்ணும் - MAIN CARD - V8 FIX - LOCATION FULL FIX + SINGLE SALARY + WORKLOCATION - MAIN FIX
// OLD (Your V4): district + area (Taluk) - 2 Fields - Location Display - Your File Same
// V8 (New): district + taluk + addressLine + workLocation + pincode - 5 Fields - Location Full Detail - FIX 1 + FIX 3 - "வேலை செய்யும் இடம்" Full Detail
// வேலை: ஒரு Employer Job-க்கு HTML Card Create பண்ணும் - Public-ல் காட்டும் Card - Your File Same + V8 Fix
// Card-ல்: Logo/Avatar + Job ID + Job Category + Job Title + Location Full + Vacancy + Salary Single + WorkLocation + Experience + Gender + Age + Education + Work Time + Vehicle + JoiningDate
// LOCATION FIX - MAIN FIX V8: இதுல தான் "இடம்: தகவல் இல்லை" பிரச்சனை Fix பண்ணியிருக்கேன் - Your File Same + V8 Full Fix
// V8 Fix: district[6] + taluk[7] + addressLine[8] + pincode[9] + workLocation[21] - 5 Fields - Full Detail - Theni, Bodinayakkanur - தேனி பஸ் ஸ்டாண்ட் அருகில் - Public-ல் Full Detail-ஆ வரும்
// =====================================================

function createJobCard(job) {
    const logo = getPublicLogo(job);
    const jobId = getJobValue(job, ["id", "ID", "jobId", "JobID"], "");
    const jobTitle = getJobValue(job, ["jobTitle", "JobTitle", "wantedJob", "WantedJob"], "வேலை");
    const jobCategory = getJobValue(job, ["jobCategory", "JobCategory", "jobType", "JobType"], "வேலை வகை");
    
    // =====================================================
    // LOCATION FIX - BATCH 08-A : District + Taluk + AddressLine + WorkLocation Fix - MAIN FIX V8 - Full Detail
    // OLD (Your V4): district + area (Taluk) - 2 Fields - District + Taluk - Example: Theni, Bodinayakkanur
    // V8 (New): district[6] + taluk[7] + addressLine[8] + pincode[9] + workLocation[21] - 5 Fields - Full Detail - FIX 1 + FIX 3
    // வேலை: "இடம்" -ல் District + Taluk + AddressLine + WorkLocation Full Detail காட்டும் - இதுதான் நீங்க கேட்ட Fix V8 - Full Detail
    // district: V8 - Employers Sheet-ல் Column 6 - G - District Name - Ex: Theni - Required
    // taluk: V8 - Column 7 - H - Taluk Name - Ex: Bodinayakkanur - Required - Your File-ல் area[20] இருந்தது, V8-ல் taluk[7]
    // addressLine: V8 - Column 8 - I - ஊர் / தெரு - Ex: ஆனமலை, மேன் தெரு - Optional - V8 New - Detailed Location
    // pincode: V8 - Column 9 - J - 6 Digits - Ex: 625531 - Optional - V8 New
    // workLocation: V8 - Column 21 - V - "வேலை செய்யும் இடம்" Detail - Ex: தேனி பஸ் ஸ்டாண்ட் அருகில் - FIX 3 - V8 New - Salary Card-ல் 2 Fields
    // Logic V8: District + Taluk + WorkLocation Full Detail - "Theni, Bodinayakkanur - தேனி பஸ் ஸ்டாண்ட் அருகில்" -னு Full Detail-ஆ காட்டும்
    // =====================================================

    const district = getJobValue(job, ["district", "District", "location", "Location", "districtName"], ""); // G - district - V8 - 6
    const taluk = getJobValue(job, ["taluk", "Taluk", "area", "Area", "place", "Place"], ""); // H - taluk - V8 - 7 - Your File-ல் area[20] இருந்தது, V8-ல் taluk[7] - FIX 1
    const addressLine = getJobValue(job, ["addressLine", "AddressLine", "address", "Address"], ""); // I - addressLine - V8 - 8 - Detailed Location
    const pincode = getJobValue(job, ["pincode", "Pincode"], ""); // J - pincode - V8 - 9
    const workLocation = getJobValue(job, ["workLocation", "WorkLocation"], ""); // V - workLocation - V8 - 21 - FIX 3 - "வேலை செய்யும் இடம்" Detail
    
    let locationDisplay = "";
    let locationFullDetail = ""; // Full Detail for Tooltip or Extra Line
    
    // V8 Full Detail Logic - District + Taluk + WorkLocation - Full Detail
    if (district && taluk) {
        locationDisplay = district + ", " + taluk; // District + Taluk - Example: Theni, Bodinayakkanur - V8
    } else if (district) {
        locationDisplay = district; // District Only - V8
    } else if (taluk) {
        locationDisplay = taluk; // Taluk Only - V8
    } else {
        locationDisplay = "தகவல் இல்லை"; // Both Empty - Your File Same
    }
    
    // V8 - WorkLocation Detail - Extra Line - "வேலை செய்யும் இடம்" Detail - FIX 3 - V8 New
    if (workLocation) {
        locationFullDetail = workLocation; // V - "தேனி பஸ் ஸ்டாண்ட் அருகில்" - FIX 3
    } else if (addressLine) {
        locationFullDetail = addressLine; // I - "ஆனமலை, மேன் தெரு" - V8
    }
    
    // V8 - Business Name - Clean - businessName[3] - D
    const businessName = getJobValue(job, ["businessName", "BusinessName", "providerName", "ProviderName", "name", "Name"], "");
    const vacancies = getJobValue(job, ["vacancies", "Vacancies", "requiredPeople", "RequiredPeople"], "1");
    const experience = getJobValue(job, ["experience", "Experience"], "தகவல் இல்லை");
    const gender = getJobValue(job, ["gender", "Gender"], "தகவல் இல்லை");
    const ageRange = getJobValue(job, ["ageRange", "AgeRange", "age", "Age"], "தகவல் இல்லை");
    const education = getJobValue(job, ["education", "Education", "qualification", "Qualification"], "தகவல் இல்லை");
    const workingHours = getJobValue(job, ["workingHours","WorkingHours","workTime","WorkTime","customWorkingHours"], "தகவல் இல்லை");
    const vehicleRequired = getJobValue(job, ["vehicle","Vehicle","vehicleRequired","VehicleRequired"], "தகவல் இல்லை"); // S - vehicle - Clean - V8
    const joiningDate = getJobValue(job, ["joiningDate","JoiningDate","specificDate"], "தகவல் இல்லை"); // T - joiningDate - FIX 2 - "வேலைக்கு எப்போது ஆள் தேவை" - V8
    const salaryText = getSalaryText(job); // U - salary Single - FIX 3 - V8 - Single Salary
    const requiredSkills = getJobValue(job, ["requiredSkills","RequiredSkills","adminNotes"], "");

    const isSample = String(jobId).toUpperCase().startsWith("DEMO");
    const sampleBadge = isSample ? '<div style="position:absolute;top:35px;left:0;background:#f59e0b;color:white;padding:4px 10px;font-size:10px;font-weight:bold;border-bottom-right-radius:8px;">🔶 மாதிரி</div>' : '';

    const card = document.createElement("div");
    card.className = "job-card";
    card.style.textAlign = "center";
    card.style.position = "relative";
    // V8 Card - Location Full + Salary Single + WorkLocation + Business Name - Full Detail - No Miss - Your File Same + V8 Fix
    card.innerHTML =
        '<div style="position:absolute;top:0;left:0;background:#7c3aed;color:white;padding:5px 12px;font-size:11px;font-weight:bold;border-bottom-right-radius:10px;">' + escapeHTML(jobId) + '</div>' +
        sampleBadge +
        '<div style="display:flex;justify-content:center;margin-top:18px;margin-bottom:8px;">' +
            '<img src="' + escapeHTML(logo) + '" alt="வேலை" loading="lazy" style="width:72px;height:72px;border-radius:14px;object-fit:contain;border:1px solid #e5e7eb;background:#fff;padding:6px;" onerror="this.onerror=null;this.src=\'../../assets/avatars/jobs/other.png\'">' +
        '</div>' +
        '<div style="margin-bottom:8px;"><span style="padding:4px 10px;border-radius:50px;background:#f3f0ff;color:#7040d6;font-size:11px;font-weight:800;">' + escapeHTML(jobCategory) + '</span></div>' +
        '<h3 style="margin:0 0 6px 0;font-size:16px;font-weight:800;color:#25283a;line-height:1.3;">' + escapeHTML(jobTitle) + '</h3>' +
        (businessName ? '<div style="font-size:13px;color:#666;margin-bottom:8px;">🏢 ' + escapeHTML(businessName) + '</div>' : '') + // V8 - Business Name - Clean - D
        '<div style="display:grid;gap:6px;padding:8px 0;border-top:1px solid #f0f0f5;border-bottom:1px solid #f0f0f5;font-size:13px;color:#444;text-align:center;line-height:1.6;">' +
            '<div>📍 வேலை செய்யும் இடம்: <b>' + escapeHTML(locationDisplay) + '</b>' + (locationFullDetail ? '<br><small style="color:#0d6efd;font-size:12px;">' + escapeHTML(locationFullDetail) + '</small>' : '') + '</div>' + // V8 - FIX 1 + FIX 3 - District+Taluk+WorkLocation Full Detail - "Theni, Bodinayakkanur - தேனி பஸ் ஸ்டாண்ட் அருகில்"
            '<div>👥 தேவை: <b>' + escapeHTML(vacancies) + ' பேர்</b></div>' +
            '<div>💰 சம்பளம்: <b style="color:#15803d;font-size:14px;">' + salaryText + '</b></div>' + // V8 - FIX 3 - Single Salary - "₹15000" - Single
            (workLocation && workLocation !== locationFullDetail ? '<div>🏢 வேலை இடம்: <b style="color:#0d6efd;">' + escapeHTML(workLocation) + '</b></div>' : '') + // V8 - FIX 3 - Extra WorkLocation Detail if different - "வேலை செய்யும் இடம்" Detail
            '<div>⭐ அனுபவம்: <b>' + escapeHTML(experience) + '</b></div>' +
            '<div>⚧ பாலினம்: <b>' + escapeHTML(gender) + '</b></div>' +
            '<div>🎂 வயது: <b>' + escapeHTML(ageRange) + '</b></div>' +
            '<div>🎓 கல்வித்தகுதி: <b>' + escapeHTML(education) + '</b></div>' +
            '<div>🕒 வேலை நேரம்: <b>' + escapeHTML(workingHours) + '</b></div>' +
            '<div>🛵 வாகனம்: <b>' + escapeHTML(vehicleRequired) + '</b></div>' + // S - vehicle - Clean - FIX 2
            '<div>📅 வேலைக்கு எப்போது ஆள் தேவை? <b>' + escapeHTML(joiningDate) + '</b></div>' + // T - joiningDate - FIX 2 - "வேலைக்கு எப்போது ஆள் தேவை" - Label Fixed
            (requiredSkills ? '<div>🔧 திறமை: <b>' + escapeHTML(requiredSkills) + '</b></div>' : '') +
        '</div>';
    return card;
}

// =====================================================
// BATCH 09 : renderJobsGrid - Filtered Jobs-ஐ Grid-ல் காட்ட தயார் பண்ணும் - Your File Same - No Delete
// வேலை: Filter பண்ணின Jobs-ஐ Reverse Order-ல் (Latest First) Store பண்ணி Pagination-க்கு அனுப்பும் - Your File Same
// =====================================================

function renderJobsGrid(list) {
    filteredJobsCache = Array.isArray(list) ? list.slice().reverse() : []; // Latest First - Your File Same
    currentPage = 1;
    renderPaginatedJobs();
}

// =====================================================
// BATCH 10 : renderPaginatedJobs - Current Page-க்கு ஏத்த Jobs-ஐ Grid-ல் காட்டும் - Your File Same - No Delete
// வேலை: Current Page-ல் இருக்க வேண்டிய 12 Jobs-ஐ மட்டும் Cut பண்ணி Grid-ல் காட்டும் - Your File Same
// JOBS_PER_PAGE = 12 - ஒரு Page-ல் 12 Cards - Your File Same
// Empty Check: Jobs இல்லைனா "வேலைகள் இல்லை" Message காட்டும் - Your File Same
// =====================================================

function renderPaginatedJobs() {
    const grid = document.getElementById("jobsGrid");
    const empty = document.getElementById("jobsEmpty");
    const countEl = document.getElementById("jobsResultCount");
    const paginationSection = document.getElementById("jobsPaginationSection");
    if (!grid) return;
    grid.innerHTML = "";
    if (countEl) countEl.textContent = filteredJobsCache.length;
    if (filteredJobsCache.length === 0) {
        if (empty) empty.hidden = false;
        if (paginationSection) paginationSection.hidden = true;
        return;
    }
    if (empty) empty.hidden = true;
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    const pageList = filteredJobsCache.slice(startIndex, endIndex);
    pageList.forEach(function (job) { grid.appendChild(createJobCard(job)); });
    renderPaginationControls();
}

// =====================================================
// BATCH 11 : renderPaginationControls - Pagination Buttons - Prev, Next, Page Numbers - Your File Same - No Delete
// வேலை: Page Numbers, Prev/Next Buttons Create பண்ணி Pagination Section-ல் காட்டும் - Your File Same
// Logic: Current Page-ல் இருந்து -2 to +2 Pages காட்டும் - Example: Page 5-ல் இருந்தா 3,4,5,6,7 - Your File Same
// Info: "பக்கம் 1 / 3 — மொத்தம் 33 வேலைகள்" -னு Info Text காட்டும் - Your File Same
// =====================================================

function renderPaginationControls() {
    const paginationSection = document.getElementById("jobsPaginationSection");
    const pagination = document.getElementById("jobsPagination");
    const paginationInfo = document.getElementById("jobsPaginationInfo");
    if (!pagination || !paginationSection) return;
    const totalPages = Math.ceil(filteredJobsCache.length / JOBS_PER_PAGE);
    if (totalPages <= 1) { paginationSection.hidden = true; return; }
    paginationSection.hidden = false;
    pagination.innerHTML = "";
    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.textContent = "‹ முந்தையது";
    previousButton.className = "jobs-page-btn";
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener("click", function () {
        if (currentPage > 1) { currentPage--; renderPaginatedJobs(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    });
    pagination.appendChild(previousButton);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
        const pageButton = document.createElement("button");
        pageButton.type = "button";
        pageButton.textContent = pageNumber;
        pageButton.className = "jobs-page-btn" + (pageNumber === currentPage ? " active" : "");
        pageButton.addEventListener("click", function () {
            currentPage = pageNumber; renderPaginatedJobs(); window.scrollTo({ top: 0, behavior: "smooth" });
        });
        pagination.appendChild(pageButton);
    }
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.textContent = "அடுத்தது ›";
    nextButton.className = "jobs-page-btn";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) { currentPage++; renderPaginatedJobs(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    });
    pagination.appendChild(nextButton);
    if (paginationInfo) {
        paginationInfo.textContent = "பக்கம் " + currentPage + " / " + totalPages + " — மொத்தம் " + filteredJobsCache.length + " வேலைகள்";
    }
}

// =====================================================
// BATCH 12 : loadPublicJobs - API-ல் இருந்து Active Jobs-ஐ Load பண்ணும் - MAIN LOAD - Your File Same - No Delete - V8 Active Filter Same
// வேலை: Google Sheet API-ல் இருந்து Employers Data-வை Fetch பண்ணி Active Status உள்ளவை மட்டும் Filter பண்ணி Grid-ல் காட்டும் - Your File Same
// Status Filter: status === "active" மட்டும் Public-ல் காட்டும் - pending, rejected காட்டாது - Your File Same
// Error Handling: API Fail ஆனா Error Message காட்டும் - Your File Same
// =====================================================

async function loadPublicJobs() {
    const grid = document.getElementById("jobsGrid");
    const empty = document.getElementById("jobsEmpty");
    if (!grid) return;
    grid.innerHTML = "<p style='text-align:center;padding:30px;color:#666;'>வேலைவாய்ப்புகள் ஏற்றுகிறது... ⏳ V8 - Clean Names + Single Salary + WorkLocation</p>";
    if (empty) empty.hidden = true;
    try {
        const response = await fetch(PUBLIC_JOBS_SHEET_URL);
        if (!response.ok) throw new Error("Server response: " + response.status);
        const allJobs = await response.json();
        if (!Array.isArray(allJobs)) throw new Error("தரவு சரியான பட்டியல் வடிவில் இல்லை");
        allJobsCache = allJobs.filter(function (job) { return String(job.status || "").toLowerCase().trim() === "active"; });
        console.log("✅ Public Jobs Loaded V8 - Active Only - Clean Names + Single Salary + WorkLocation:", allJobsCache.length, "out of", allJobs.length);
        renderJobsGrid(allJobsCache);
    } catch (error) {
        console.error("Public jobs loading error V8:", error);
        grid.innerHTML = "<p style='text-align:center;color:red;padding:20px;'>வேலைகளை ஏற்ற முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சி செய்யுங்கள்.<br><small>" + escapeHTML(error.message) + "</small></p>";
    }
}

// =====================================================
// BATCH 13 : setupJobsSearch - Search, Filter, Sort - Public Search Power - Your File Same - No Delete - V8 Clean Names + WorkLocation Search Added
// வேலை: Public Page-ல் Search Box, Location Filter, Job Type Filter, Sort - இதை எல்லாம் Control பண்ணும் - Your File Same
// Search: Job Title, Category-ல் தேடும் - Your File Same
// Location: District, Taluk, WorkLocation, AddressLine-ல் தேடும் - V8 Fix - District+Taluk+WorkLocation Search - Full Power - No Miss
// Type Filter: full-time, part-time - Work Time-ல் Filter பண்ணும் - Your File Same
// Sort: Latest, Salary High, Salary Low - Sort பண்ணும் - Your File Same - V8 Single Salary Sort
// Clear: எல்லா Filter-யும் Clear பண்ணி Original List காட்டும் - Your File Same
// =====================================================
function setupJobsSearch() {
    const searchInput = document.getElementById("jobSearch");
    const locationInput = document.getElementById("locationSearch");
    const typeFilter = document.getElementById("jobTypeFilter");
    const searchButton = document.getElementById("jobsSearchButton");
    const sortSelect = document.getElementById("jobsSort");
    const clearButton = document.getElementById("jobsClearButton");
    function performSearch() {
        let filteredJobs = allJobsCache.slice();
        const searchText = String(searchInput?.value || "").toLowerCase().trim();
        const locationText = String(locationInput?.value || "").toLowerCase().trim();
        const selectedType = String(typeFilter?.value || "all").toLowerCase().trim();
        if (searchText) {
            filteredJobs = filteredJobs.filter(function (job) {
                const title = getJobValue(job, ["jobTitle", "JobTitle", "wantedJob", "WantedJob"], "").toLowerCase();
                const category = getJobValue(job, ["jobCategory", "JobCategory", "jobType", "JobType"], "").toLowerCase();
                const business = getJobValue(job, ["businessName", "BusinessName", "name", "Name"], "").toLowerCase(); // V8 - businessName Search
                return (title.includes(searchText) || category.includes(searchText) || business.includes(searchText));
            });
        }
        if (locationText) {
            filteredJobs = filteredJobs.filter(function (job) {
                // V8 - District + Taluk + WorkLocation + AddressLine - Full Location Search - No Miss
                const district = getJobValue(job, ["district", "District", "location", "Location"], "").toLowerCase();
                const taluk = getJobValue(job, ["taluk", "Taluk", "area", "Area", "place", "Place"], "").toLowerCase(); // V8 - taluk - FIX 1
                const workLocation = getJobValue(job, ["workLocation", "WorkLocation"], "").toLowerCase(); // V8 - workLocation - FIX 3
                const addressLine = getJobValue(job, ["addressLine", "AddressLine", "address", "Address"], "").toLowerCase(); // V8 - addressLine
                return (district.includes(locationText) || taluk.includes(locationText) || workLocation.includes(locationText) || addressLine.includes(locationText));
            });
        }
        if (selectedType !== "all") {
            filteredJobs = filteredJobs.filter(function (job) {
                const workingHours = getJobValue(job, ["workingHours","WorkingHours","workTime","WorkTime"], "").toLowerCase();
                return workingHours.includes(selectedType);
            });
        }
        const selectedSort = sortSelect?.value || "latest";
        if (selectedSort === "salary-high") {
            filteredJobs.sort(function (a, b) { 
                const salA = getJobValue(a, ["salary", "salaryMin", "SalaryMin"], "0");
                const salB = getJobValue(b, ["salary", "salaryMin", "SalaryMin"], "0");
                return (parseInt(salB) - parseInt(salA)); 
            });
        }
        if (selectedSort === "salary-low") {
            filteredJobs.sort(function (a, b) { 
                const salA = getJobValue(a, ["salary", "salaryMin", "SalaryMin"], "0");
                const salB = getJobValue(b, ["salary", "salaryMin", "SalaryMin"], "0");
                return (parseInt(salA) - parseInt(salB)); 
            });
        }
        renderJobsGrid(filteredJobs);
    }
    searchButton?.addEventListener("click", performSearch);
    searchInput?.addEventListener("keyup", function (event) { if (event.key === "Enter") performSearch(); });
    locationInput?.addEventListener("keyup", function (event) { if (event.key === "Enter") performSearch(); });
    typeFilter?.addEventListener("change", performSearch);
    sortSelect?.addEventListener("change", performSearch);
    clearButton?.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (locationInput) locationInput.value = "";
        if (typeFilter) typeFilter.value = "all";
        if (sortSelect) sortSelect.value = "latest";
        renderJobsGrid(allJobsCache);
    });
}

// =====================================================
// BATCH 14 : setupMobileMenu - Mobile Menu Toggle - Your File Same - No Delete
// வேலை: Mobile-ல் Menu Toggle Button Click பண்ணினா Nav Links Open/Close ஆகும் - Your File Same
// =====================================================
function setupMobileMenu() {
    const toggleButton = document.getElementById("menuToggle");
    const navigation = document.getElementById("navLinks");
    toggleButton?.addEventListener("click", function () { navigation?.classList.toggle("open"); });
}

// =====================================================
// BATCH 15 : INIT - Page Load ஆனதும் எல்லாம் Start ஆகும் - MAIN INIT - Your File Same - No Delete - V8 Log
// வேலை: DOM Load ஆனதும் Jobs Load + Search Setup + Mobile Menu Setup - எல்லாம் Start - Your File Same
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Public Jobs V8 Loading - Based On Your V4 File - Full Explanation + Location Full Fix + Single Salary + WorkLocation + 13 Avatar");
    console.log("📍 V8 Fixes: Location 'இடம் சார்ந்த தகவல்' Only -> District+Taluk+WorkLocation Full Detail, Salary Single + WorkLocation Detail, Label 'வேலைக்கு எப்போது ஆள் தேவை'");
    loadPublicJobs(); // Active Jobs Load - Your File Same
    setupJobsSearch(); // Search/Filter/Sort Setup - Your File Same + V8 WorkLocation Search
    setupMobileMenu(); // Mobile Menu Setup - Your File Same
});