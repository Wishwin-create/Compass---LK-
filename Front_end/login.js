window.addEventListener("DOMContentLoaded", () => {
    const email = localStorage.getItem("signupEmail");
    const password = localStorage.getItem("signupPassword");
    if (email && password) {
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").value = password;

        //Clear stored data for security
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("signupPassword");  

    }
});

// ================= LOGIN SUBMIT =================
const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(apiUrl("/login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("userName", data.name);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userId", data.userID);
        localStorage.setItem("userInterests", JSON.stringify(data.interests || []));
        localStorage.setItem("profilePic", data.profilePic ? apiUrl(`/uploads/${data.profilePic}`) : "src/profile.avif");
        alert(data.message || "Login successful");
        window.location.href = "Landing_page.html";
    } catch (error) {
        alert("Server error");
        console.error(error);
    }
});
