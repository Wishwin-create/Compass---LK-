const calendarEl = document.getElementById("calendar");
const yearEl = document.getElementById("year");
const events ={
    "01-01": {
        title: "New Year's Day",
        description: "Celebration of the first day of the year.",
        category: "National"
    },
    "01-14": {
        title: "Thai Pongal",
        description: "A harvest festival celebrated by Tamil community in Sri Lanka.",
        category: "Religious"
    },
    "02-04": {
        title: "Independence Day",
        description: "Sri Lanka celebrates independence from British rule in 1948.",
        category: "National"
    },
    "03-11": {
        title: "National Day of Women",
        description: "Celebrating contributions of women in Sri Lanka.",
        category: "National"
    },
    "04-13": {
        title: "Sinhala & Tamil New Year",
        description: "Traditional New Year celebration.",
        category: "Cultural"
    },
    "05-01": {
        title: "May Day",
        description: "International Workers' Day celebrated nationwide.",
        category: "National"
    },
    "05-22": {
        title: "Vesak Poya Day",
        description: "Buddhist festival celebrating the birth, enlightenment and passing of Buddha.",
        category: "Religious"
    },
    "06-07": {
        title: "Poson Poya Day",
        description: "Commemorates the introduction of Buddhism to Sri Lanka.",
        category: "Religious"
    },
    "07-10": {
        title: "Esala Perahera",
        description: "Famous cultural procession held in Kandy.",
        category: "Cultural"
    },
    "08-15": {
        title: "Nikini Poya Day",
        description: "Buddhist observance marking the first Poya of the month.",
        category: "Religious"
    },
    "10-31": {
        title: "Halloween (Minor Observance)",
        description: "Western cultural celebration increasingly observed by youth.",
        category: "Cultural"
    },
    "12-25": {
        title: "Christmas Day",
        description: "Christian celebration of the birth of Jesus Christ.",
        category: "Religious"
    },
    "12-31": {
        title: "New Year's Eve",
        description: "The last day of the year, celebrated with gatherings and countdowns.",
        category: "National"
    }
};



let currentYear = 2025;
let activeFilter ="Cultural";


const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

function renderCalendar(year) {
    calendarEl.innerHTML = "";

    months.forEach((month, index) => {
        const firstDay = new Date(year, index, 1).getDay();
        const daysInMonth = new Date(year, index + 1, 0).getDate();

        const card = document.createElement("div");
        card.className = "month-card";

        card.innerHTML = `
            <div class="month-title">${month}</div>
            <div class="weekdays">
                <div>Sun</div><div>Mon</div><div>Tue</div>
                <div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div class="days"></div>
        `;

        const daysEl = card.querySelector(".days");

        for (let i = 0; i < firstDay; i++) {
            daysEl.innerHTML += `<div class="empty"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const monthDayKey = `${String(index + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    if (events[monthDayKey] && (activeFilter ==="All"|| events[monthDayKey].category===activeFilter)) {
        daysEl.innerHTML += `
            <div class="day event-day" data-date="${monthDayKey}">
                ${d}
            </div>`;
    } else {
        daysEl.innerHTML += `<div class="day">${d}</div>`;
    }
        }

        calendarEl.appendChild(card);
    });
}

function changeYear(step) {
    currentYear += step;
    yearEl.textContent = currentYear;
    renderCalendar(currentYear);
}

renderCalendar(currentYear);


calendarEl.addEventListener("click",function(e) {
    if(e.target.classList.contains("event-day")){
        const date = e.target.dataset.date;
        const event = events[date];

        showModal(event.title, event.description);
    }

});

function showModal(title,description){
    document.getElementById("modalTitle").textContent = title;
    document.getElementById('modalDesc').textContent =description;
    document.getElementById('eventModal').style.display="flex";
}

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("eventModal");
    const closeBtn = document.querySelector(".close");

    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

});

window.onclick = function(e){
    if(e.target.id === "eventModal"){
        document.getElementById("eventModal").style.display="none";
    }
}

const filterPills = document.querySelectorAll(".filter-pill");

filterPills.forEach(pill =>{
    pill.addEventListener("click",function(){

        filterPills.forEach(p =>p.classList.remove("active"));

        this.classList.add("active");

        activeFilter = this.textContent;
        renderCalendar(currentYear);

    });
});

const select= document.getElementById("categorySelect");
select.addEventListener("change",function(){
    activeFilter = this.value;
    filterPills.forEach(p => p.classList.remove("active"));
    renderCalendar(currentYear);
})