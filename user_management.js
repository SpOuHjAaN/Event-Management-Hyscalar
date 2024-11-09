$(document).ready(function() {
    // Initialize DataTable and load data from backend
    $('#userTable').DataTable({
        ajax: {
            url: 'http://localhost:3000/api/users',  // Backend API endpoint
            dataSrc: ''  // The data is directly an array, so no nested 'data' key is needed
        },
        columns: [
           
            { data: 'username' },
            { data: 'email' },
            { data: 'created_at' }
        ]
    });
});
