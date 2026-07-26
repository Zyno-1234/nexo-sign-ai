// ======================================================
// NEXO AI Experience Platform
// demo-v2.js
// Version: 2.1
// ======================================================

// -------------------------------
// Global Application State
// -------------------------------

const App = {
    industry: "hospital",
    config: null,

    campaigns: [],
    currentCampaign: 0,

    currentAudience: "default",

    cameraReady: false,
    aiReady: false,

    rotationTimer: null,

    debug: false
};

// -------------------------------
// Frequently Used DOM Elements
// -------------------------------

const UI = {

    heroImage: document.getElementById("heroImage"),
    heroVideo: document.getElementById("heroVideo"),

    campaignTitle: document.getElementById("campaignTitle"),
    campaignSubtitle: document.getElementById("campaignSubtitle"),

    heroCTA: document.getElementById("heroCTA"),
    ctaTitle: document.getElementById("ctaTitle"),

    qrImage: document.getElementById("qrImage"),

    recommendationList: document.getElementById("recommendations"),

    experienceTitle: document.getElementById("experienceTitle"),
    experienceMessage: document.getElementById("experienceMessage"),

    loadingOverlay: document.getElementById("loadingOverlay"),
    personalizationOverlay: document.getElementById("personalizationOverlay"),

    toastContainer: document.getElementById("toastContainer"),

    camera: document.getElementById("camera"),

    liveClock: document.getElementById("liveClock")

};

// ======================================================
// Utility Functions
// ======================================================

function $(id) {
    return document.getElementById(id);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fadeIn(element) {

    element.style.opacity = 0;
    element.style.display = "block";

    let opacity = 0;

    const timer = setInterval(() => {

        opacity += 0.05;

        element.style.opacity = opacity;

        if (opacity >= 1)
            clearInterval(timer);

    }, 20);

}

function fadeOut(element) {

    let opacity = 1;

    const timer = setInterval(() => {

        opacity -= 0.05;

        element.style.opacity = opacity;

        if (opacity <= 0) {

            clearInterval(timer);

            element.style.display = "none";

        }

    }, 20);

}

// ======================================================
// Live Clock
// ======================================================

function startClock() {

    if (!UI.liveClock) return;

    function updateClock() {

        const now = new Date();

        UI.liveClock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    }

    updateClock();

    setInterval(updateClock, 1000);

}

// ======================================================
// Toast Notification
// ======================================================

function showToast(title, message, duration = 3500) {

    if (!UI.toastContainer) return;

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `
        <strong>${title}</strong>
        <br>
        <small>${message}</small>
    `;

    UI.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, duration);

}


// ======================================================
// Loading Overlay
// ======================================================

function hideLoading() {

    if (!UI.loadingOverlay) return;

    UI.loadingOverlay.style.opacity = "0";

    setTimeout(() => {

        UI.loadingOverlay.style.display = "none";

    }, 500);

}

// ======================================================
// Personalization Overlay
// ======================================================

function showPersonalization(message) {

    if (!UI.personalizationOverlay) return;

    const title = UI.personalizationOverlay.querySelector("h2");

    if (title)
        title.textContent = message;

    UI.personalizationOverlay.style.display = "flex";

    requestAnimationFrame(() => {

        UI.personalizationOverlay.style.opacity = "1";

    });

}

function hidePersonalization() {

    if (!UI.personalizationOverlay) return;

    UI.personalizationOverlay.style.opacity = "0";

    setTimeout(() => {

        UI.personalizationOverlay.style.display = "none";

    }, 400);

}

// ======================================================
// Camera Manager
// ======================================================

async function startCamera() {

    if (!UI.camera) return;

    try {

        const stream = await navigator.mediaDevices.getUserMedia({

            video: {
                width: 1280,
                height: 720,
                facingMode: "user"
            },

            audio: false

        });

        UI.camera.srcObject = stream;

        await UI.camera.play();

        App.cameraReady = true;

        console.log("✅ Camera Started");

        showToast(
            "Vision Engine",
            "Camera connected successfully."
        );

    }
    catch (error) {

        console.error(error);

        showToast(
            "Camera Error",
            "Unable to access webcam."
        );

    }

}

// ======================================================
// Camera Health Monitor
// ======================================================

