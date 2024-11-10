$(document).ready(function() {
    // Handle Submit button click to fetch data for the specific event ID
    $('#submit-event-id').on('click', function() {
        const eventId = $('#event-id').val();
        if (eventId) {
            fetchEventResponses(eventId);
        } else {
            alert("Please enter a valid Event ID.");
        }
    });

    // Function to fetch message and question data from the backend
    function fetchEventResponses(eventId) {
        $.ajax({
            url: `http://localhost:3000/api/event-responses?eventId=${eventId}`, // Adjust the endpoint as needed
            type: 'GET',
            success: function(data) {
                renderResponseTable(data); // Render data to table
            },
            error: function(err) {
                console.error('Error fetching responses:', err);
                alert('There was an error fetching the responses.');
            }
        });
    }

    // Function to render the responses in a DataTable
    function renderResponseTable(data) {
        $('#response-table').DataTable().clear().destroy(); // Destroy existing DataTable instance
        $('#response-table tbody').empty(); // Clear existing rows

        data.forEach(response => {
            const row = `<tr>
                <td>${response.message}</td>
                <td>${response.question}</td>
            </tr>`;
            $('#response-table tbody').append(row);
        });

        // Reinitialize DataTable after adding rows
        $('#response-table').DataTable();
    }
});
