// -----------------------------------------
// Industry Selection
// Example:
// tv-demo.html?industry=hospital
// tv-demo.html?industry=salon
// -----------------------------------------


const industry =    localStorage.getItem("selectedIndustry") || "hospital";

const MEDIA_PATH = `media/${industry}`;


const MODEL_URL = "./models";

// ================================
// Load Industry Configuration
// ================================

const industry =
    localStorage.getItem("selectedIndustry") || "hospital";

const MEDIA_PATH = `media/${industry}`;

// Media root folder

const DETECTION_INTERVAL = 500;
const MIN_CONFIDENCE = 0.80;

const CAMPAIGN_HOLD_TIME = 3000;
const NO_FACE_TIMEOUT = 10000;

const STABLE_DETECTION_COUNT = 3;


//==============================
// DOM
//==============================

const video = document.getElementById("video");

const genderLabel = document.getElementById("gender");
const ageLabel = document.getElementById("age");
const confidenceLabel = document.getElementById("confidence");

const campaignImage = document.getElementById("campaignImage");
const campaignTitle = document.getElementById("campaignTitle");
const campaignSubtitle = document.getElementById("campaignSubtitle");


//==============================
// Runtime State
//==============================

let currentCampaign = "default";

let lastCampaignChange = 0;

let detectionRunning = false;

let noFaceTimer = null;

let stableCount = 0;

let lastDetectedCampaign = "";


//==============================
// Campaigns
//==============================

// Campaigns loaded dynamically
let campaigns = {};







//==============================
// Load the JSON configuration
//==============================

async function loadCampaignConfig() {

    try {

       const response = await fetch(`config/${industry}.json`);

        if (!response.ok) {
            throw new Error(`Unable to load ${industry}.json`);
        }

        campaigns = await response.json();

        console.log("Campaign Config Loaded");

        console.log(campaigns);

    }
    catch (err) {

        console.error(err);

    }

}

//==============================
// Logger
//==============================

function log(message){

    console.log("[NEXO AI]",message);

}



//==============================
// Load Models
//==============================

async function loadModels(){

    log("Loading TinyFaceDetector...");

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    log("Loading AgeGenderNet...");

    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

    log("AI Models Loaded Successfully");

}



//==============================
// Camera
//==============================

async function startCamera(){

    const stream = await navigator.mediaDevices.getUserMedia({

        video:{
            width:1280,
            height:720,
            facingMode:"user"
        },

        audio:false

    });

    video.srcObject = stream;

    return new Promise(resolve=>{

        video.onloadedmetadata=()=>{

            resolve();

        };

    });

}



//==============================
// Initialize
//==============================

async function initialize() {

    await loadCampaignConfig();

    await loadModels();

    await startCamera();

    video.addEventListener("play", startDetection);

}

initialize();



//==============================
// Start Detection
//==============================

function startDetection(){

    if(detectionRunning) return;

    detectionRunning = true;

    setInterval(detectAudience, DETECTION_INTERVAL);

}



//==============================
// Detect Audience
//==============================

async function detectAudience(){

    try{

        const result = await faceapi
            .detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize:416,
                    scoreThreshold:0.35
                })
            )
            .withAgeAndGender();

        // -------------------------
        // No Face Detected
        // -------------------------

        if(!result){

            genderLabel.innerText = "-";
            ageLabel.innerText = "-";
            confidenceLabel.innerText = "-";

            stableCount = 0;
            lastDetectedCampaign = "";

            if(!noFaceTimer){

                noFaceTimer = setTimeout(()=>{

                    switchCampaign("default");

                },NO_FACE_TIMEOUT);

            }

            return;

        }

        // Face Found

        if(noFaceTimer){

            clearTimeout(noFaceTimer);
            noFaceTimer = null;

        }

        const age = Math.round(result.age);

        const gender = result.gender;

        const confidence = Math.round(result.genderProbability*100);

        genderLabel.innerText =
            gender.charAt(0).toUpperCase()+gender.slice(1);

        ageLabel.innerText = age + " Years";

        confidenceLabel.innerText = confidence + "%";

        // Ignore weak prediction

        if(result.genderProbability < MIN_CONFIDENCE){

            return;

        }

        // -------------------------
        // Decide Campaign
        // -------------------------

        let targetCampaign;

        if(age <= 15){

            targetCampaign = "kids";

        }
        else if(gender === "male"){

            targetCampaign = "male";

        }
        else{

            targetCampaign = "female";

        }

        // -------------------------
        // Stable Detection
        // -------------------------

        if(targetCampaign === lastDetectedCampaign){

            stableCount++;

        }
        else{

            lastDetectedCampaign = targetCampaign;
            stableCount = 1;

        }

        if(stableCount >= STABLE_DETECTION_COUNT){

            switchCampaign(targetCampaign);

        }

    }
    catch(err){

        console.error(err);

    }

}


//==============================
// Campaign Engine
//==============================

function switchCampaign(name){

    const now = Date.now();

    if(currentCampaign === name)
        return;

    if(now - lastCampaignChange < CAMPAIGN_HOLD_TIME)
        return;

    currentCampaign = name;
    lastCampaignChange = now;

  
const campaign = campaigns[name];

if (!campaign)
    return;

campaignImage.src = `${MEDIA_PATH}/${campaign.media[0].file}`;

campaignTitle.textContent = campaign.title;

campaignSubtitle.textContent = campaign.subtitle;

    // Fade Out
    campaignImage.classList.add("fade-out");

    setTimeout(()=>{

        campaignImage.src = `${MEDIA_PATH}/${campaign.media[0].file}`;

        campaignTitle.innerText = campaign.title;
        campaignSubtitle.innerText = campaign.subtitle;

        campaignImage.classList.remove("fade-out");
        campaignImage.classList.add("fade-in");

        setTimeout(()=>{

            campaignImage.classList.remove("fade-in");

        },500);

    },250);

    log("Campaign Changed : " + campaign.title);

}

window.addEventListener("beforeunload",()=>{

    if(video && video.srcObject){

        video.srcObject.getTracks().forEach(track=>track.stop());

    }

});