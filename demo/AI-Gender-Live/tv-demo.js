/*********************************************************************
 * NEXO AI TV Demo
 * Version 1.0
 *********************************************************************/

//==============================
// DOM
//==============================

const video = document.getElementById("video");

const gender = document.getElementById("gender");
const age = document.getElementById("age");
const confidence = document.getElementById("confidence");

const clock = document.getElementById("clock");


//==============================
// Clock
//==============================

function updateClock(){

    const now = new Date();

    clock.innerText = now.toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit'
    });

}

setInterval(updateClock,1000);

updateClock();


//==============================
// Camera
//==============================

async function startCamera(){

    try{

        const stream = await navigator.mediaDevices.getUserMedia({

            video:{
                width:1280,
                height:720,
                facingMode:"user"
            },

            audio:false

        });

        video.srcObject = stream;

    }
    catch(err){

        console.error(err);

        alert("Unable to access camera.");

    }

}


//==============================
// Demo Values
//==============================

gender.innerHTML="Waiting...";
age.innerHTML="--";
confidence.innerHTML="--";


//==============================
// Start
//==============================

startCamera();