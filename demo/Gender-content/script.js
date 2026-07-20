// -------------------------------
// NEXOSIGN AI DEMO
// -------------------------------

const scanOverlay = document.getElementById("scanOverlay");
const dashboard = document.getElementById("dashboard");

const progressBar = document.getElementById("progressBar");
const status = document.getElementById("status");

const audience = document.getElementById("audience");
const gender = document.getElementById("gender");
const age = document.getElementById("age");
const campaignName = document.getElementById("campaignName");

const defaultCampaign = document.getElementById("defaultCampaign");
const menCampaign = document.getElementById("menCampaign");
const womenCampaign = document.getElementById("womenCampaign");
const kidsCampaign = document.getElementById("kidsCampaign");

function hideAll() {

    defaultCampaign.classList.remove("show");
    menCampaign.classList.remove("show");
    womenCampaign.classList.remove("show");
    kidsCampaign.classList.remove("show");

}

function showDefault() {

    hideAll();

    defaultCampaign.classList.add("show");

    audience.innerHTML = "No Audience";
    gender.innerHTML = "-";
    age.innerHTML = "-";
    campaignName.innerHTML = "Welcome Screen";

}

function showMen() {

    hideAll();

    menCampaign.classList.add("show");

    audience.innerHTML = "1 Person";
    gender.innerHTML = "Male";
    age.innerHTML = "Adult";
    campaignName.innerHTML = "Executive Men's Health";

    speak("Welcome. Executive Men's Health Check is recommended.");

}

function showWomen() {

    hideAll();

    womenCampaign.classList.add("show");

    audience.innerHTML = "1 Person";
    gender.innerHTML = "Female";
    age.innerHTML = "Adult";
    campaignName.innerHTML = "Women's Wellness";

    speak("Welcome. Women's Wellness Package is available today.");

}

function showKids() {

    hideAll();

    kidsCampaign.classList.add("show");

    audience.innerHTML = "Family";
    gender.innerHTML = "Child";
    age.innerHTML = "Kids";
    campaignName.innerHTML = "Kids Health Camp";

    speak("Welcome. Kids Health Camp is now available.");

}

function speak(text){

    window.speechSynthesis.cancel();

    const msg=new SpeechSynthesisUtterance(text);

    msg.rate=1;

    msg.pitch=1;

    speechSynthesis.speak(msg);

}

// ------------------
// Startup Animation
// ------------------

let progress=0;

const loader=setInterval(()=>{

    progress+=5;

    progressBar.style.width=progress+"%";

    if(progress<25){

        status.innerHTML="Loading AI Engine...";

    }

    else if(progress<50){

        status.innerHTML="Connecting Camera...";

    }

    else if(progress<75){

        status.innerHTML="Preparing Audience Intelligence...";

    }

    else{

        status.innerHTML="AI Ready";

    }

    if(progress>=100){

        clearInterval(loader);

        setTimeout(()=>{

            scanOverlay.style.display="none";

            dashboard.style.opacity=1;

            showDefault();

        },700);

    }

},120);

// ----------------------
// Demo Controls
// ----------------------

document.addEventListener("keydown",(e)=>{

    if(e.key==="m" || e.key==="M"){

        showMen();

    }

    if(e.key==="f" || e.key==="F"){

        showWomen();

    }

    if(e.key==="k" || e.key==="K"){

        showKids();

    }

    if(e.key==="d" || e.key==="D"){

        showDefault();

    }

});

// Auto demo every 8 seconds

let step=0;

setInterval(()=>{

    step++;

    switch(step){

        case 1:
            showMen();
            break;

        case 2:
            showWomen();
            break;

        case 3:
            showKids();
            break;

        default:
            showDefault();
            step=0;

    }

},8000);