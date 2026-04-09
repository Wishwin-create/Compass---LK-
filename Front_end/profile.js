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
        profileImage.src = URL.createObjectURL(file); // preview only
    }
});

  
    //save
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedInterests = Array.from(interestButtons)
        .filter(b => b.classList.contains('active'))
        .map(b => b.dataset.value);

    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('name', fullname.value);
    formData.append('email', email.value);
    formData.append('interests', JSON.stringify(selectedInterests));
    

    // Only include password if the user entered a new one
    if (password.value) {
        formData.append('newPassword', password.value);
    }

    if(imageUpload.files[0]) {
        formData.append('profileImage', imageUpload.files[0]);
    }

    try {
        const response = await fetch("http://localhost:3000/update-profile", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        alert(data.message);

        if (data.profilePic) {
            profileImage.src = `http://localhost:3000/uploads/${data.profilePic}`;
            localStorage.setItem('profilePic', profileImage.src);
        }


    } catch (err) {
        console.error(err);
        alert("Failed to update profile");
    }
});
}); 