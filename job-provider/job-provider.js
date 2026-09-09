// =====================================================
// JOB PROVIDER - FINAL CLEAN - SELFIE + GALLERY + COMPRESS
// Same Logic as Job Seeker - KB Save to Google Drive
// Admin Approval Note Included
// =====================================================
console.log("Job Provider JS - Selfie + Compress Version");

let providerLogoBase64 = "";
let cameraStream = null;

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// Compress to ~120KB
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

  // ===== MOBILE MENU - CLEAN =====
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
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
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("is-open");
        menuToggle.classList.remove("is-open");
      }
    });
  }

  const form = document.getElementById("providerRegistrationForm");
  let formMessage = document.getElementById("formMessage");
  const providerName = document.getElementById("providerName");
  const providerPhone = document.getElementById("providerPhone");
  const jobTitle = document.getElementById("jobTitle");
  const jobCategory = document.getElementById("jobCategory");
  const vacancies = document.getElementById("vacancies");
  const workingHours = document.getElementById("workingHours");
  const vehicleRequired = document.getElementById("vehicleRequired");
  const joiningDate = document.getElementById("joiningDate");

  const providerImage = document.getElementById("providerImage");
  const photoPreviewDiv = document.getElementById("photoPreview");
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

  const successOverlay = document.getElementById("successOverlay");
  const successClose = document.getElementById("successClose");

  if (!formMessage && form) {
    formMessage = document.createElement("div");
    formMessage.id = "formMessage";
    formMessage.className = "form-message";
    formMessage.style.display = "none";
    form.insertBefore(formMessage, form.firstChild);
  }

  function showMessage(msg, type){
    if(!formMessage) { alert(msg); return; }
    formMessage.textContent = msg;
    formMessage.style.display = "block";
    formMessage.style.padding = "14px 18px";
    formMessage.style.marginTop = "15px";
    formMessage.style.borderRadius = "12px";
    formMessage.style.fontWeight = "700";
    formMessage.style.textAlign = "center";
    if(type === "error"){
      formMessage.style.color = "#991b1b";
      formMessage.style.background = "#fef2f2";
      formMessage.style.border = "2px solid #ef4444";
    } else {
      formMessage.style.color = "#065f46";
      formMessage.style.background = "#e6f9ed";
      formMessage.style.border = "2px solid #10b981";
      formMessage.scrollIntoView({behavior:"smooth", block:"center"});
      setTimeout(()=>{ formMessage.style.display="none"; }, 6000);
    }
  }

  function showPreview(base64) {
    providerLogoBase64 = base64;
    if (previewImage) {
      previewImage.src = base64;
      previewImage.style.display = "block";
    }
    if (photoPlaceholder) photoPlaceholder.style.display = "none";
    if (photoPreviewDiv) {
      photoPreviewDiv.style.borderColor = "#10b981";
      photoPreviewDiv.style.borderWidth = "3px";
      photoPreviewDiv.style.background = "#e6f9ed";
    }
    if (photoStatusText) {
      const kb = Math.round((base64.length * 0.75) / 1024);
      photoStatusText.textContent = `✅ Compressed: ~${kb}KB - Drive-ல் இடம் மிச்சம்`;
      photoStatusText.style.color = "#16a34a";
      photoStatusText.style.fontWeight = "700";
    }
  }

  // PHONE - Only Numbers
  if (providerPhone) {
    providerPhone.addEventListener("input", () => {
      providerPhone.value = providerPhone.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  // GALLERY + COMPRESS
  if (providerImage) {
    providerImage.addEventListener("change", async () => {
      const file = providerImage.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { showMessage("Image file மட்டும்", "error"); return; }

      if (photoStatusText) {
        photoStatusText.textContent = "⏳ Compress பண்ணிட்டு இருக்கேன்...";
        photoStatusText.style.color = "#7c3aed";
      }
      if (selfieCameraWrap) selfieCameraWrap.style.display = "none";
      stopCamera();

      const compressed = await compressImageToKB(file, 800, 120);
      showPreview(compressed);
    });
  }

  // SELFIE CAMERA - Same as Job Seeker
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
        alert("கேமரா ஓபன் ஆகல. Permission கொடுங்க அல்லது Gallery-ல் இருந்து தேர்வு செய்யுங்க.");
        selfieCameraWrap.style.display = "none";
      }
    });
  }

  if (capturePhotoBtn) {
    capturePhotoBtn.addEventListener("click", () => {
      if (!selfieVideo.videoWidth) { alert("கேமரா ரெடி ஆகல, 1 sec கழிச்சு Try பண்ணுங்க"); return; }
      const ctx = selfieCanvas.getContext("2d");
      selfieCanvas.width = selfieVideo.videoWidth;
      selfieCanvas.height = selfieVideo.videoHeight;
      ctx.translate(selfieCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(selfieVideo, 0, 0, selfieCanvas.width, selfieCanvas.height);
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
      if (photoStatusText) photoStatusText.textContent = "⏳ Compress பண்ணிட்டு இருக்கேன்...";
      const compressed = await compressImageToKB(dataUrl, 700, 110);
      showPreview(compressed);

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

  // VALIDATION - CLEAN SINGLE
  function clearErrors() {
    document.querySelectorAll(".form-group.has-error").forEach(f => f.classList.remove("has-error"));
    form.querySelectorAll("[required]").forEach(f => {
      f.style.borderColor = "#d9e0ea";
      f.style.background = "#fbfcfe";
    });
  }
  function setError(input, msg) {
    if (!input) return;
    const field = input.closest(".form-group");
    if (field) field.classList.add("has-error");
    input.style.borderColor = "#e5484d";
    input.style.background = "#fff5f5";
  }
  function getVal(el){ return el && el.value ? el.value.trim() : ""; }

  function scrollToFirstError() {
    const err = document.querySelector(".form-group.has-error") || form.querySelector("[required]:invalid") || form.querySelector("[required]") && Array.from(form.querySelectorAll("[required]")).find(f => !f.value.trim());
    if (err) {
      const target = err.querySelector ? err.querySelector("input, select, textarea") || err : err;
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        if(target.focus) target.focus();
      }, 100);
    }
  }

  function validateForm() {
    clearErrors();
    let valid = true;
    if (!getVal(providerName)) { setError(providerName, "பெயர்"); valid = false; }
    if (!/^[0-9]{10}$/.test(getVal(providerPhone))) { setError(providerPhone, "10 இலக்க எண்"); valid = false; }
    if (!getVal(jobTitle)) { setError(jobTitle, "வேலை பெயர்"); valid = false; }
    if (jobCategory && !jobCategory.value) { setError(jobCategory, "வகை"); valid = false; }
    if (vacancies && (!vacancies.value || Number(vacancies.value) < 1)) { setError(vacancies, "எண்ணிக்கை"); valid = false; }
    if (workingHours && !workingHours.value) { setError(workingHours, "நேரம்"); valid = false; }
    if (vehicleRequired && !vehicleRequired.value) { setError(vehicleRequired, "வாகனம்"); valid = false; }
    if (joiningDate && !joiningDate.value) { setError(joiningDate, "தேதி"); valid = false; }
    if (!valid) scrollToFirstError();
    return valid;
  }

  // SUBMIT - COMPRESSED PHOTO TO SHEET
  if(form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();

      if(!validateForm()){
        showMessage("⚠ சிவப்பு இடங்களை நிரப்பவும்", "error");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const oldBtnText = submitBtn ? submitBtn.innerHTML : "";
      if(submitBtn){ submitBtn.innerHTML = "⏳ அனுப்புகிறது..."; submitBtn.disabled = true; }

      const dataToSheet = {
        type: "addEmployer",
        providerName: document.getElementById("providerName")?.value.trim() || "",
        businessName: document.getElementById("businessName")?.value.trim() || "",
        providerPhone: document.getElementById("providerPhone")?.value.trim() || "",
        providerEmail: document.getElementById("providerEmail")?.value.trim() || "",
        jobTitle: document.getElementById("jobTitle")?.value.trim() || "",
        jobCategory: document.getElementById("jobCategory")?.value || "",
        vacancies: document.getElementById("vacancies")?.value || "1",
        experience: document.getElementById("experience")?.value || "",
        gender: document.getElementById("gender")?.value || "",
        ageRange: document.getElementById("ageRange")?.value.trim() || "",
        education: document.getElementById("education")?.value || "",
        workingHours: document.getElementById("workingHours")?.value || "",
        vehicleRequired: document.getElementById("vehicleRequired")?.value || "",
        joiningDate: document.getElementById("joiningDate")?.value || "",
        salaryMin: document.getElementById("salaryMin")?.value || "",
        salaryMax: document.getElementById("salaryMax")?.value || "",
        requiredSkills: document.getElementById("requiredSkills")?.value.trim() || "",
        logoLink: providerLogoBase64 || "No Logo",
        status: "pending",
        timestamp: new Date().toISOString()
      };

      const SHEET_URL = typeof GOOGLE_SHEET_URL !== 'undefined' ? GOOGLE_SHEET_URL : (typeof EMPLOYER_SHEET_URL !== 'undefined' ? EMPLOYER_SHEET_URL : "");

      try {
        await fetch(SHEET_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(dataToSheet)
        });
        console.log("✅ Provider Sheet Save - Compressed Photo");
        showMessage("✅ பதிவு வெற்றி! Admin Approval-க்கு பிறகு Public-ல் தெரியும்.", "success");
        
        form.reset();
        providerLogoBase64 = "";
        stopCamera();
        if (previewImage) { previewImage.src = ""; previewImage.style.display = "none"; }
        if (photoPlaceholder) { photoPlaceholder.style.display = "block"; photoPlaceholder.textContent = "🏢"; }
        if (photoPreviewDiv) { photoPreviewDiv.style.borderColor = "#7c3aed"; photoPreviewDiv.style.background = "#eee"; }
        if (photoStatusText) { photoStatusText.textContent = "Max 2MB - Auto Compress ஆகி ~120KB-ல் Drive-ல் Save ஆகும்"; photoStatusText.style.color = "#666"; }
        if (selfieCameraWrap) selfieCameraWrap.style.display = "none";

        if (successOverlay) { successOverlay.style.display = "grid"; successOverlay.classList.add("show"); }

      } catch(err) {
        console.error(err);
        showMessage("❌ Error: " + err.message, "error");
      } finally {
        if(submitBtn){ submitBtn.innerHTML = oldBtnText; submitBtn.disabled = false; }
      }
    });
  }

  // Clear error on input
  document.querySelectorAll(".form-group input,.form-group select,.form-group textarea").forEach(input => {
    const handler = () => {
      const field = input.closest(".form-group");
      if (field) {
        field.classList.remove("has-error");
        input.style.borderColor = "#d9e0ea";
        input.style.background = "#fbfcfe";
      }
    };
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
  });

  if(successClose){
    successClose.addEventListener("click", ()=> {
      if(successOverlay) { successOverlay.style.display = "none"; successOverlay.classList.remove("show"); }
    });
  }
});