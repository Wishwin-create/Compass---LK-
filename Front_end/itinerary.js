// Get itinerary from localStorage (from destination_detail.html)
let selectedDestination = JSON.parse(localStorage.getItem("itinerary"))?.pop() || null;

// Elements
const planModal = document.getElementById("planModal");
const closeModal = planModal.querySelector(".close");
const modalTitle = document.getElementById("modal-destination-title");
const savePlanBtn = document.getElementById("savePlanBtn");
const destinationList = document.getElementById("destinationList");
const viewModal = document.getElementById("viewModal");

const planDateInput = document.getElementById("plan-date");
const planTimeInput = document.getElementById("plan-time");
const planActivityInput = document.getElementById("plan-activity");
const planDurationInput = document.getElementById("plan-duration");
const planTransportInput = document.getElementById("plan-transport");
const planNotesInput = document.getElementById("plan-notes");

function createDefaultPlan(plan = {}) {
    return {
        date: plan.date || "No date set",
        time: plan.time || "No time set",
        activity: plan.activity || "No activity",
        duration: plan.duration || "No duration set",
        transport: plan.transport || "No transport set",
        notes: plan.notes || "No notes"
    };
}

function getItineraryList() {
    return JSON.parse(localStorage.getItem("myItinerary")) || [];
}

function saveItineraryList(itineraryList) {
    localStorage.setItem("myItinerary", JSON.stringify(itineraryList));
}

function resetPlanForm() {
    planDateInput.value = "";
    planTimeInput.value = "";
    planActivityInput.value = "";
    planDurationInput.value = "";
    planTransportInput.value = "Car";
    planNotesInput.value = "";
    planModal.removeAttribute("data-edit-index");
}

function populatePlanForm(dest, index) {
    const plan = createDefaultPlan(dest.plan);

    selectedDestination = dest;
    planDateInput.value = plan.date !== "No date set" ? plan.date : "";
    planTimeInput.value = plan.time !== "No time set" ? plan.time : "";
    planActivityInput.value = plan.activity !== "No activity" ? plan.activity : "";
    planDurationInput.value = plan.duration !== "No duration set" ? plan.duration : "";
    planTransportInput.value = plan.transport !== "No transport set" ? plan.transport : "Car";
    planNotesInput.value = plan.notes !== "No notes" ? plan.notes : "";

    modalTitle.textContent = `Edit: ${dest.title}`;
    planModal.setAttribute("data-edit-index", index);
    planModal.classList.add("show");
}

function refreshDestinations() {
    const itineraryList = getItineraryList();
    destinationList.innerHTML = "";

    itineraryList.forEach((dest, index) => addDestinationThumbnail(dest, index));

    if (itineraryList.length === 0) {
        destinationList.innerHTML = `
            <div class="empty">
                <h3>No destinations yet</h3>
                <p>Start building your itinerary by adding destinations to your trip</p>
                <button class="btn destination-btn" onclick="window.location.href='destination.html'">Select your Destination First</button>
            </div>
        `;
    }
}

function openViewModal(dest, index) {
    const plan = createDefaultPlan(dest.plan);

    document.getElementById("view-title").textContent = dest.title;
    document.getElementById("view-date").textContent = plan.date;
    document.getElementById("view-time").textContent = plan.time;
    document.getElementById("view-activity").textContent = plan.activity;
    document.getElementById("view-duration").textContent = plan.duration;
    document.getElementById("view-transport").textContent = plan.transport;
    document.getElementById("view-notes").textContent = plan.notes;

    let actions = viewModal.querySelector(".view-actions");
    if (!actions) {
        actions = document.createElement("div");
        actions.className = "view-actions";
        actions.innerHTML = `
            <button type="button" class="edit-btn">Edit</button>
            <button type="button" class="delete-btn">Delete</button>
        `;
        viewModal.querySelector(".modal-content").appendChild(actions);
    }

    const viewCloseBtn = viewModal.querySelector(".close");
    const editBtn = actions.querySelector(".edit-btn");
    const deleteBtn = actions.querySelector(".delete-btn");

    viewCloseBtn.onclick = () => {
        viewModal.classList.remove("show");
    };

    editBtn.onclick = (e) => {
        e.stopPropagation();
        populatePlanForm(dest, index);
        viewModal.classList.remove("show");
    };

    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        const itineraryList = getItineraryList();

        if (!confirm("Are you sure you want to delete this destination?")) return;

        itineraryList.splice(index, 1);
        saveItineraryList(itineraryList);
        refreshDestinations();
        viewModal.classList.remove("show");
    };

    viewModal.classList.add("show");
}

// Show modal if user comes from Add to Itinerary
if (selectedDestination) {
    modalTitle.textContent = selectedDestination.title;
    planModal.classList.add("show");
    localStorage.removeItem("itinerary");
}

// Close modal
closeModal.onclick = () => {
    planModal.classList.remove("show");
    resetPlanForm();
    selectedDestination = null;
};

// Save Plan
savePlanBtn.addEventListener("click", () => {
    if (!selectedDestination) return;

    const updatedPlan = createDefaultPlan({
        date: planDateInput.value,
        time: planTimeInput.value,
        activity: planActivityInput.value.trim(),
        duration: planDurationInput.value.trim(),
        transport: planTransportInput.value,
        notes: planNotesInput.value.trim()
    });

    const itineraryList = getItineraryList();
    const editIndex = planModal.getAttribute("data-edit-index");

    if (editIndex !== null) {
        itineraryList[Number(editIndex)] = {
            ...itineraryList[Number(editIndex)],
            plan: updatedPlan
        };
    } else {
        selectedDestination.plan = updatedPlan;
        itineraryList.push(selectedDestination);
    }

    saveItineraryList(itineraryList);
    refreshDestinations();
    resetPlanForm();
    planModal.classList.remove("show");
    selectedDestination = null;
});

// Add destination thumbnail
function addDestinationThumbnail(dest, index) {
    const plan = createDefaultPlan(dest.plan);
    const card = document.createElement("div");

    card.classList.add("destination-card");
    card.innerHTML = `
        <h3>${dest.title}</h3>
        <p><strong>Activity:</strong> ${plan.activity}</p>
        <p><strong>Date:</strong> ${plan.date}</p>
        <p><strong>Time:</strong> ${plan.time}</p>
        
    `;

    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    if (editBtn) {
        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            populatePlanForm(dest, index);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const itineraryList = getItineraryList();

            if (!confirm("Are you sure you want to delete this destination?")) return;

            itineraryList.splice(index, 1);
            saveItineraryList(itineraryList);
            refreshDestinations();
        });
    }

    card.addEventListener("click", () => {
        openViewModal(dest, index);
    });

    destinationList.appendChild(card);
}

// Load existing itinerary on page load
window.addEventListener("DOMContentLoaded", () => {
    refreshDestinations();
});

// Manual Add Destination
document.getElementById("addDestination")?.addEventListener("click", () => {
    const name = document.getElementById("destinationName").value.trim();
    const time = document.getElementById("visitTime").value;
    const note = document.getElementById("destinationNote").value.trim();

    if (!name) {
        alert("Please enter a destination name");
        return;
    }

    const dest = {
        title: name,
        plan: createDefaultPlan({
            time,
            transport: "No transport set",
            notes: note
        })
    };

    const itineraryList = getItineraryList();
    itineraryList.push(dest);
    saveItineraryList(itineraryList);
    refreshDestinations();

    document.getElementById("destinationName").value = "";
    document.getElementById("visitTime").value = "";
    document.getElementById("destinationNote").value = "";
});
