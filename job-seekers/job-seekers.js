// =====================================================
// FILE: job-seeker/job-seeker.js - FINAL CLEAN SHEET
// INAIPPU PALAM - SEEKERS NEW SHEET - HANG FIX
// =====================================================

/*jshint esversion: 8 */

console.log("BATCH 00: Job Seeker JS Loaded - FIXED VERSION");

let photoBase64 = "";
let cameraStream = null;
let currentFacingMode = "user";

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// =====================================================
// BATCH 02-A: IMAGE COMPRESS - Drive இடம் மிச்சம் பண்ணும்
// இது தான் Photo-வை 130KB-க்கு Compress பண்ணும் - Speed-க்கு
// =====================================================
async function compressImageToKB(fileOrDataUrl, maxWidth = 800, targetKB = 130) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            if (height > 1000) {
                width = Math.round((width * 1000) / height);
                height = 1000;
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            let quality = 0.7;
            let dataUrl = canvas.toDataURL("image/jpeg", quality);
            while (dataUrl.length > targetKB * 1024 * 1.37 && quality > 0.1) {
                quality -= 0.1;
                dataUrl = canvas.toDataURL("image/jpeg", quality);
            }
            if (dataUrl.length > targetKB * 1024 * 1.37) {
                const smallCanvas = document.createElement("canvas");
                smallCanvas.width = Math.round(width * 0.7);
                smallCanvas.height = Math.round(height * 0.7);
                const sCtx = smallCanvas.getContext("2d");
                sCtx.fillStyle = "#ffffff";
                sCtx.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
                sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
                dataUrl = smallCanvas.toDataURL("image/jpeg", 0.5);
            }
            console.log(`Compressed: ${(dataUrl.length / 1024).toFixed(1)}KB`);
            resolve(dataUrl);
        };
        if (typeof fileOrDataUrl === "string") {
            img.src = fileOrDataUrl;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(fileOrDataUrl);
        }
    });
}

