window.addEventListener('DOMContentLoaded', () => {
    
    const email = document.getElementById('email');
    const fullname = document.getElementById('fullName');
    const password = document.getElementById('password');
    const profileImage = document.getElementById('profileImage');
    const imageUpload = document.getElementById('imageUpload');
    const form = document.getElementById('profileForm');
    const interestButtons = document.querySelectorAll('.interests button');
    
    // Load existing profile data from localStorage
    email.value = localStorage.getItem('userEmail') || '';
    fullname.value = localStorage.getItem('userName') || '';
    password.value = localStorage.getItem('userPassword') || '';
    profileImage.src = localStorage.getItem('profilePic') || 'src/profile.avif'; 

    // Load interests from localStorage
    const stored = localStorage.getItem('userInterests');
    console.log("Stored interests in localStorage:", stored);
    const savedInterests = stored ? JSON.parse(stored) : [];
    console.log("Saved interests:", savedInterests);
    interestButtons.forEach(btn => {
        if (savedInterests.includes(btn.dataset.value)) btn.classList.add('active');
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });


    // Handle profile image upload
    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
                localStorage.setItem('profilePic', e.target.result); // Save image to localStorage
            };
            reader.readAsDataURL(file);
        }
    });

  
    //save
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedInterests = Array.from(interestButtons)
        .filter(b => b.classList.contains('active'))
        .map(b => b.dataset.value);

    const payload = {
        userId: localStorage.getItem('userId'),
        name: fullname.value,
        email: email.value,
        interests: selectedInterests
    };

    // Only include password if the user entered a new one
    if (password.value) {
        payload.newPassword = password.value;
    }

    try {
        const response = await fetch("http://localhost:3000/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        alert(data.message);

        // Update localStorage for instant UI update
        localStorage.setItem('userName', fullname.value);
        localStorage.setItem('userEmail', email.value);
        localStorage.setItem('userInterests', JSON.stringify(selectedInterests));

        // Clear password field after update
        password.value = '';

    } catch (err) {
        console.error(err);
        alert("Failed to update profile");
    }
});
}); 