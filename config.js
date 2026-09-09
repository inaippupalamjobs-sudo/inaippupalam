// =====================================================
// BATCH 8.1 - மைய கட்டுப்பாட்டு பாலம் (config.js)
// விளக்கம்: Website-க்கும் Google Sheet-க்கும் இடையிலான ஒரே இணைப்பு
// கஸ்டமருக்கு இது தெரியாது. நமக்கு மட்டும் தான்.
// =====================================================


// இங்கே உங்க Google Apps Script Web App URL வரும்
// நான் கீழே கொடுக்கிற Code.gs-ஐ Deploy பண்ணினதும் URL கிடைக்கும்
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbygfMoIa4q88zyc9KX0b0PYUxXnex-MIaZtFEg5Yt9kqoDtOjlpLZDz2rmyRoyI45uDtw/exec";
console.log("Config Loaded");


// Public-க்கு எதை மறைக்கணும் என்பதை இங்கே முடிவு பண்ணலாம்
const HIDE_FROM_PUBLIC = ["phone", "address"];
