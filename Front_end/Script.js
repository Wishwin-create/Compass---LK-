// Button animation
document.querySelectorAll('.btn, .cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => (btn.style.transform = 'scale(1)'), 150);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const signInBtn = document.querySelector('.sign-in');
    const signUpBtn = document.querySelector('.get-started');
    const myItinerary = document.getElementById('myItinerary');
    

    if (userName) {
        // Hide Sign In / Sign Up
        if (signInBtn) signInBtn.style.display = 'none';
        if (signUpBtn) signUpBtn.style.display = 'none';

        // Show My Itinerary
        if (myItinerary) myItinerary.style.display = 'inline-block';

        //Create Profile Section
        const headerDiv = signInBtn.parentElement;

        //Create Profile Container
        const profileContainer = document.createElement('div');
        profileContainer.style.display = 'inline-flex';
        profileContainer.style.alignItems = 'center';
        profileContainer.style.marginLeft = '15px';
        profileContainer.style.gap = '8px';
        profileContainer.style.cursor = 'pointer';
        

        //Profile Image
        const profileImg = document.createElement('img');
        profileImg.src = localStorage.getItem('profilePic') || 'src/profile.avif';
        profileImg.style.width = '35px';
        profileImg.style.height = '35px';
        profileImg.style.borderRadius = '50%';
        profileImg.style.objectFit = 'cover';
        

    

        //Click to go to profile
        profileContainer.onclick = () => {
            window.location.href = 'profile.html';
        };

        profileContainer.appendChild(profileImg);
        



        // Create Sign Out button
        const signOutBtn = document.createElement('button');
        signOutBtn.textContent = 'Sign Out';
        signOutBtn.className = 'btn sign-out';
        signOutBtn.style.backgroundColor = '#ffffffff';
        signOutBtn.style.marginLeft = '10px';
        signOutBtn.onclick = () => {
                localStorage.clear();

            if (signInBtn) signInBtn.style.display = 'inline-block';
            if (signUpBtn) signUpBtn.style.display = 'inline-block';
            if (myItinerary) myItinerary.style.display = 'none';

            signOutBtn.remove();
            window.location.href = 'Landing_page.html';
        };

        // Append Sign Out
        signInBtn.parentElement.appendChild(profileContainer);
        signInBtn.parentElement.appendChild(signOutBtn);
    }
});
