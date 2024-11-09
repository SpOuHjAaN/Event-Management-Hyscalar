$(document).ready(function() {
    // Fetch the attendee list based on the event ID
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (eventId) {
        $.ajax({
            url: `http://localhost:3000/api/attendees/${eventId}`, // Updated endpoint to use :eventId
            type: 'GET',
            success: function(data) {
                // Check if data is an array or if we need to access a nested field
                const attendees = Array.isArray(data) ? data : data.attendees;

                // Check if there are no attendees
                if (attendees.length === 0) {
                    $('#attend-list').html('<p>No attendees found for this event.</p>'); // Display message
                } else {
                    // Initialize DataTable with the fetched data
                    $('#attend-list').DataTable({
                        data: attendees,
                        columns: [
                            { title: "Attendee Name", data: 'username' },  // Adjust 'username' as needed
                            { title: "Email", data: 'email' },
                        ]
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching attendee list:', error);
                alert(`Error fetching attendees: ${xhr.statusText}`);
            }
        });
    } else {
        alert("Event ID is missing. Please enter a valid Event ID.");
    }
});
