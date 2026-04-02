// Simple button animation
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => (btn.style.transform = 'scale(1)'), 150);
        });
    });

document.querySelectorAll('.cta-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => (btn.style.transform = 'scale(1)'), 150);
        });
    });


// FILTER BY PROVINCE
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".card");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelector(".filter-btn.active").classList.remove("active");
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        cards.forEach(card => {
            if (filter === "all" || card.dataset.province === filter) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// SEARCH DESTINATIONS
document.getElementById("searchInput").addEventListener("input", function () {
    const value = this.value.toLowerCase();

    cards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = title.includes(value) ? "block" : "none";
    });
});

//Open Destination
function openDestination(id) {
    window.location.href = `destination_detail.html?id=${id}`;
}