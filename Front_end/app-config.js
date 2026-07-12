const API_BASE = "http://localhost:3000";

function apiUrl(path) {
    if (!path) {
        return API_BASE;
    }

    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
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
