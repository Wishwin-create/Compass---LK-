const userCountEl = document.getElementById("userCount");
const reviewCountEl = document.getElementById("reviewCount");
const reviewsListEl = document.getElementById("reviewsList");
const refreshBtn = document.getElementById("refreshBtn");
const adminLink = document.getElementById("adminLink");
const currentUserEmail = localStorage.getItem("userEmail");
const currentUserId = localStorage.getItem("userId");

if (adminLink) {
    adminLink.style.display = typeof isAdminUser === "function" && isAdminUser() ? "inline-block" : "none";
}

if ((typeof isAdminUser === "function" && !isAdminUser()) || currentUserEmail !== "johndoe@gmail.com") {
    window.location.href = "Landing_page.html";
}

function adminHeaders() {
    return { "x-user-id": currentUserId };
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderStars(rating = 0) {
    return "★".repeat(Math.max(0, Number(rating) || 0));
}

function renderRecentReviews(reviews) {
    if (!reviews.length) {
        reviewsListEl.innerHTML = `
            <div class="empty-state">
                <h3>No recent reviews</h3>
                <p>New reviews will appear here for moderation.</p>
            </div>
        `;
        return;
    }

    reviewsListEl.innerHTML = reviews.map(review => `
        <article class="review-card" data-review-id="${review.id}">
            <div class="review-top">
                <div class="review-user">
                    <img class="review-avatar" src="${review.userProfilePic || 'src/profile.avif'}" alt="User profile">
                    <div>
                        <strong>${escapeHtml(review.userName || "Unknown User")}</strong>
                        <div class="review-meta">Review ID: ${escapeHtml(review.id)} | Destination: ${escapeHtml(review.destination_id)}</div>
                    </div>
                </div>
                <div class="review-rating">${renderStars(review.rating)}</div>
            </div>
            <p class="review-text">${escapeHtml(review.review || "")}</p>
            <div class="review-actions">
                <button class="delete-review" type="button" data-delete-id="${review.id}">Delete Suspicious</button>
            </div>
        </article>
    `).join("");
}

async function loadDashboard() {
    reviewsListEl.innerHTML = `<div class="loading">Loading recent reviews...</div>`;

    try {
        const [statsResponse, reviewsResponse] = await Promise.all([
            fetch(apiUrl("/admin/stats"), { headers: adminHeaders() }),
            fetch(apiUrl("/admin/reviews/recent?limit=10"), { headers: adminHeaders() })
        ]);

        if (!statsResponse.ok) {
            throw new Error("Failed to load stats");
        }

        if (!reviewsResponse.ok) {
            throw new Error("Failed to load reviews");
        }

        const stats = await statsResponse.json();
        const reviews = await reviewsResponse.json();

        userCountEl.textContent = Number(stats.userCount || 0).toLocaleString();
        reviewCountEl.textContent = Number(stats.reviewCount || 0).toLocaleString();
        renderRecentReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
        console.error(error);
        reviewsListEl.innerHTML = `
            <div class="error-state">
                <h3>Unable to load dashboard</h3>
                <p>Check that the backend server is running and try again.</p>
            </div>
        `;
    }
}

reviewsListEl.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-id]");
    if (!button) {
        return;
    }

    const reviewId = button.dataset.deleteId;
    const confirmed = window.confirm("Delete this review? This cannot be undone.");
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(apiUrl(`/admin/reviews/${reviewId}`), {
            method: "DELETE",
            headers: adminHeaders()
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete review");
        }

        await loadDashboard();
    } catch (error) {
        alert(error.message);
    }
});

refreshBtn.addEventListener("click", loadDashboard);
window.addEventListener("DOMContentLoaded", loadDashboard);
