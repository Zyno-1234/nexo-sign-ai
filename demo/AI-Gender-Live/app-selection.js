document.querySelectorAll(".industry-card").forEach(card => {

    card.addEventListener("click", () => {

        const industry = card.dataset.industry;

        localStorage.setItem("selectedIndustry", industry);

        window.location.href = "tv-demo.html";

    });

});