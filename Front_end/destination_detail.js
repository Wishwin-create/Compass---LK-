const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const userID = localStorage.getItem("userId");

const data = DESTINATIONS[id];
const titleEl = document.getElementById("dest-title");
const aboutEl = document.getElementById("about-text");
const topImg = document.getElementById("top-image");
const galleryDiv = document.getElementById("gallery-container");
const reviewStar = document.getElementById("review-star");
const reviewDiv = document.getElementById("review-container");
const stars = document.querySelectorAll(".star-rating span");
const reviewBox = document.getElementById("review-box");
const submitBtn = document.getElementById("submit-btn");
const itineraryBtn = document.getElementById("addToItineraryBtn");

function renderDestinationDetails() {
    if (!data) {
        titleEl.textContent = "Destination not found";
        aboutEl.textContent = "The selected destination could not be loaded.";
        return;
    }

    titleEl.textContent = data.title;
    aboutEl.textContent = data.about;
    topImg.src = data.topImage;
    topImg.alt = data.title;

    const galleryFragment = document.createDocumentFragment();
    data.gallery.forEach(img => {
        const image = document.createElement("img");
        image.src = img;
        image.className = "gallery-img";
        galleryFragment.appendChild(image);
    });
    galleryDiv.replaceChildren(galleryFragment);

    const reviewStarFragment = document.createDocumentFragment();
    data.reviews.forEach(reviewText => {
        const review = document.createElement("p");
        review.className = "review";
        review.textContent = `* ${reviewText}`;
        reviewStarFragment.appendChild(review);
    });
    reviewStar.replaceChildren(reviewStarFragment);
}

renderDestinationDetails();

let selectedRating = 0;

stars.forEach((star, index) => {
    star.addEventListener("click", () => {
        selectedRating = index + 1;

        stars.forEach((s, i) => {
            s.classList.toggle("active", i < selectedRating);
        });
    });
});

async function loadReviews() {
    if (!id) {
        reviewDiv.textContent = "No destination selected.";
        return;
    }

    const response = await fetch(apiUrl(`/reviews/${id}`));
    if (!response.ok) {
        reviewDiv.textContent = "Unable to load reviews.";
        return;
    }

    const reviews = await response.json();
    reviewDiv.replaceChildren();

    reviews.forEach(r => {
        const review = document.createElement("div");
        review.className = "review";

        const header = document.createElement("p");
        const strong = document.createElement("strong");

        const profileImg = document.createElement("img");
        profileImg.className = "profile-pic";
        profileImg.src = r.userProfilePic || "src/profile.avif";
        profileImg.alt = "Profile";

        strong.appendChild(profileImg);
        strong.appendChild(document.createTextNode(` ${r.userName || "Unknown User"}`));

        header.appendChild(strong);
        header.appendChild(document.createTextNode(` ${"⭐".repeat(r.rating)}`));

        const reviewText = document.createElement("p");
        reviewText.textContent = r.review;

        const hr = document.createElement("hr");
        hr.className = "hr-style";

        review.appendChild(header);
        review.appendChild(reviewText);
        review.appendChild(hr);
        review.appendChild(document.createElement("br"));
        reviewDiv.appendChild(review);
    });
}

submitBtn.addEventListener("click", async () => {
    if (!userID) {
        alert("Please log in to submit a review.");
        window.location.href = "login.html";
        return;
    }

    if (selectedRating === 0) {
        alert("Please select a rating before submitting.");
        return;
    }

    const response = await fetch(apiUrl("/add-review"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rating: selectedRating,
            review: reviewBox.value,
            destination_id: id,
            user_id: userID
        })
    });

    if (!response.ok) {
        alert("Failed to submit review. Please try again.");
        return;
    }

    const responseData = await response.json();
    alert(responseData.message);

    reviewBox.value = "";
    selectedRating = 0;
    stars.forEach(s => s.classList.remove("active"));
    loadReviews();
});

if (id) {
    loadReviews();
}

itineraryBtn.addEventListener("click", () => {
    if (!userID) {
        alert("Please log in to add destination to your itinerary.");
        window.location.href = "login.html";
        return;
    }

    const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    itinerary.push({
        id,
        title: data?.title
    });
    localStorage.setItem("itinerary", JSON.stringify(itinerary));
    window.location.href = "itinerary.html";
});

document.getElementById('viewMap').addEventListener('click', () => {
    window.location.href = `map.html?id=${id}`;
});