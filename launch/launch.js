// ======================================
// NEXO AI Launch Experience
// Version 1.0
// ======================================

const hero = document.getElementById("hero");
const boot = document.getElementById("bootScreen");
const industries = document.getElementById("industries");

const btn = document.getElementById("experienceBtn");

const progress = document.getElementById("progressBar");

const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");
const line3 = document.getElementById("line3");
const line4 = document.getElementById("line4");
const line5 = document.getElementById("line5");

btn.addEventListener("click", startExperience);

// ======================================

function startExperience() {

    hero.style.display = "none";

    boot.style.display = "flex";

    bootSequence();

}

// ======================================

function bootSequence() {

    progress.style.width = "15%";

    setTimeout(() => {

        line1.innerHTML = "✓ Loading Vision Engine";

        progress.style.width = "35%";

    }, 600);

    setTimeout(() => {

        line2.innerHTML = "✓ Initializing Face Detection";

        progress.style.width = "55%";

    }, 1200);

    setTimeout(() => {

        line3.innerHTML = "✓ Loading Audience Intelligence";

        progress.style.width = "75%";

    }, 1800);

    setTimeout(() => {

        line4.innerHTML = "✓ Loading Campaign Engine";

        progress.style.width = "90%";

    }, 2400);

    setTimeout(() => {

        line5.innerHTML = "✓ SYSTEM READY";

        progress.style.width = "100%";

    }, 3000);

    setTimeout(() => {

        boot.style.display = "none";

        industries.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }, 3800);

}

// ======================================

function launchIndustry(industry) {

    localStorage.setItem("selectedIndustry", industry);

    document.body.style.opacity = "0";

    setTimeout(() => {

        window.location.href = "../demo/AI-Gender-Live/tv-demo.html";

    }, 500);

}

// ======================================
// Fade In
// ======================================

window.onload = () => {

    document.body.style.opacity = "0";

    document.body.style.transition = "opacity .8s";

    setTimeout(() => {

        document.body.style.opacity = "1";

    }, 200);

}