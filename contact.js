// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the form element
    const form = document.querySelector('.contact-form');
    
    // Create a paragraph element to display status messages
    const statusMessage = document.createElement('p');
    form.appendChild(statusMessage);

    // Add event listener for form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Create a FormData object to collect all the form data
        const formData = new FormData(form);
        console.log("Form data collected:", formData);

        // Create an object to hold the form data
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        console.log("Form data object:", data);

        // Display a loading message
        statusMessage.textContent = 'Submitting your message...';
        console.log("Submitting message...");

        try {
            // Send data to the backend using Fetch API (AJAX)
            const response = await fetch('http://localhost:3000/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  // Set content type to JSON
                },
                body: JSON.stringify(data)  // Convert form data to JSON
            });

            // Handle the response from the server
            if (response.ok) {
                console.log("Message sent successfully!");
                statusMessage.textContent = 'Your message has been sent successfully!';
                statusMessage.style.color = 'green';
                form.reset();  // Reset the form after successful submission
            } else {
                console.log("Error submitting the message:", response.status);
                statusMessage.textContent = 'Error submitting your message. Please try again later.';
                statusMessage.style.color = 'red';
            }
        } catch (error) {
            // Catch network errors and display an error message
            console.error("Network error:", error);
            statusMessage.textContent = 'There was a network error. Please try again later.';
            statusMessage.style.color = 'red';
        }
    });
});
