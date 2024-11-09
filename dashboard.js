$(document).ready(function() {
  // Fetch the user count from the backend
  $.ajax({
      url: 'http://localhost:3000/api/user-count', // Backend API endpoint for user count
      type: 'GET',
      success: function(data) {
          // Update the user count in the UI
          $('#user-count').text(data.userCount);  // Display the user count in the span
      },
      error: function(err) {
          console.error('Error fetching user count:', err);
          $('#user-count').text('Error'); // Display an error message in case of failure
      }
  });

  // Fetch the total event count and upcoming events from the backend
  $.ajax({
      url: 'http://localhost:3000/api/events-count', // Backend API endpoint for events count
      type: 'GET',
      success: function(data) {
          // Update the total events in the UI
          $('#total-events').text(data.totalEvents);  // Display the total events count

          // Update the upcoming events in the UI
          if (data.upcomingEvents && data.upcomingEvents.length > 0) {
              $('#upcoming-events').text(data.upcomingEvents.length + ' events are coming soon.');
              
              // You can use DataTables to show the list of upcoming events
              $('#upcoming-events-table').DataTable({
                  data: data.upcomingEvents,
                  columns: [
                      { title: "Event Name", data: 'name' },
                      { title: "Event Date", data: 'date' },
                      { title: "Location", data: 'location' }
                  ]
              });
          } else {
              $('#upcoming-events').text('No upcoming events.');
          }
      },
      error: function(err) {
          console.error('Error fetching events data:', err);
          $('#total-events').text('Error'); // Display an error message in case of failure
          $('#upcoming-events').text('Error');
      }
  });
});
