const API_BASE = "http://localhost:3000";
const ADMIN_EMAIL = "johndoe@gmail.com";

function apiUrl(path) {
    if (!path) {
        return API_BASE;
    }

    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function getCurrentUserEmail() {
    return localStorage.getItem("userEmail");
}

function isAdminUser() {
    return getCurrentUserEmail() === ADMIN_EMAIL;
}

function updateAdminLinkVisibility() {
    document.querySelectorAll("#adminLink").forEach(link => {
        link.style.display = isAdminUser() ? "inline-block" : "none";
    });
}

function bindButtonAnimations(selector) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener("click", () => {
            btn.style.transform = "scale(0.95)";
            setTimeout(() => {
                btn.style.transform = "scale(1)";
            }, 150);
        });
    });
}
