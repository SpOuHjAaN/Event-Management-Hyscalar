// Function to dynamically update the navbar based on login state
function updateNavbar() {
  const navbar = document.getElementById('navbar');
  const token = localStorage.getItem('token'); // Check if token exists in localStorage

  // Clear current navbar content
  navbar.innerHTML = '';

  if (token) {
      // User is logged in, display Logout button and link to event list page
      navbar.innerHTML = `
          <a href="event_list.html">Event List</a>
          <a href="#" id="logoutButton">Logout</a>
      `;
  } else {
      // User is not logged in, show Login and Register links
      navbar.innerHTML = `
          <a href="login.html">Login</a>  
          <a href="register.html">Register</a>
          <a href="contact.html">Contact</a>
      `;
  }

  // Attach the logout event listener
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', logoutUser);
  }
}

// Logout function to handle the logout process
function logoutUser(event) {
  event.preventDefault(); // Prevent the default link behavior

  // Remove the token from localStorage to log the user out
  localStorage.removeItem('token');
  localStorage.removeItem('userId'); // Optionally remove user ID as well

  // Update the navbar to reflect the logged-out state
  updateNavbar();

  // Redirect the user to the login page after logout
  window.location.href = 'login.html';
}

// Call the function to update the navbar when the page loads
document.addEventListener('DOMContentLoaded', updateNavbar);
