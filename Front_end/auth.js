const form = document.getElementById("signupForm");
const messageDiv = document.getElementById("message");

if ("Notification" in window) {
    Notification.requestPermission();
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(apiUrl("/signup"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        const canNotify = Notification.permission === "granted";

        if (!response.ok) {
            alert(data.message || "Signup failed");
            return;
        }

        if (canNotify) {
            new Notification("Compass LK", {
                body: data.message,
                icon: "src/logo.png"
            });
        } else {
            alert(data.message);
        }

        localStorage.setItem("signupEmail", email);
        localStorage.setItem("signupPassword", password);

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        messageDiv.textContent = "Error connecting to server";
        console.error(error);
    }
});