function monitorCamera() {

    setInterval(() => {

        if (!UI.camera) return;

        if (
            UI.camera.readyState < 2 &&
            App.cameraReady
        ) {

            console.warn("Camera disconnected");

            App.cameraReady = false;

            startCamera();

        }

    }, 5000);

}

// ======================================================
// Load Industry Configuration
// ======================================================

async function loadConfiguration() {

    App.industry =
        localStorage.getItem("selectedIndustry") ||
        "hospital";

    try {

        const response = await fetch(
            `config/${App.industry}.json`
        );

        App.config = await response.json();

        console.log(
            "Industry Loaded:",
            App.industry
        );

        App.campaigns = App.config.campaigns;

        updateCampaign(0);

    }
    catch (error) {

        console.error(error);

        showToast(
            "Configuration",
            "Unable to load industry JSON."
        );

    }

}


// ======================================================
// Campaign Renderer
// ======================================================

function updateCampaign(index) {

    if (!App.campaigns.length) return;

    const campaign = App.campaigns[index];

    App.currentCampaign = index;

    if (UI.campaignTitle)
        UI.campaignTitle.textContent =
            campaign.title;

    if (UI.campaignSubtitle)
        UI.campaignSubtitle.textContent =
            campaign.subtitle;

    if (UI.heroCTA)
        UI.heroCTA.textContent =
            campaign.cta;

    if (UI.ctaTitle)
        UI.ctaTitle.textContent =
            campaign.cta;

    // Image

    if (
        UI.heroImage &&
        campaign.image
    ) {

        UI.heroImage.src =
            campaign.image;

    }

    // QR

    if (
        UI.qrImage &&
        campaign.qr
    ) {

        UI.qrImage.src =
            campaign.qr;

    }

    // Recommendations

    if (UI.recommendationList) {

        UI.recommendationList.innerHTML = "";

        campaign.recommend.forEach(item => {

            const li =
                document.createElement("li");

            li.textContent = item;

            UI.recommendationList.appendChild(li);

        });

    }

}


// ======================================================
// AI Experience Engine
// ======================================================

function onAudienceDetected(data) {

    /*
        data = {

            gender : "male",
            age : 35,
            confidence : 0.92

        }

    */

    console.log("Audience Detected:", data);

    App.currentAudience = data.gender;

    let campaignIndex = 0;

    if (data.gender === "male")
        campaignIndex = 1;

    else if (data.gender === "female")
        campaignIndex = 2;

    else
        campaignIndex = 0;

    // Avoid unnecessary updates
    if (campaignIndex === App.currentCampaign)
        return;

    showPersonalization("Preparing your personalized experience...");

    setTimeout(() => {

        updateCampaign(campaignIndex);

        if (UI.experienceTitle)
            UI.experienceTitle.textContent =
                "Personalization Active";

        if (UI.experienceMessage)
            UI.experienceMessage.textContent =
                "Relevant content selected using Vision AI.";

        showToast(
            "AI Experience",
            "Campaign updated successfully."
        );

        hidePersonalization();

    }, 700);

}


// ======================================================
// Campaign Rotation
// ======================================================

function startCampaignRotation() {

    if (App.rotationTimer)
        clearInterval(App.rotationTimer);

    App.rotationTimer = setInterval(() => {

        // Do not rotate if AI is actively personalizing
        if (App.currentAudience !== "default")
            return;

        let next = App.currentCampaign + 1;

        if (next >= App.campaigns.length)
            next = 0;

        updateCampaign(next);

    }, 10000);

}


// ======================================================
// Reset Experience
// ======================================================

function resetExperience() {

    App.currentAudience = "default";

    updateCampaign(0);

    if (UI.experienceTitle)
        UI.experienceTitle.textContent =
            "AI Ready";

    if (UI.experienceMessage)
        UI.experienceMessage.textContent =
            "Waiting for the next visitor.";

}

// Example integration




// ======================================================
// Application Startup
// ======================================================
window.addEventListener("DOMContentLoaded", async () => {

    console.log("Starting NEXO AI Experience Platform...");

    startClock();

    await loadConfiguration();

    await startCamera();

    monitorCamera();

    startCampaignRotation();

    setTimeout(() => {

        hideLoading();

        showToast(
            "NEXO AI",
            "Experience Platform Ready"
        );

    }, 1200);

});