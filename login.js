document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.querySelector('input[name="email"]'); // Select the email input
    const passwordInput = document.querySelector('input[name="password"]'); // Select the password input
    const logoutButton = document.getElementById('logoutButton');
    const loginButton = document.getElementById('loginButton');
    const navbar = document.getElementById('navbar'); // Navbar element

    // Check if the token is already in localStorage
    const token = localStorage.getItem('token');
    
    // Navbar logic: dynamically display login/logout based on token
    updateNavbar(token); // Call the function to update navbar

    // Reset the form inputs when the page is loaded
    emailInput.value = ''; // Clear the email field
    passwordInput.value = ''; // Clear the password field

    // Login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save user ID and token in local storage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('token', data.token);

                // Redirect based on user type
                if (data.isAdmin) {
                    window.location.href = 'dashboard.html'; // Redirect to admin dashboard
                } else {
                    window.location.href = 'event_list.html'; // Redirect to event list page
                }

                // Update the navbar after login
                updateNavbar(data.token);
                
                // Clear form fields after successful login
                emailInput.value = ''; // Clear the email field
                passwordInput.value = ''; // Clear the password field
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });

    // Logout logic
    logoutButton.addEventListener('click', () => {
        // Remove the token from localStorage to log the user out
        localStorage.removeItem('token');
        localStorage.removeItem('userId'); // Optionally remove user ID as well

        // Update the navbar after logout
        updateNavbar(null); // Set token to null to reflect logged-out state

        // Reset the login form fields after logout
        emailInput.value = ''; // Clear the email field
        passwordInput.value = ''; // Clear the password field

        // Redirect the user to the login page after logout
        window.location.href = 'login.html'; // Redirecting to login page after logout
    });

    // Function to dynamically update the navbar based on login state
    function updateNavbar(token) {
        // Clear current navbar content
        navbar.innerHTML = '';

        if (token) {
            // If the token is present, user is logged in
            navbar.innerHTML = `
                <a href="Home.html">Home</a>
                <a href="event_list.html">Event List</a>
                <a href="#" id="logoutButton">Logout</a>
            `;
            // Hide the login button when logged in
            if (loginButton) {
                loginButton.style.display = 'none';
            }
            if (logoutButton) {
                logoutButton.style.display = 'block';
            }
        } else {
            // If no token, user is not logged in
            navbar.innerHTML = `
                <a href="Home.html">Home</a>
                <a href="login.html">Login</a>  
                <a href="register.html">Register</a>
                <a href="contact.html">Contact</a>
            `;
            // Show the login button when logged out
            if (loginButton) {
                loginButton.style.display = 'block';
            }
            if (logoutButton) {
                logoutButton.style.display = 'none';
            }
        }
    }
});