// =====================================================
// BATCH 00-A: MAIN DOM READY - எல்லாம் ஒரே இடத்தில்
// முன்னாடி 2 தடவை DOMContentLoaded இருந்தது - அது தான் Hang
// இப்போ ஒரே ஒரு தடவை தான் - Hang Fix
// =====================================================
document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // BATCH 01: ELEMENTS - HTML-ல் இருக்கிற எல்லா ID-யும் பிடிக்கும்
    // =====================================================
    const profilePhoto = document.getElementById("profilePhoto");
    const previewImage = document.getElementById("previewImage");
    const photoPlaceholder = document.getElementById("photoPlaceholder");
    const photoStatusText = document.getElementById("photoStatusText");
    const selfieButton = document.getElementById("selfieButton");
    const selfieCameraWrap = document.getElementById("selfieCameraWrap");
    const selfieVideo = document.getElementById("selfieVideo");
    const selfieCanvas = document.getElementById("selfieCanvas");
    const capturePhotoBtn = document.getElementById("capturePhotoBtn");
    const retakePhotoBtn = document.getElementById("retakePhotoBtn");
    const usePhotoBtn = document.getElementById("usePhotoBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");
    const flipCameraBtn = document.getElementById("flipCameraBtn");
    const seekerForm = document.getElementById("seekerForm");
    const successOverlay = document.getElementById("successOverlay");
    const successClose = document.getElementById("successClose");
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    // =====================================================
    // BATCH 01-A: MOBILE MENU FIX - ஒரே இடத்தில் Menu Logic
    // முன்னாடி BATCH 04 தனியா இருந்தது - இப்போ இங்கயே
    // =====================================================
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle("is-open");
            menuToggle.classList.toggle("is-open", isOpen);
        });
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("is-open");
                menuToggle.classList.remove("is-open");
            });
        });
        document.addEventListener("click", function (e) {
            if (!menuToggle.contains(e.target) &&!navLinks.contains(e.target)) {
                navLinks.classList.remove("is-open");
                menuToggle.classList.remove("is-open");
            }
        });
        console.log("✅ Mobile Menu Fix Loaded - No Duplicate");
    }

    // =====================================================
    // BATCH 02-B: PHOTO PREVIEW - புகைப்படம் காட்டும்
    // =====================================================
    function showPreview(base64) {
        photoBase64 = base64;
        if (previewImage) {
            previewImage.src = base64;
            previewImage.style.display = "block";
        }
        if (photoPlaceholder) photoPlaceholder.style.display = "none";
        if (photoStatusText) {
            const kb = Math.round((base64.length * 0.75) / 1024);
            photoStatusText.textContent = `✅ Compressed: ~${kb}KB - Drive-ல் இடம் மிச்சம்`;
            photoStatusText.style.color = "#16a34a";
            photoStatusText.style.fontWeight = "700";
        }
    }

    // =====================================================
    // BATCH 02-C: GALLERY PHOTO - கேலரியில் இருந்து Photo
    // =====================================================
    if (profilePhoto) {
        profilePhoto.addEventListener("change", async function () {
            const file = this.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) { alert("புகைப்படம் மட்டும் தேர்வு செய்யவும்"); return; }
            if (photoStatusText) { photoStatusText.textContent = "⏳ Compress பண்ணிட்டு இருக்கேன்..."; photoStatusText.style.color = "#7c3aed"; }
            if (selfieCameraWrap) selfieCameraWrap.style.display = "none";
            stopCamera();
            const compressed = await compressImageToKB(file, 800, 120);
            showPreview(compressed);
        });
    }

    // =====================================================
    // BATCH 02-D,E,F,G,H,I: SELFIE CAMERA - மொத்த Camera Logic
    // =====================================================
    if (selfieButton) {
        selfieButton.addEventListener("click", async () => {
            try {
                selfieCameraWrap.style.display = "block";
                capturePhotoBtn.style.display = "inline-block";
                retakePhotoBtn.style.display = "none";
                usePhotoBtn.style.display = "none";
                selfieVideo.style.display = "block";
                selfieCanvas.style.display = "none";
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
                cameraStream = stream;
                selfieVideo.srcObject = stream;
                selfieVideo.play();
            } catch (err) {
                console.error(err);
                alert("கேமரா ஓபன் ஆகல. Browser Permission கொடுங்க. அல்லது கேலரியில் இருந்து தேர்வு செய்யுங்க.");
                selfieCameraWrap.style.display = "none";
            }
        });
    }
    if (flipCameraBtn) {
        flipCameraBtn.addEventListener("click", async () => {
            currentFacingMode = currentFacingMode === "user"? "environment" : "user";
            flipCameraBtn.textContent = currentFacingMode === "user"? "🔄 பேக் கேமரா" : "🔄 முன் கேமரா";
            stopCamera();
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode }, audio: false });
                cameraStream = stream; selfieVideo.srcObject = stream; selfieVideo.play();
            } catch (err) { console.error(err); }
        });
    }
    if (capturePhotoBtn) {
        capturePhotoBtn.addEventListener("click", () => {
            if (!selfieVideo.videoWidth) { alert("கேமரா ரெடி ஆகல, 1 sec கழிச்சு Try பண்ணுங்க"); return; }
            const ctx = selfieCanvas.getContext("2d");
            selfieCanvas.width = selfieVideo.videoWidth; selfieCanvas.height = selfieVideo.videoHeight;
            ctx.translate(selfieCanvas.width, 0); ctx.scale(-1, 1);
            ctx.drawImage(selfieVideo, 0, 0, selfieCanvas.width, selfieCanvas.height);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            selfieVideo.style.display = "none"; selfieCanvas.style.display = "block";
            capturePhotoBtn.style.display = "none"; retakePhotoBtn.style.display = "inline-block"; usePhotoBtn.style.display = "inline-block";
        });
    }
    if (retakePhotoBtn) {
        retakePhotoBtn.addEventListener("click", () => {
            selfieVideo.style.display = "block"; selfieCanvas.style.display = "none";
            capturePhotoBtn.style.display = "inline-block"; retakePhotoBtn.style.display = "none"; usePhotoBtn.style.display = "none";
        });
    }
    if (usePhotoBtn) {
        usePhotoBtn.addEventListener("click", async () => {
            const dataUrl = selfieCanvas.toDataURL("image/jpeg", 0.9);
            if (photoStatusText) photoStatusText.textContent = "⏳ Compress பண்ணிட்டு இருக்கேன்...";
            const compressed = await compressImageToKB(dataUrl, 700, 110);
            showPreview(compressed);
            selfieCameraWrap.style.display = "none"; stopCamera();
            selfieVideo.style.display = "block"; selfieCanvas.style.display = "none";
            capturePhotoBtn.style.display = "inline-block"; retakePhotoBtn.style.display = "none"; usePhotoBtn.style.display = "none";
        });
    }
    if (closeCameraBtn) {
        closeCameraBtn.addEventListener("click", () => { selfieCameraWrap.style.display = "none"; stopCamera(); });
    }

    // =====================================================
    // BATCH 03: FORM SUBMIT - Google Sheet-க்கு அனுப்பும்
    // இது தான் "Seekers" Sheet-க்கு Data போகும் இடம் - NO RECORDS FIX
    // =====================================================
    if (seekerForm) {
        seekerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("Submit Clicked - NEW SEEKERS SHEET - FIXED");

            const getVal = (id) => document.getElementById(id)?.value.trim() || "";
            const getSel = (id) => document.getElementById(id)?.value || "";

            const fullName = getVal("fullName");
            const age = getVal("age");
            const gender = getSel("gender");
            const maritalStatus = getSel("maritalStatus");
            const education = getSel("education");
            const course = getVal("course");
            const preferredJob = getSel("jobType");
            const jobTypeVariety = getVal("jobVariety");
            const experience = getSel("experience");
            const workType = getSel("workType");
            const expectedSalary = getVal("expectedSalary");
            const joiningAvailability = getSel("joiningAvailability");
            const district = getSel("district");
            const city = getVal("city");
            const address = getVal("address");
            const pincode = getVal("pincode");
            const phone = getVal("phone");
            const phoneType = getSel("phoneType");
            const vehicle = getSel("vehicle");
            const preferredWorkArea = getSel("preferredWorkArea");
            const allowPublicPhoto = document.getElementById("allowPublicPhoto")?.checked? "Yes" : "No";
            const additionalInfo = getVal("additionalInfo");

            // Validation - கட்டாய Field Check
            if (!fullName) { alert("முழுப் பெயர் கட்டாயம்"); return; }
            if (!age) { alert("வயது கட்டாயம்"); return; }
            if (!gender) { alert("பாலினம் தேர்வு செய்யவும்"); return; }
            if (!education) { alert("கல்வித் தகுதி கட்டாயம் *"); document.getElementById("education")?.focus(); return; }
            if (!experience) { alert("அனுபவம் கட்டாயம் *"); return; }
            if (!preferredJob) { alert("விரும்பும் வேலை தேர்வு செய்யவும்"); return; }
            if (!district) { alert("மாவட்டம் கட்டாயம்"); return; }
            if (!city) { alert("தாலுகா / City கட்டாயம்"); return; }
            if (!phoneType) { alert("போன் வகை கட்டாயம் *"); return; }
            if (phoneType!== "no-phone" && (phone.length!== 10 || isNaN(phone))) { alert("10 இலக்க போன் எண் சரியா போடுங்க"); return; }
            if (!vehicle) { alert("வாகனம் தேர்வு செய்யவும்"); return; }
            if (!preferredWorkArea) { alert("வேலை செய்ய விரும்பும் பகுதியை தேர்வு செய்யவும்"); return; }
            if (!photoBase64) { alert("புகைப்படம் கட்டாயம் - கேலரி அல்லது செல்பி எடுங்க"); return; }

            const submitBtn = document.getElementById("submitButton");
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "<span>⏳ பதிவு ஆகுது...</span>"; }

            // Google Sheet-க்கு அனுப்பும் Data - COLUMN MAP
            const dataToSheet = {
                "type": "seeker", // முக்கியம் - Apps Script-ல் இதை வச்சு தான் Seekers Sheet-ல் போடும்
                "Full Name": fullName, "Age": age, "Gender": gender, "Marital Status": maritalStatus,
                "Education": education, "Course": course, "Preferred Job": preferredJob, "Job Type": jobTypeVariety,
                "Experience": experience, "Work Type": workType, "Expected Salary": expectedSalary,
                "Joining Availability": joiningAvailability, "District": district, "City": city,
                "Address": address, "Pincode": pincode, "Phone": phone, "Phone Type": phoneType,
                "Vehicle": vehicle, "Preferred Work Area": preferredWorkArea,
                "Allow Public Photo": allowPublicPhoto, "Additional Info": additionalInfo,
                "Photo": photoBase64, "Status": "Pending",
                "DateTime": new Date().toLocaleString("ta-IN")
            };

            console.log("NEW SEEKERS DATA:", dataToSheet);

            // SEND TO GOOGLE SHEET - config.js URL Use பண்ணும்
            try {
                // GOOGLE_SHEET_URL config.js-ல் இருந்து வரும் - உங்க Original URL தான்
                const url = (typeof GOOGLE_SHEET_URL!== "undefined")? GOOGLE_SHEET_URL : (typeof SHEET_API_URL!== "undefined"? SHEET_API_URL : "");
                await fetch(url, { method: "POST", mode: "no-cors", body: JSON.stringify(dataToSheet) });
                console.log("Seekers Sheet request sent successfully");
            } catch (err) { console.log("Seekers Sheet Error:", err); }

            // Local Storage - Photo Save பண்ணல - Speed-க்கு
            try {
                const dataForLocal = { name: fullName, phone: phone, district: district, city: city, preferredJob: preferredJob, education: education, date: new Date().toISOString() };
                const all = JSON.parse(localStorage.getItem("inaippuPaalamSeekers") || "[]");
                all.push(dataForLocal);
                if (all.length > 50) all.shift();
                localStorage.setItem("inaippuPaalamSeekers", JSON.stringify(all));
            } catch (err) { localStorage.removeItem("inaippuPaalamSeekers"); }

            // Success Popup
            if (successOverlay) successOverlay.classList.add("show");
            seekerForm.reset();
            photoBase64 = ""; stopCamera();
            if (previewImage) { previewImage.src = ""; previewImage.style.display = "none"; }
            if (photoPlaceholder) photoPlaceholder.style.display = "block";
            if (photoStatusText) { photoStatusText.textContent = "Max 2MB - தெளிவான Photo போடுங்க - Auto Compress ஆகும்"; photoStatusText.style.color = "#666"; }
            if (selfieCameraWrap) selfieCameraWrap.style.display = "none";
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = "<span>பதிவு செய்யவும்</span><strong>→</strong>"; }
        });
    }

    // Success Close Button
    if (successClose) {
        successClose.addEventListener("click", () => { successOverlay.classList.remove("show"); });
    }
});