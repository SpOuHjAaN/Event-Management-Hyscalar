document.addEventListener('DOMContentLoaded', () => {
    fetchEvents(); // Fetch events and populate the dropdown

    // Attach submit function to the button
    document.querySelector('button[type="button"]').addEventListener('click', submitForumPost);
    document.getElementById('pollVoteButton').addEventListener('click', submitVote);
    document.getElementById('submitQuestionButton').addEventListener('click', submitQuestion);

    loadPoll(); // Load poll data on page load
    renderQuestions(); // Render Q&A questions
});

// Global variable to store events data
let eventsData = [];

// Fetch events from the API
function fetchEvents() {
    fetch('http://localhost:3000/events')
        .then(response => response.json())
        .then(events => {
            eventsData = events; // Store the events for filtering
            displayEvents(events); // Display all events in the dropdown
        })
        .catch(error => console.error('Error fetching events:', error));
}

// Display events in the dropdown
function displayEvents(events) {
    const eventsContainer = document.getElementById('eventsList');
    if (!eventsContainer) {
        console.error("The 'eventsList' container is missing from the HTML.");
        return;
    }
    eventsContainer.innerHTML = ''; // Clear existing options

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select an Event';
    eventsContainer.appendChild(defaultOption);

    // Add event options
    events.forEach(event => {
        const eventOption = document.createElement('option');
        eventOption.value = event.id; // Assuming 'id' is the event ID
        eventOption.textContent = event.name; // Assuming 'name' is the event name
        eventsContainer.appendChild(eventOption);
    });
}

// Submit the forum post
async function submitForumPost() {
    const message = document.getElementById('forumMessage').value.trim();

    if (!message) {
        alert('Please enter a message to post.');
        return;
    }

    const user_id = localStorage.getItem('userId');
console.log('User ID from localStorage:', user_id);

if (!user_id) {
    alert('User is not logged in.');
    return;
}


    // Get the event_id from the dropdown selection
    const event_id = document.getElementById('eventsList').value;
    if (!event_id) {
        alert('Please select an event.');
        return;
    }

    // Post the data to the backend
    const response = await fetch('http://localhost:3000/api/forum/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, user_id, event_id }),
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        renderForumPosts();
        document.getElementById('forumMessage').value = ''; // Clear input
    } else {
        alert(data.error);
    }
}

// Render forum posts
async function renderForumPosts() {
    const response = await fetch('http://localhost:3000/api/forum/posts');
    const posts = await response.json();

    const forumContainer = document.querySelector('.forum-posts');
    forumContainer.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('card', 'mb-2');
        postElement.innerHTML = `
            <div class="card-body">
                <p class="card-text">${post.message}</p>
                <footer class="text-muted">Posted on ${post.created_at}</footer>
            </div>
        `;
        forumContainer.appendChild(postElement);
    });
}


// --- Live Q&A Section ---

// Submit a question for the Q&A
async function submitQuestion() {
    const question = document.getElementById('qaQuestion').value.trim();
    const event_id = document.getElementById('eventsList').value;
    const user_id = localStorage.getItem('userId');

    console.log('Selected event_id:', event_id);  // Debug log

    if (!question) {
        alert('Please enter a question.');
        return;
    }

    if (!event_id || event_id === "") {
        alert('Please select an event.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/qa/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, event_id, user_id }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            renderQuestions();
            document.getElementById('qaQuestion').value = ''; // Clear input
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
// Render all questions in the Q&A section
async function renderQuestions() {
    const event_id = document.getElementById('eventsList').value;
    if (!event_id) return;

    try {
        const response = await fetch(`http://localhost:3000/api/qa/questions/${event_id}`);
        const questions = await response.json();

        const questionsContainer = document.querySelector('.questions-list');
        questionsContainer.innerHTML = ''; // Clear existing questions

        questions.forEach(q => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('card', 'mb-2');
            questionElement.innerHTML = `
                <div class="card-body">
                    <p class="card-text">${q.question}</p>
                    <footer class="text-muted">Asked on ${q.date}</footer>
                </div>
            `;
            questionsContainer.appendChild(questionElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load content when the page loads
window.onload = () => {
    loadPoll();
    renderForumPosts(); // Assuming you have a renderForumPosts function
    renderQuestions();
};

