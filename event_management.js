$(document).ready(function() {
    let eventData = [];

    // Fetch the event list from the backend
    $.ajax({
        url: 'http://localhost:3000/api/events', // Backend API endpoint for fetching event list
        type: 'GET',
        success: function(data) {
            console.log('Fetched event data:', data);
            eventData = data; // Store the event data for manipulation
            renderEventList(); // Render the event list in the table
        },
        error: function(err) {
            console.error('Error fetching event list:', err);
            alert('There was an error fetching the event list.');
        }
    });

    // Render event data to the table
    function renderEventList() {
        $('#event-list').DataTable().clear().destroy(); // Destroy any existing DataTable instance
        $('#event-list tbody').empty(); // Clear existing rows

        eventData.forEach(event => {
            const row = `<tr data-id="${event.id}">
                <td>${event.id}</td>
                <td>${event.name}</td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td>${event.description}</td>
                <td>${event.capacity}</td>
                <td>${event.price}</td>
                <td>${event.category}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </td>
            </tr>`;
            $('#event-list tbody').append(row);
        });

        // Reinitialize DataTable after adding rows
        $('#event-list').DataTable();
    }

    // Event ID input and submit button functionality
    document.getElementById('submit-event-id').addEventListener('click', function () {
        const eventId = document.getElementById('event-id').value;
        if (eventId) {
            // Redirect to attendee page with eventId as a query parameter
            window.location.href = `attendee.html?eventId=${eventId}`;
        } else {
            alert("Please enter a valid Event ID.");
        }
    });

    // Handle Edit button click
    $(document).on('click', '.edit-btn', function() {
        const row = $(this).closest('tr');
        const eventId = row.data('id');
        const event = eventData.find(e => e.id === eventId);

        // Prompt user to edit the event details (or implement a modal form)
        const newName = prompt("Edit Event Name", event.name);
        if (newName !== null) {
            event.name = newName;
            renderEventList(); // Re-render the table with updated data
        }
    });

    // Handle Delete button click
    $(document).on('click', '.delete-btn', function() {
        const row = $(this).closest('tr');
        const eventId = row.data('id');

        // Confirm and delete the event
        if (confirm("Are you sure you want to delete this event?")) {
            eventData = eventData.filter(event => event.id !== eventId);
            renderEventList(); // Re-render the table after deleting the event
        }
    });
});
