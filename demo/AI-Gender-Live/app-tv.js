/**********************************************************************
 * NEXO AI Audience Detection
 * Part 1 - Initialization
 **********************************************************************/

//==============================
// Configuration
//==============================

const MODEL_URL = "./models";

const DETECTION_INTERVAL = 300;
const MIN_CONFIDENCE = 0.80;
const CAMPAIGN_HOLD_TIME = 3000;

//==============================
// DOM
//==============================

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");

const loader = document.getElementById("loader");
const statusBox = document.getElementById("status");

const genderLabel = document.getElementById("gender");
const ageLabel = document.getElementById("age");
const confidenceLabel = document.getElementById("confidence");

const viewerCount = document.getElementById("viewerCount");
const maleCount = document.getElementById("maleCount");
const femaleCount = document.getElementById("femaleCount");
const averageAge = document.getElementById("averageAge");

const campaignName = document.getElementById("campaignName");
const campaignImage = document.getElementById("campaignImage");
const campaignTitle = document.getElementById("campaignTitle");
const campaignSubtitle = document.getElementById("campaignSubtitle");

const logs = document.getElementById("logs");

//==============================
// Runtime State
//==============================

let displaySize;

let totalMale = 0;
let totalFemale = 0;

let currentCampaign = "default";

let lastCampaignChange = 0;

let detectionRunning = false;

//==============================
// Campaigns
//==============================

const campaigns = {

    default: {
        image: "assets/default.png",
        title: "Welcome",
        subtitle: "AI Powered Digital Signage"
    },

    male: {
        image: "assets/male.png",
        title: "Men's Collection",
        subtitle: "Exclusive Offers"
    },

    female: {
        image: "assets/female.png",
        title: "Women's Collection",
        subtitle: "Latest Arrivals"
    }

};

//==============================
// Logger
//==============================

function log(message){

 console.log(message);

    if(!logs) return;

    const time = new Date().toLocaleTimeString();

    logs.innerHTML =
        "[" + time + "] " +
        message +
        "<br>" +
        logs.innerHTML;

}

//==============================
// Status
//==============================

function setStatus(text,color){


    if(!statusBox) return;

    statusBox.innerText=text;
    statusBox.style.background=color;

}

//==============================
// Load Models
//==============================

async function loadModels(){

  setStatus("Loading AI Models","#ea580c");

    log("Loading TinyFaceDetector...");
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    log("Loading AgeGenderNet...");
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

    setStatus("AI Ready","#16a34a");

    if(loader)
    loader.style.display="none";

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
// Start Application
//==============================

async function initialize(){

    try{

        await loadModels();

        await startCamera();

        video.addEventListener("play",startDetection);

    }
    catch(err){

        console.error(err);

        setStatus("ERROR","#dc2626");

        log(err.message);

    }

}

initialize();


//==============================
// Start Detection
//==============================

function startDetection(){

    displaySize={
        width:video.videoWidth,
        height:video.videoHeight
    };

if(canvas){

    canvas.width=displaySize.width;
    canvas.height=displaySize.height;

    faceapi.matchDimensions(canvas,displaySize);

}

    if(detectionRunning) return;

    detectionRunning=true;

    setInterval(detectAudience,DETECTION_INTERVAL);

}

//==============================
// Detect Audience
//==============================

async function detectAudience(){

    try{

        const detections = await faceapi
            .detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: 0.35
                })
            )
            .withAgeAndGender();

        const resized = faceapi.resizeResults(detections, displaySize);

  let ctx = null;

if(canvas){

    ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);

}

       if(viewerCount)
    viewerCount.innerText = resized.length;


        if(resized.length===0){

            showDefaultCampaign();

            genderLabel.innerText="-";
            ageLabel.innerText="-";
            confidenceLabel.innerText="-";

            return;
        }

        let ageTotal = 0;

        resized.forEach(face=>{

            const box = face.detection.box;
            const gender = face.gender;
            const age = Math.round(face.age);
            const score = Math.round(face.genderProbability*100);

            ageTotal += age;

            if(ctx)
    drawFace(ctx,box,gender,age,score);

            updateDashboard(gender,age,score);

        });

        averageAge.innerText = Math.round(ageTotal/resized.length);

    }
    catch(err){

        console.error("Detection Error:", err);
        log(err.message);

    }

}





//==============================
// Draw Face
//==============================

function drawFace(ctx,box,gender,age,score){

    ctx.strokeStyle=
        gender==="male"
        ? "#00ff88"
        : "#ff44aa";

    ctx.lineWidth=3;

    ctx.strokeRect(
        box.x,
        box.y,
        box.width,
        box.height
    );

    ctx.fillStyle=
        gender==="male"
        ? "#00ff88"
        : "#ff44aa";

    ctx.font="18px Arial";

    ctx.fillText(

        gender.toUpperCase()+
        " | "+
        age+
        " yrs | "+
        score+
        "%",

        box.x,

        box.y-10

    );

}


//==============================
// Dashboard
//==============================

function updateDashboard(gender, age, score){

    if(genderLabel)
        genderLabel.innerText =
            gender.charAt(0).toUpperCase()+gender.slice(1);

    if(ageLabel)
        ageLabel.innerText = age+" Years";

    if(confidenceLabel)
        confidenceLabel.innerText = score+"%";

    if(gender==="male")
        totalMale++;
    else
        totalFemale++;

    if(maleCount)
        maleCount.innerText=totalMale;

    if(femaleCount)
        femaleCount.innerText=totalFemale;

    switchCampaign(gender);

}


//==============================
// Campaign Engine
//==============================

function switchCampaign(gender){

    const now=Date.now();

    if(currentCampaign===gender) return;

    if(now-lastCampaignChange<CAMPAIGN_HOLD_TIME) return;

    currentCampaign=gender;
    lastCampaignChange=now;

    const campaign=campaigns[gender];

    if(campaignImage)
        campaignImage.src=campaign.image;

    if(campaignTitle)
        campaignTitle.innerText=campaign.title;

    if(campaignSubtitle)
        campaignSubtitle.innerText=campaign.subtitle;

    if(campaignName)
        campaignName.innerText=campaign.title;

    log("Campaign Changed : "+campaign.title);

}


function showDefaultCampaign(){

    if(currentCampaign==="default")
        return;

    currentCampaign="default";

    if(campaignImage)
        campaignImage.src=campaigns.default.image;

    if(campaignTitle)
        campaignTitle.innerText=campaigns.default.title;

    if(campaignSubtitle)
        campaignSubtitle.innerText=campaigns.default.subtitle;

    if(campaignName)
        campaignName.innerText=campaigns.default.title;

}


window.addEventListener("beforeunload",()=>{

    if(video.srcObject){

        video.srcObject
        .getTracks()
        .forEach(track=>track.stop());

    }

});
