document.addEventListener('DOMContentLoaded', () => {
  const createEventForm = document.getElementById('createEventForm');
  
  createEventForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent the default form submission
    
    const eventId = document.getElementById('event-id') ? document.getElementById('event-id').value : null;
    
    // Collect form data
    const formData = {
      eventName: document.getElementById('event-name').value,
      date: document.getElementById('event-date').value,
      location: document.getElementById('event-location').value,
      description: document.getElementById('event-description').value,
      capacity: parseInt(document.getElementById('event-capacity').value, 10),
      price: parseFloat(document.getElementById('event-price').value),
      eventCategory: document.getElementById('event-category').value,
    };
    
    try {
      let response;
      
      if (eventId) {
        // If an event ID is present, perform the update
        response = await fetch(`http://localhost:3000/events/${eventId}`, {
          method: 'PUT',  // PUT request for updating the event
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // If no event ID, create a new event
        response = await fetch('http://localhost:3000/events', {
          method: 'POST',  // POST request for creating a new event
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (response.ok) {
        alert(eventId ? 'Event updated successfully!' : 'Event created successfully!');
        createEventForm.reset();  // Reset the form after successful submission
      } else {
        const errorMessage = await response.text();
        alert(`Failed to create or update event: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating or updating the event.');
    }
  });
});
