if (typeof bindButtonAnimations === "function") {
    bindButtonAnimations(".btn, .cta-btn");
}


// FILTER BY PROVINCE
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".card");
const searchInput = document.getElementById("searchInput");
let activeProvince = "all";
let searchTerm = "";

function applyFilters() {
    const term = searchTerm.trim().toLowerCase();

    cards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const province = card.dataset.province;
        const matchesProvince = activeProvince === "all" || province === activeProvince;
        const matchesSearch = !term || title.includes(term);

        card.hidden = !(matchesProvince && matchesSearch);
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".filter-btn.active")?.classList.remove("active");
        btn.classList.add("active");
        activeProvince = btn.dataset.filter;
        applyFilters();
    });
});

// SEARCH DESTINATIONS
searchInput?.addEventListener("input", function () {
    searchTerm = this.value;
    applyFilters();
});

applyFilters();

//Open Destination
function openDestination(id) {
    window.location.href = `destination_detail.html?id=${id}`;
}
