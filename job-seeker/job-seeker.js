// =====================================================
// FILE: JobSeekers/job-seeker.js - FINAL - SELFIE + COMPRESS
// BATCH 01: Navigation, BATCH 02: Photo Selfie + Compress, BATCH 03: Form + Sheet
// =====================================================
console.log("BATCH 00: JS Load OK - Selfie + Compress Version");

let photoBase64 = "";
let cameraStream = null;

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// ===== IMAGE COMPRESS TO KB - CLIENT SIDE =====
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
            // Extra limit for height too
            if (height > 1000) {
                width = Math.round((width * 1000) / height);
                height = 1000;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            // White background for jpeg
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            let quality = 0.7;
            let dataUrl = canvas.toDataURL("image/jpeg", quality);

            // Iteratively reduce quality to hit target KB (130KB)
            while (dataUrl.length > targetKB * 1024 * 1.37 && quality > 0.1) {
                quality -= 0.1;
                dataUrl = canvas.toDataURL("image/jpeg", quality);
            }
            // If still big, reduce size again
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

            console.log(`Compressed: ${(dataUrl.length/1024).toFixed(1)}KB approx, Quality: ${quality}`);
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

document.addEventListener("DOMContentLoaded", () => {

    // ===== ELEMENTS =====
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

    // ===== BATCH 02 - GALLERY PHOTO + COMPRESS =====
    if (profilePhoto) {
        profilePhoto.addEventListener("change", async function () {
            const file = this.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) { alert("புகைப்படம் மட்டும் தேர்வு செய்யவும்"); return; }
            
            if (photoStatusText) {
                photoStatusText.textContent = "⏳ Compress பண்ணிட்டு இருக்கேன்...";
                photoStatusText.style.color = "#7c3aed";
            }

            // Close camera if open
            selfieCameraWrap.style.display = "none";
            stopCamera();

            const compressed = await compressImageToKB(file, 800, 120);
            showPreview(compressed);
        });
    }

    // ===== BATCH 02-B - SELFIE CAMERA =====
    if (selfieButton) {
        selfieButton.addEventListener("click", async () => {
            try {
                selfieCameraWrap.style.display = "block";
                capturePhotoBtn.style.display = "inline-block";
                retakePhotoBtn.style.display = "none";
                usePhotoBtn.style.display = "none";
                selfieVideo.style.display = "block";
                selfieCanvas.style.display = "none";

                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, 
                    audio: false 
                });
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

    if (capturePhotoBtn) {
        capturePhotoBtn.addEventListener("click", () => {
            if (!selfieVideo.videoWidth) { alert("கேமரா ரெடி ஆகல, 1 sec கழிச்சு மறுபடியும் Try பண்ணுங்க"); return; }
            const ctx = selfieCanvas.getContext("2d");
            selfieCanvas.width = selfieVideo.videoWidth;
            selfieCanvas.height = selfieVideo.videoHeight;
            // Flip horizontally because video is mirrored - draw mirrored image correctly
            ctx.translate(selfieCanvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(selfieVideo, 0, 0, selfieCanvas.width, selfieCanvas.height);
            // Reset transform
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            selfieVideo.style.display = "none";
            selfieCanvas.style.display = "block";
            capturePhotoBtn.style.display = "none";
            retakePhotoBtn.style.display = "inline-block";
            usePhotoBtn.style.display = "inline-block";
        });
    }

    if (retakePhotoBtn) {
        retakePhotoBtn.addEventListener("click", () => {
            selfieVideo.style.display = "block";
            selfieCanvas.style.display = "none";
            capturePhotoBtn.style.display = "inline-block";
            retakePhotoBtn.style.display = "none";
            usePhotoBtn.style.display = "none";
        });
    }

    if (usePhotoBtn) {
        usePhotoBtn.addEventListener("click", async () => {
            const dataUrl = selfieCanvas.toDataURL("image/jpeg", 0.9);
            if (photoStatusText) {
                photoStatusText.textContent = "⏳ Compress பண்ணிட்டு இருக்கேன்...";
            }
            const compressed = await compressImageToKB(dataUrl, 700, 110);
            showPreview(compressed);

            // Close camera
            selfieCameraWrap.style.display = "none";
            stopCamera();
            selfieVideo.style.display = "block";
            selfieCanvas.style.display = "none";
            capturePhotoBtn.style.display = "inline-block";
            retakePhotoBtn.style.display = "none";
            usePhotoBtn.style.display = "none";
        });
    }

    if (closeCameraBtn) {
        closeCameraBtn.addEventListener("click", () => {
            selfieCameraWrap.style.display = "none";
            stopCamera();
        });
    }

    // ===== BATCH 03 - FORM SUBMIT WITH MANDATORY VALIDATION =====
    const seekerForm = document.getElementById("seekerForm");
    const successOverlay = document.getElementById("successOverlay");
    const successClose = document.getElementById("successClose");

    if (seekerForm) {
        seekerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("Submit Clicked");

            const getVal = id => document.getElementById(id)?.value.trim() || "";
            const getSel = id => document.getElementById(id)?.value || "";

            const fullName = getVal("fullName");
            const age = getVal("age");
            const gender = getSel("gender");
            const education = getSel("education");
            const experience = getSel("experience");
            const jobType = getSel("jobType");
            const district = getVal("district");
            const phone = getVal("phone");
            const phoneType = getSel("phoneType");
            const hasVehicle = getSel("hasVehicle");

            // Mandatory Check - 4 new fields + old
            if (!fullName) { alert("முழுப் பெயர் கட்டாயம்"); return; }
            if (!age) { alert("வயது கட்டாயம்"); return; }
            if (!gender) { alert("பாலினம் தேர்வு செய்யவும்"); return; }
            if (!education) { alert("கல்வித் தகுதி தேர்வு செய்யவும் - கட்டாயம் *"); document.getElementById("education")?.focus(); return; }
            if (!experience) { alert("அனுபவம் தேர்வு செய்யவும் - கட்டாயம் *"); document.getElementById("experience")?.focus(); return; }
            if (!jobType) { alert("விரும்பும் வேலை தேர்வு செய்யவும்"); return; }
            if (!district) { alert("மாவட்டம் கட்டாயம்"); return; }
            if (phone.length !== 10 || isNaN(phone)) { alert("10 இலக்க போன் எண் சரியா போடுங்க"); return; }
            if (!phoneType) { alert("போன் வகை தேர்வு செய்யவும் - கட்டாயம் *"); document.getElementById("phoneType")?.focus(); return; }
            if (!hasVehicle) { alert("வாகனம் உள்ளதா தேர்வு செய்யவும் - கட்டாயம் *"); document.getElementById("hasVehicle")?.focus(); return; }
            if (!photoBase64) { alert("புகைப்படம் கட்டாயம் - கேலரி அல்லது செல்பி எடுங்க"); return; }

            // Button loading state
            const submitBtn = document.getElementById("submitButton");
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "<span>⏳ பதிவு ஆகுது...</span>"; }

            const dataToSheet = {
                type: "seeker",
                name: fullName,
                age: age,
                gender: gender,
                maritalStatus: getSel("maritalStatus"),
                education: education,
                course: getVal("course"),
                jobType: jobType,
                jobVariety: getVal("jobVariety"),
                experience: experience,
                workType: getSel("workType"),
                salary: getVal("expectedSalary"),
                joining: getSel("joiningAvailability"),
                district: district,
                city: getVal("city"),
                phone: phone,
                phoneType: phoneType,
                hasVehicle: hasVehicle,
                vehicleType: getSel("vehicleType"),
                photoAllow: document.getElementById("allowPublicPhoto")?.checked ? "Yes" : "No",
                photoData: photoBase64 // Already compressed to ~100-130KB
            };

            try {
                await fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(dataToSheet) });
                console.log("Sheet-க்கு அனுப்பப்பட்டது - KB Size");
            } catch (err) {
                console.log("Sheet Error", err);
            }

            // localStorage without photo - Quota Fix
            try {
                const dataForLocal = {
                    name: fullName,
                    phone: phone,
                    district: district,
                    jobType: jobType,
                    education: education,
                    experience: experience,
                    phoneType: phoneType,
                    hasVehicle: hasVehicle,
                    date: new Date().toISOString(),
                    photoAllow: dataToSheet.photoAllow
                };
                const all = JSON.parse(localStorage.getItem("inaippuPaalamSeekers") || "[]");
                all.push(dataForLocal);
                // Keep only last 50
                if (all.length > 50) all.shift();
                localStorage.setItem("inaippuPaalamSeekers", JSON.stringify(all));
            } catch (err) {
                console.log("localStorage Clear", err);
                localStorage.removeItem("inaippuPaalamSeekers");
            }

            if (successOverlay) {
                successOverlay.classList.add("show");
            }

            seekerForm.reset();
            photoBase64 = "";
            stopCamera();
            if (previewImage) { previewImage.src = ""; previewImage.style.display = "none"; }
            if (photoPlaceholder) photoPlaceholder.style.display = "block";
            if (photoStatusText) { photoStatusText.textContent = "Max 2MB - தெளிவான Photo போடுங்க - Auto Compress ஆகும்"; photoStatusText.style.color = "#666"; photoStatusText.style.fontWeight = "400"; }
            if (selfieCameraWrap) selfieCameraWrap.style.display = "none";
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = "<span>பதிவு செய்யவும்</span><strong>→</strong>"; }
        });
    }

    if (successClose) {
        successClose.addEventListener("click", () => { successOverlay.classList.remove("show"); });
    }
});

/* ===== MOBILE MENU FIX - 3 DOT WORKING - FINAL ===== */
document.addEventListener("DOMContentLoaded", function() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) {
    console.log("Menu elements not found");
    return;
  }

  console.log("✅ Mobile Menu Fix Loaded");

  menuToggle.addEventListener("click", function(e) {
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

  document.addEventListener("click", function(e) {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
    }
  });
});