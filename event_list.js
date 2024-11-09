document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  updateNavbar(token); // Update the navbar based on login state

  fetchEvents(); // Fetch events after updating the navbar
  // Attach event listener to the search form
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    filterEvents();
  });
});

let eventsData = []; // To store fetched events for filtering
// Store event capacities to track remaining seats dynamically
const eventCapacities = {};


function fetchEvents() {
  fetch('http://localhost:3000/events')
    .then(response => response.json())
    .then(events => {
      eventsData = events; // Store the events for filtering
      displayEvents(events); // Display all events initially
    })
    .catch(error => console.error('Error fetching events:', error));
}

function displayEvents(events) {
  const eventCardsContainer = document.getElementById('eventCardsContainer');
  eventCardsContainer.innerHTML = ''; // Clear existing cards

  if (events.length === 0) {
    eventCardsContainer.innerHTML = '<p>No events found</p>';
    return;
  }

  events.forEach(event => {
    eventCapacities[event.id] = event.capacity; // Initialize capacity for tracking

    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${event.name}</h5>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p class="card-text"><strong>Description:</strong> ${event.description}</p>
          <p id="seatCapacity-${event.id}"><strong>Remaining Seats:</strong> ${event.capacity}</p>
          <p><strong>Per Price:</strong> $${event.price}</p>
          <label for="numTickets-${event.id}">Number of Tickets:</label>
          <input type="number" id="numTickets-${event.id}" class="form-control mb-2 event-ticket-input" min="0" max="${event.capacity}" value="0" 
              oninput="updateRemainingSeats(${event.id}, ${event.price})"/>
          <button class="btn btn-primary btn-block" onclick="openBookingForm(${event.id}, ${event.price})">Book Now</button>
        </div>
      </div>
    `;
    eventCardsContainer.appendChild(card);
  });
}

// Function to filter events based on keyword, location, and date
function filterEvents() {
  const keyword = document.querySelector('[name="keyword"]').value.toLowerCase();
  const location = document.querySelector('[name="location"]').value.toLowerCase();
  const date = document.querySelector('[name="date"]').value;

  const filteredEvents = eventsData.filter(event => {
    const nameMatch = event.name.toLowerCase().includes(keyword);
    const descMatch = event.description.toLowerCase().includes(keyword);
    const locationMatch = !location || event.location.toLowerCase() === location;
    const dateMatch = !date || event.date === date;

    return (nameMatch || descMatch) && locationMatch && dateMatch;
  });

  displayEvents(filteredEvents); // Display only the matching events
  
}

// Function to update remaining seats dynamically
function updateRemainingSeats(eventId, pricePerUser) {
  const numTicketsInput = document.getElementById(`numTickets-${eventId}`);
  const selectedSeats = parseInt(numTicketsInput.value, 10) || 0;
  const remainingSeats = eventCapacities[eventId] - selectedSeats;
  document.getElementById(`seatCapacity-${eventId}`).textContent = `Remaining Seats: ${remainingSeats}`;
}

// Function to open the booking form overlay with updated ticket count and total price
function openBookingForm(eventId, pricePerUser) {
  const numTicketsInput = document.getElementById(`numTickets-${eventId}`);
  const numTickets = parseInt(numTicketsInput.value, 10) || 0;
  const totalPrice = numTickets * pricePerUser;

  const overlay = document.getElementById('overlay');
  const bookingForm = document.getElementById('bookingForm');
  const pricePerUserText = document.getElementById('price-per-user');
  const totalPriceText = document.getElementById('total-price');
  const numberOfSeatsText = document.getElementById('number-of-seats');

  if (overlay && bookingForm && pricePerUserText && totalPriceText && numberOfSeatsText) {
      pricePerUserText.textContent = `$${pricePerUser}`;
      totalPriceText.textContent = `$${totalPrice}`;
      numberOfSeatsText.textContent = numTickets;

      overlay.style.display = 'block';
      bookingForm.style.display = 'block';

      const formNumTicketsInput = document.getElementById('num-tickets');
      if (formNumTicketsInput) {
          formNumTicketsInput.value = numTickets;
          formNumTicketsInput.oninput = function () {
              const updatedTickets = parseInt(this.value, 10) || 0;
              const updatedTotalPrice = updatedTickets * pricePerUser;
              totalPriceText.textContent = `$${updatedTotalPrice}`;
              numberOfSeatsText.textContent = updatedTickets;
          };
      }

      // Set the global variable for current event ID to be used in booking
      window.currentEventId = eventId;
  }
  // Render PayPal Button
  renderPayPalButton(totalPrice);
}

// Function to render PayPal button
function renderPayPalButton(totalPrice) {
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: totalPrice
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Transaction completed by ' + details.payer.name.given_name);
        // Call confirmBooking after successful payment
        confirmBooking();
      });
    },
    onError: function(err) {
      console.error('PayPal Error:', err);
      alert('Payment failed. Please try again.');
    }
  }).render('#paypal-button-container');
}

// Function to close the booking form overlay and reset the ticket input
function closeBookingForm() {
  const overlay = document.getElementById('overlay');
  const bookingForm = document.getElementById('bookingForm');

  if (overlay && bookingForm) {
      overlay.style.display = 'none';
      bookingForm.style.display = 'none';
  }

  const ticketInputs = document.querySelectorAll('.event-ticket-input');
  ticketInputs.forEach(input => {
      input.value = '0';
  });

  const totalPriceText = document.getElementById('total-price');
  const numberOfSeatsText = document.getElementById('number-of-seats');

  if (totalPriceText) totalPriceText.textContent = '$0';
  if (numberOfSeatsText) numberOfSeatsText.textContent = '0';

  const formNumTicketsInput = document.getElementById('num-tickets');
  if (formNumTicketsInput) formNumTicketsInput.value = '0';

  resetRemainingSeats();
}

// Function to reset remaining seats in the UI
function resetRemainingSeats() {
  Object.keys(eventCapacities).forEach(eventId => {
      const seatCapacityElement = document.getElementById(`seatCapacity-${eventId}`);
      if (seatCapacityElement) seatCapacityElement.textContent = `Remaining Seats: ${eventCapacities[eventId]}`;
  });
}

// Confirm booking and send data to backend
function confirmBooking() {
  const totalSeats = document.getElementById('number-of-seats');
  const totalPrice = document.getElementById('total-price');
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('User not logged in');
    return;
 }

  if (totalSeats && totalPrice && window.currentEventId) {
      const selectedSeats = parseInt(totalSeats.textContent, 10) || 0;
      const totalPriceValue = parseFloat(totalPrice.textContent.replace('$', ''));

      // Send booking data to backend
      fetch('http://localhost:3000/book-event', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              eventId: window.currentEventId,
              userId: userId,
              numTickets: selectedSeats,
              totalPrice: totalPriceValue
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.message) {
              alert(data.message);
              eventCapacities[window.currentEventId] -= selectedSeats; // Update remaining seats in frontend
              closeBookingForm();
              resetRemainingSeats(); // Update displayed capacities
          } else {
              alert(data.error || 'Booking failed');
          }
      })
      .catch(error => console.error('Error booking event:', error));
  }
}

// Function to dynamically update the navbar based on login state
function updateNavbar(token) {
  const navbar = document.getElementById('navbar'); // Make sure there's a div with id 'navbar' in your HTML
  if (navbar) {
    // Clear current navbar content
    navbar.innerHTML = '';

    if (token) {
      // If token is found (user is logged in)
      navbar.innerHTML = `
          <nav>
              <a href="event_list.html">Event List</a>
              <a href="#" id="logoutButton">Logout</a>
          </nav>
      `;

      // Add event listener for the logout button
      const logoutButton = document.getElementById('logoutButton');
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');  // Remove the token to log out
        localStorage.removeItem('userId'); // Optionally remove user ID as well
        updateNavbar(null); // Update the navbar after logout
        window.location.href = 'login.html'; // Redirect to login page
      });
    } else {
      // If no token (user is not logged in)
      navbar.innerHTML = `
          <nav>
              <a href="login.html">Login</a>
              <a href="register.html">Register</a>
              <a href="contact.html">Contact</a>
          </nav>
      `;
    }
  }
}
