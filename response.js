$(document).ready(function() {
    // Initialize the DataTable
    const table = $('#eventDataTable').DataTable();

    // Fetch data when the "Submit" button is clicked
    $('#fetchDataButton').on('click', fetchEventData);
});

// Function to fetch data based on the entered event ID
function fetchEventData() {
    const eventId = $('#eventIdInput').val().trim();

    if (!eventId) {
        alert('Please enter an event ID.');
        return;
    }

    // Fetch event name, forum messages, and Q&A questions for the given event ID
    $.ajax({
        url: `http://localhost:3000/api/events/${eventId}/data`,
        method: 'GET',
        success: function(eventData) {
            if (eventData.error) {
                alert(eventData.error);
                return;
            }

            // Ensure eventData is in the correct format
            if (Array.isArray(eventData) && eventData.length > 0) {
                // Clear the existing table data
                const table = $('#eventDataTable').DataTable();
                table.clear();

                // Populate the table with the fetched data
                eventData.forEach(item => {
                    table.row.add([
                        item.name || 'N/A',  // Ensure default values if the data is missing
                        item.message || 'N/A',
                        item.question || 'N/A'
                    ]).draw();
                });
            } else {
                alert('No data found for the provided event ID.');
            }
        },
        error: function(error) {
            console.error('Error fetching event data:', error);
            alert('Failed to fetch event data.');
        }
    });
}
