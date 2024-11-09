const express = require("express");
const mysql = require("mysql2");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const paypal = require("@paypal/checkout-server-sdk");
const { OAuth2Client } = require('google-auth-library');
const app = express();
const PORT = 3000;

// Replace this with your actual JWT secret
const JWT_SECRET = 'your_jwt_secret';


// PayPal environment setup
function environment() {
  let clientId = "AUlQYt9IF0SKRJaS0nrieXZ52plmnuc-PRIn4oaZWbECkHIxs02F1hcOq5_iqAx-yP-745zU2jLUr4jc"; // replace with your client ID
  let clientSecret = "EJLtF5octOKuq8_IoQRhA3z5m9tyyGLRHS3NAdfbk5nE7V-FEzTZTCbBoNVduLIOBpS9ZN91HVgmnGHK"; // replace with your client secret
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal client setup
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

app.use(cors());
app.use(express.json()); // Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "Puja@2000", // Replace with your MySQL password
  database: "events", // Replace with your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// POST route to handle form submission contact
app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body;

  // Check if all fields are provided
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
      service: 'gmail',  // You can change this to any email service provider
      auth: {
          user: 'debadarsinibiswal2000@gmail.com',  // Replace with your Gmail address
          pass: 'pooja1234'    // Use an app-specific password if 2FA is enabled
      }
  });

  // Setup email data
  const mailOptions = {
      from: email,  // The email address from which the form is submitted
      to: 'recipient-email@example.com',  // The email address where the form data will be sent
      subject: 'New Contact Form Submission',
      text: `You have a new message from:

          Name: ${name}
          Email: ${email}
          Message: ${message}
      `
  };

  // Send the email using Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        // Log the error in the console for debugging purposes
        console.error('Error sending email:', error);
        
        // Send a 500 Internal Server Error response
        return res.status(500).json({ message: 'Error sending email' });
    }

    // If email sent successfully, log the info to the console
    console.log('Email sent successfully:', info.response);
    
    // Send success response to the frontend
    return res.status(200).json({ message: 'Form submitted successfully' });
});
});

// Route to handle login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query to find the user by email
    const [user] = await db.promise().query("SELECT * FROM users_events WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const foundUser = user[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign({ id: foundUser.id, email }, JWT_SECRET, { expiresIn: '1h' });

    // Determine if user is admin (ID = 0)
    const isAdmin = foundUser.id === 0;

    res.json({
      message: "Login successful",
      token,
      isAdmin, // true if admin, false otherwise
      userId: foundUser.id,
      email: foundUser.email  // Send the email as well
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




// Registration route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Validate user input
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if user already exists
  db.query("SELECT * FROM users_events WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ message: "Database query error.", error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database, including the created_at timestamp
    db.query(
      "INSERT INTO users_events (username, email, password, created_at) VALUES (?, ?, ?, NOW())",
      [username, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ message: "Error creating user." });
        }

        // Create a JWT token (optional)
        const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "User registered successfully", token });
      }
    );
  });
});

// Google Login route
app.post('/google-login', async (req, res) => {
  const { token } = req.body; // Google token sent from the frontend

  try {
      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: '354207534043-5ph7nrt5j2i19587o7iikv6jo7mak9pg.apps.googleusercontent.com', // Replace with your actual Google Client ID
      });

      const payload = ticket.getPayload();
      console.log(payload);
      const userId = payload.sub; // Google's unique user ID
      const email = payload.email;

      if (!email) {
        return res.status(400).json({ message: 'Email not found in Google token' });
    }

      // Check if the user exists or create a new user
      let user = await User.findOne({ googleId: userId });

      if (!user) {
          // Create a new user if they don't exist
          user = new User({
              username: payload.name,
              email: payload.email,
              googleId: userId,
              isAdmin: false, // You can adjust this based on your requirements
          });
          await user.save();
      }

      // Generate a JWT token for the user
      const authToken = jwt.sign(
          { userId: user._id, email: user.email, isAdmin: user.isAdmin },
          JWT_SECRET,
          { expiresIn: '1h' } // Token expires in 1 hour
      );

      // Send the token and user info to the frontend
      res.json({ token: authToken, userId: user._id, isAdmin: user.isAdmin });
  } catch (error) {
      console.error('Google login error:', error);
      res.status(400).json({ message: 'Google login failed.' });
  }
});


