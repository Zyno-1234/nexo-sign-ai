// =====================================================
// NEXO AI Experience Platform
// Utility Functions
// =====================================================

export function $(id) {
    return document.getElementById(id);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function fadeIn(element, duration = 400) {

    if (!element) return;

    element.style.opacity = 0;
    element.style.display = "block";

    let start = performance.now();

    function animate(time) {

        let progress = (time - start) / duration;

        if (progress > 1) progress = 1;

        element.style.opacity = progress;

        if (progress < 1)
            requestAnimationFrame(animate);

    }

    requestAnimationFrame(animate);

}

export function fadeOut(element, duration = 400) {

    if (!element) return;

    let start = performance.now();

    function animate(time) {

        let progress = (time - start) / duration;

        if (progress > 1) progress = 1;

        element.style.opacity = 1 - progress;

        if (progress < 1)
            requestAnimationFrame(animate);
        else
            element.style.display = "none";

    }

    requestAnimationFrame(animate);

}