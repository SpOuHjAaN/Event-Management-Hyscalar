document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm'); // Ensure this ID matches your registration form
    const navbar = document.getElementById('navbar'); // Navbar element

    // Check if the token is already in localStorage
    const token = localStorage.getItem('token');
    
    // Update the navbar based on login state
    updateNavbar(token);

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Capture input values
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            if (username && email && password) {
                try {
                    // Make a POST request to the backend for registration
                    const response = await fetch('http://localhost:3000/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Successful registration
                        alert('Registration successful!');

                        // Redirect to login page or event list
                        window.location.href = 'event_list.html'; // Change this if you want to redirect to another page
                    } else {
                        // Handle registration error
                        alert(data.message || 'Registration failed. Please try again.');
                    }
                } catch (error) {
                    console.error('Registration error:', error);
                    alert('An error occurred while trying to register.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Google Sign-In logic
    window.onGoogleSignIn = async function (googleUser) {
        const id_token = googleUser.credential; // Updated: Use googleUser.credential instead of getAuthResponse()

        try {
            const response = await fetch('http://localhost:3000/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: id_token })
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully logged in with Google
                alert('Google login successful!');
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);

                // Redirect user based on login type
                if (data.isAdmin) {
                    window.location.href = 'dashboard.html'; // Admin page
                } else {
                    window.location.href = 'event_list.html'; // User's event list
                }
            } else {
                alert(data.message || 'Google login failed.');
            }
        } catch (error) {
            console.error('Google login error:', error);
            alert('An error occurred during Google login.');
        }
    };

    // Google Sign-In button configuration
    gapi.load('client:auth2', function () {
        gapi.auth2.init({
            client_id: '354207534043-5ph7nrt5j2i19587o7iikv6jo7mak9pg.apps.googleusercontent.com' // Replace with your Google client ID
        }).then(() => {
            const googleSignInButton = document.getElementById('google-signin');
            const auth2 = gapi.auth2.getAuthInstance();

            auth2.attachClickHandler(googleSignInButton, {}, onGoogleSignIn, (error) => {
                alert('Google sign-in failed: ' + error.error);
            });
        });
    });
    // Function to dynamically update the navbar based on login state
    function updateNavbar(token) {
        // Clear current navbar content
        navbar.innerHTML = '';

        if (token) {
            // If the token is present, user is logged in
            navbar.innerHTML = `
                <a href="event_list.html">Event List</a>
                <a href="#" id="logoutButton">Logout</a>
            `;
            // If you need to show logout button
            const logoutButton = document.getElementById('logoutButton');
            logoutButton.addEventListener('click', () => {
                // Remove the token from localStorage to log the user out
                localStorage.removeItem('token');
                localStorage.removeItem('userId'); // Optionally remove user ID as well

                // Update the navbar after logout
                updateNavbar(null); // Set token to null to reflect logged-out state

                // Redirect the user to the login page after logout
                window.location.href = 'login.html'; // Redirecting to login page after logout
            });
        } else {
            // If no token, user is not logged in
            navbar.innerHTML = `
                 <a href="Home.html">Home</a>
                <a href="login.html">Login</a>  
                <a href="register.html">Register</a>
                <a href="contact.html">Contact</a>
            `;
        }
    }
});