// Route to fetch all events
app.get('/events', (req, res) => {
  const query = 'SELECT * FROM create_events';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
    res.json(results);
  });
});




// Route to handle booking with PayPal payment
app.post('/book-event', async (req, res) => {
  const { eventId, userId, numTickets, totalPrice } = req.body;

  // Get the current date and time for booking_date
  const bookingDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:MM:SS'

  // Check if there are enough seats available
  const checkSeatsQuery = 'SELECT capacity FROM create_events WHERE id = ?';
  db.query(checkSeatsQuery, [eventId], (err, result) => {
    if (err) {
      console.error('Error checking seats:', err);
      return res.status(500).json({ error: 'Failed to check seats' });
    }

    const remainingSeats = result[0].capacity;
    if (numTickets > remainingSeats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    // Create PayPal order
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD', // Set currency as needed
          value: totalPrice.toString(),
        }
      }]
    };

    const client = createPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody(orderRequest);

    // Execute the PayPal order
    client.execute(request)
      .then((order) => {
        // Send the PayPal order ID to the client for approval
        res.json({ orderId: order.result.id });
      })
      .catch((err) => {
        console.error('Error creating PayPal order:', err);
        res.status(500).json({ error: 'Failed to create PayPal order' });
      });
  });
});

// Route to capture PayPal payment and finalize booking
app.post('/capture-payment', async (req, res) => {
  const { orderId, eventId, userId, numTickets, totalPrice } = req.body;

  const client = createPayPalClient();
  const request = new paypal.orders.OrdersCaptureRequest(orderId);

  // Capture the payment from PayPal
  client.execute(request)
    .then((capture) => {
      if (capture.result.status === 'COMPLETED') {
        // Insert booking record into the database
        const bookingDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:MM:SS'
        const bookQuery = 'INSERT INTO ticket_events (event_id, user_id, num_tickets, total_price, booking_date) VALUES (?, ?, ?, ?, ?)';

        db.query(bookQuery, [eventId, userId, numTickets, totalPrice, bookingDate], (err, result) => {
          if (err) {
            console.error('Error booking event:', err);
            return res.status(500).json({ error: 'Booking failed' });
          }

          // Update remaining capacity in the event table
          const updateSeatsQuery = 'UPDATE create_events SET capacity = capacity - ? WHERE id = ?';
          db.query(updateSeatsQuery, [numTickets, eventId], (err, result) => {
            if (err) {
              console.error('Error updating event capacity:', err);
              return res.status(500).json({ error: 'Failed to update seat capacity' });
            }

            res.json({ message: 'Payment and booking successful' });
          });
        });
      } else {
        res.status(400).json({ error: 'Payment not completed' });
      }
    })
    .catch((err) => {
      console.error('Error capturing PayPal payment:', err);
      res.status(500).json({ error: 'Failed to capture payment' });
    });
});

// CRUD Routes for events

// Create an event
// Route to create an event
app.post("/events", (req, res) => {
  const { eventName: name, date, location, description, capacity, price, eventCategory: category } = req.body;
  
  const sql = "INSERT INTO create_events (name, date, location, description, capacity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [name, date, location, description, capacity, price, category], (err, result) => {
    if (err) {
      console.error("Error creating event:", err);
      return res.status(500).json({ error: "Failed to create event" });
    }
    res.status(201).json({ message: "Event created successfully", eventId: result.insertId });
  });
});

// Get all events
app.get("/events", (req, res) => {
  const sql = "SELECT * FROM create_events";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ error: "Failed to fetch events" });
    }
    res.json(results);
  });
});

