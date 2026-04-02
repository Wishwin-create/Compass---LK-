// Get ?id=name from URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const userID = localStorage.getItem("userId");
console.log("Logged in userID:", userID);

// Get destination data
const data = DESTINATIONS[id];

// Insert data into page
document.getElementById("dest-title").textContent = data.title;
document.getElementById("about-text").textContent = data.about;

//Top Image
const topImg = document.getElementById("top-image");
topImg.src = data.topImage;
topImg.alt = data.title;

// Gallery
const galleryDiv = document.getElementById("gallery-container");
data.gallery.forEach(img => {
    galleryDiv.innerHTML += `<img src="${img}" class="gallery-img">`;
});

// Reviews
const review_star= document.getElementById("review-star");
data.reviews.forEach(r => {
    review_star.innerHTML += `<p class="review">📌 ${r}</p>`;
});


const stars= document.querySelectorAll('.star-rating span');
const reviewBox = document.getElementById('review-box');
const submitBtn = document.getElementById('submit-btn');

let selectedRating = 0;

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        selectedRating = index + 1;
        
        stars.forEach((s, i) => {
            s.classList.toggle('active', i < selectedRating);
    });
    });
});


submitBtn.addEventListener('click',async () => {
    if(!userID){
        alert("Please log in to submit a review.");
        window.location.href = "login.html";
        return;
    }
    if(selectedRating === 0) {
        alert("Please select a rating before submitting.");
        return;
    }   

    const reviewText = reviewBox.value;

    const response = await fetch ("http://localhost:3000/add-review",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
    },    body: JSON.stringify({
        rating : selectedRating,
        review : reviewText,
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
    stars.forEach(s => s.classList.remove('active'));

    loadReviews();  
});


//Display reviews on page load

const reviewDiv = document.getElementById("review-container");

async function loadReviews() {
    const response = await fetch(`http://localhost:3000/reviews/${id}`);
    const reviews = await response.json();

    reviewDiv.innerHTML = "";

    reviews.forEach(r => {
        reviewDiv.innerHTML += `
            <div class="review">
                <p><strong>${r.userName || "Unknown User"}</strong> ${"⭐".repeat(r.rating)}</p>
                <p>${r.review}</p>
                <hr class="hr-style">
                <br>
            </div>
        `;
    });
}
loadReviews();


const iteraryBtn = document.getElementById("addToItineraryBtn");
iteraryBtn.addEventListener("click", () => {
    if(!userID){
        alert("Please log in to add destination to your itinerary.");
        window.location.href = "login.html";
        return;
    }

    let itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];

    itinerary.push({
        id: id,
        title: data.title,
    });
    localStorage.setItem("itinerary", JSON.stringify(itinerary));

    window.location.href = "itinerary.html";
});
