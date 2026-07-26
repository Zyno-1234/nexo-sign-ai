// ======================================================
// NEXO AI Experience Platform
// demo-v2.js
// Version: 2.1
// ======================================================

// ===========================================
// AI Detection Configuration
// ===========================================

const MODEL_URL = "./models";

const MIN_CONFIDENCE = 0.65;
const DETECTION_INTERVAL = 150;
const STABLE_DETECTION_COUNT = 2;
const CAMPAIGN_HOLD_TIME = 1000;
const NO_FACE_TIMEOUT = 1000;

let currentCampaign = "default";
let lastCampaignChange = 0;
let detectionRunning = false;

let stableCount = 0;
let lastDetectedCampaign = "";

let noFaceTimer = null;

async function loadModels(){

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

    console.log("AI Models Loaded");

}


// ======================================================
// AI Detection Engine
// ======================================================

async function startDetection() {

    if (detectionRunning)
        return;

    detectionRunning = true;

    console.log("AI Detection Started");

    setInterval(async () => {

        if (!App.cameraReady)
            return;

        if (!UI.camera)
            return;

        const result = await faceapi
            .detectSingleFace(
                UI.camera,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.25
                })
            )
            .withAgeAndGender();

        // -----------------------------------
        // No Face
        // -----------------------------------

        if (!result) {

            stableCount = 0;
            lastDetectedCampaign = "";

            if (!noFaceTimer) {

                noFaceTimer = setTimeout(() => {

                    currentCampaign = "default";
                    App.currentAudience = "default";

                    resetExperience();

                    noFaceTimer = null;

                }, NO_FACE_TIMEOUT);

            }

            return;

        }

        if (noFaceTimer) {

            clearTimeout(noFaceTimer);
            noFaceTimer = null;

        }

        // -----------------------------------
        // Confidence Check
        // -----------------------------------

        if (
            result.genderProbability &&
            result.genderProbability < MIN_CONFIDENCE
        )
            return;

        // -----------------------------------
        // Decide Audience
        // -----------------------------------

        let detected = "default";

        if (result.age <= 15)
            detected = "kids";

        else if (result.gender === "male")
            detected = "male";

        else
            detected = "female";

        // -----------------------------------
        // Stable Detection
        // -----------------------------------

        if (lastDetectedCampaign === detected)
            stableCount++;
        else {

            stableCount = 1;
            lastDetectedCampaign = detected;

        }

        if (stableCount < STABLE_DETECTION_COUNT)
            return;

        // -----------------------------------
        // Hold Campaign
        // -----------------------------------

        const now = Date.now();

        if (
            currentCampaign === detected &&
            now - lastCampaignChange < CAMPAIGN_HOLD_TIME
        )
            return;

        currentCampaign = detected;
        lastCampaignChange = now;

        onAudienceDetected({

            gender: detected,
            age: Math.round(result.age),
            confidence: Math.round(
                (result.genderProbability || 0) * 100
            )

        });

    }, DETECTION_INTERVAL);

}

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

        const response =
            await fetch(`config/${App.industry}.json`);

        if (!response.ok)
            throw new Error("Configuration file not found");

        App.config = await response.json();

        App.campaigns = App.config;

        updateCampaign("default");

        console.log("Configuration Loaded");

    }
    catch (error) {

        console.error(error);

        showToast(
            "Configuration",
            "Unable to load industry configuration."
        );

    }

}


// ======================================================
// Campaign Renderer
// ======================================================

// ======================================================
// Campaign Renderer
// ======================================================

function updateCampaign(audience = "default") {

    const campaign = App.campaigns[audience];

    if (!campaign) {
        console.warn("Campaign not found:", audience);
        return;
    }

    App.currentCampaign = audience;

    if (UI.campaignTitle)
        UI.campaignTitle.textContent = campaign.title || "";

    if (UI.campaignSubtitle)
        UI.campaignSubtitle.textContent = campaign.subtitle || "";

    if (UI.heroCTA)
        UI.heroCTA.textContent = "Learn More";

    if (UI.ctaTitle)
        UI.ctaTitle.textContent = "Learn More";

    // Hero Image

    if (
        UI.heroImage &&
        campaign.media &&
        campaign.media.length
    ) {

        UI.heroImage.src =
            `media/${App.industry}/${campaign.media[0].file}`;

    }

    // QR

    if (UI.qrImage)
        UI.qrImage.src = "assets/qr.png";

    // Recommendations

    if (UI.recommendationList)
        UI.recommendationList.innerHTML = "";

}


// ======================================================
// AI Experience Engine
// ======================================================

function onAudienceDetected(data) {

    console.log(data);

   App.currentAudience = data.gender;

if (App.debug) {

    console.log(
        "Audience:",
        data.gender,
        "Age:",
        data.age,
        "Confidence:",
        data.confidence + "%"
    );

}



    let audience = "default";

    switch (data.gender) {

        case "male":
            audience = "male";
            break;

        case "female":
            audience = "female";
            break;

        case "child":
        case "kids":
            audience = "kids";
            break;

        default:
            audience = "default";

    }

    if (App.currentCampaign === audience)
        return;

    showPersonalization("Preparing your personalized experience...");

    setTimeout(() => {

        updateCampaign(audience);

        if (UI.experienceTitle)
            UI.experienceTitle.textContent =
                "Personalization Active";

        if (UI.experienceMessage)
            UI.experienceMessage.textContent =
                "AI selected the best experience.";

        hidePersonalization();

    }, 700);

}

// ======================================================
// Campaign Rotation
// ======================================================

function startCampaignRotation() {

    clearInterval(App.rotationTimer);

    App.rotationTimer = setInterval(() => {

        if (App.currentAudience !== "default")
            return;

        updateCampaign("default");

    }, 10000);

}

// ======================================================
// Reset Experience
// ======================================================
function resetExperience() {

    App.currentAudience = "default";

    currentCampaign = "default";
    stableCount = 0;
    lastDetectedCampaign = "";

    updateCampaign("default");

    if (UI.experienceTitle)
        UI.experienceTitle.textContent = "AI Ready";

    if (UI.experienceMessage)
        UI.experienceMessage.textContent =
            "Waiting for audience...";

}
// Example integration




// ======================================================
// Application Startup
// ======================================================
// ======================================================
// Application Startup
// ======================================================

window.addEventListener("DOMContentLoaded", async () => {

    console.log("Starting NEXO AI Experience Platform...");

    startClock();

    await loadConfiguration();

    await loadModels();

    await startCamera();

    monitorCamera();

    startDetection();

    startCampaignRotation();

    App.aiReady = true;

    setTimeout(() => {

        hideLoading();

        showToast(
            "NEXO AI",
            "Experience Platform Ready"
        );

    }, 1200);

});