// Update an event by ID
app.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const { eventName: name, date, location, description, capacity, price, eventCategory: category } = req.body;
  
  const sql = "UPDATE create_events SET name = ?, date = ?, location = ?, description = ?, capacity = ?, price = ?, category = ?,  WHERE id = ?";
  
  db.query(sql, [name, date, location, description, capacity, price, category, id], (err, result) => {
    if (err) {
      console.error("Error updating event:", err);
      return res.status(500).json({ error: "Failed to update event" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event updated successfully" });
  });
});

// Delete an event by ID
app.delete("/events/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM create_events WHERE id = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ error: "Failed to delete event" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  });
});

// Define API endpoint to get users (excluding admin)
app.get('/api/users', (req, res) => {
  const sql = 'SELECT id, username, email, created_at FROM users_events WHERE id != 0'; // Exclude id = 0 (admin)

  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching user data:', err);
          res.status(500).send('Server error');
          return;
      }
      res.json(results); // Send the data as JSON response
  });
});

// Define API endpoint to get total number of users
app.get('/api/user-count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS userCount FROM users_events WHERE id != 0'; // Exclude admin (id = 0)

  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching user count:', err);
          res.status(500).send('Server error');
          return;
      }

      // Send the user count as a JSON response
      res.json(results[0]);  // Since COUNT returns an array with one object
  });
});

//upcoming events
app.get('/api/events-count', (req, res) => {
  const sqlTotalEvents = 'SELECT COUNT(*) AS totalEvents FROM create_events';
  const sqlUpcomingEvents = 'SELECT * FROM create_events WHERE date > NOW()'; // Filter for upcoming events

  db.query(sqlTotalEvents, (err, totalEventsResults) => {
      if (err) {
          console.error('Error fetching total events:', err);
          return res.status(500).send('Server error');
      }

      db.query(sqlUpcomingEvents, (err, upcomingEventsResults) => {
          if (err) {
              console.error('Error fetching upcoming events:', err);
              return res.status(500).send('Server error');
          }

          res.json({
              totalEvents: totalEventsResults[0].totalEvents,
              upcomingEvents: upcomingEventsResults
          });
      });
  });
});

// API Route to get event list
app.get('/api/events', async (req, res) => {
  const sql = 'SELECT id, name, date, location, description, capacity, price, category FROM create_events'; // Assuming create_events table
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching event list:', err);
          res.status(500).send('Server error');
          return;
      }
      res.json(results); // Return the event list
  });
});

// API Route to get a specific event by ID
app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  const sql = 'SELECT * FROM create_events WHERE id = ?';
  db.query(sql, [eventId], (err, result) => {
    if (err) {
      console.error('Error fetching event:', err);
      res.status(500).send('Server error');
      return;
    }
    if (result.length === 0) {
      res.status(404).send('Event not found');
      return;
    }
    res.json(result[0]); // Return the specific event
  });
});

// API Route to update an event
app.put('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  const { name, date, location, description, capacity, price, category } = req.body;

  const sql = `
    UPDATE create_events
    SET name = ?, date = ?, location = ?, description = ?, capacity = ?, price = ?, category = ?
    WHERE id = ?
  `;
  db.query(sql, [name, date, location, description, capacity, price, category, eventId], (err, result) => {
    if (err) {
      console.error('Error updating event:', err);
      res.status(500).send('Server error');
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('Event not found');
      return;
    }
    res.send('Event updated successfully');
  });
});

// API Route to delete an event
app.delete('/api/events/:id', (req, res) => {
  const eventId = req.params.id;

  const sql = 'DELETE FROM create_events WHERE id = ?';
  db.query(sql, [eventId], (err, result) => {
    if (err) {
      console.error('Error deleting event:', err);
      res.status(500).send('Server error');
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('Event not found');
      return;
    }
    res.send('Event deleted successfully');
  });
});

// API endpoint to get attendee list for a given event_id
app.get('/api/attendees/:eventId', (req, res) => {
  const eventId = req.params.eventId;

  // SQL query to get the name and email of attendees based on event_id
  const query = `
    SELECT username, email
    FROM ticket_events te
    JOIN users_events ue ON te.user_id = ue.id
    WHERE te.event_id = ?
  `;

  // Execute the query
  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No attendees found for this event' });
    }

    // Return the list of attendees
    res.json(results);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
