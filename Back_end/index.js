const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.post("/signup", async (req, res) => {
    

    const { name, email, password } = req.body;

    // Check if fields are empty
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, hashedPassword], (err) => {
            if (err) {
                return res.status(400).json({ message: "Email already exists" });
            }
            res.json({ message: "Signup successful" });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});





/*Login route*/
// ================= LOGIN ROUTE =================//
app.post("/login", (req, res) => {
    // Get email and password from frontend, trim to remove extra spaces
    const email = req.body.email?.trim();
    const password = req.body.password;

    // Check if fields are empty
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Query user from database
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.log("DB query error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Get user data
        const user = results[0];
        console.log("Raw interests from DB:", user.interests); // Debug log

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Parse interests safely
        let interests = [];
        try {
            if (user.interests) {
                if (typeof user.interests === "string") {
                    interests = JSON.parse(user.interests);
                } else if (Array.isArray(user.interests)) {
                    interests = user.interests;
                }
            }
        } catch (e) {
            console.log("Failed to parse interests:", e);
            interests = [];
        }

        // Send login response
        res.status(200).json({
            message: "Login successful",
            userID: user.id,
            name: user.name,
            email: user.email,
            interests: interests
        });
    });
});


//Add review route
app.post("/add-review", (req, res) => {
    console.log(req.body);
    const { rating, review, destination_id, user_id } = req.body;

    if(!user_id) {
        return res.status(401).json({ message: "You must be logged in to add a review" });
    }

    const sql = "INSERT INTO reviews (rating, review, destination_id, user_id) VALUES (?, ?, ?, ?)";

    db.query(sql, [rating, review, destination_id, user_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Review added successfully" });
    });
});


//Get all reviews 
//Get all reviews 
app.get("/reviews/:destination_id", (req, res) => {

    const destination_id = req.params.destination_id;

    const sql = `SELECT reviews.*, users.name AS userName, users.id as userId
                 FROM reviews 
                 LEFT JOIN users ON reviews.user_id = users.id
                 WHERE reviews.destination_id = ? ORDER BY reviews.id DESC`;

    db.query(sql, [destination_id], (err, results) => {
        if (err) {
            console.log("Database error:", err);
            return res.status(500).json({ message: "Error fetching reviews" });
        }

        console.log("Reviews query results:", results);
        res.json(results);
    });
});

app.post("/update-profile", async (req, res) => {
    const { userId, name, email, newPassword, interests} = req.body;

    if (!userId || !name || !email){
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        let sql,params;
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            sql = "UPDATE users SET name = ?, email = ?, password = ?, interests = ? WHERE id = ?";
            params = [name, email, hashedPassword,JSON.stringify(interests || []), userId];
        } else {
            sql = "UPDATE users SET name = ?, email = ?, interests = ? WHERE id = ?";
            params = [name, email, JSON.stringify(interests || []), userId];
        }
        db.query(sql,params, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error updating profile" });
            }
            res.json({ message: "Profile updated successfully" });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }   
});
// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});


//Get User Itinerary
app.get("/itinerary/:user_id", (req, res) => {
    const user_id = req.params.user_id;

    const sql ="SELECT * FROM itinerary WHERE user_id = ? ORDER BY id DESC";
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.log("Database error:", err);
            return res.status(500).json({ message: "Error fetching itinerary" });
        }
        res.json(results);
    });
});

//Add Destination

app.post("/itinerary", (req, res) => {
      const {
        user_id,
        title,
        date,
        time,
        activity,
        duration,
        transport,
        notes
    } = req.body;

    if (!user_id || !title) {
        return res.status(400).json({ message: "Missing required fields" });
    }
     const sql = `
        INSERT INTO itinerary 
        (user_id, title, date, time, activity, duration, transport, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
      db.query(sql, [
        user_id,
        title,
        date,
        time,
        activity,
        duration,
        transport,
        notes
    ], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error adding itinerary" });
        }

        res.json({ message: "Destination added successfully" });
    });
});


//Update Itinerary
app.put("/itinerary/:id", (req, res) => {
     const id = req.params.id;
     const {
        date,
        time,
        activity,
        duration,
        transport,
        notes
    } = req.body;

    const sql = `
        UPDATE itinerary 
        SET date=?, time=?, activity=?, duration=?, transport=?, notes=?
        WHERE id=?
    `;

    db.query(sql, [
        date,
        time,
        activity,
        duration,
        transport,
        notes,
        id
    ], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error updating itinerary" });
        }

        res.json({ message: "Updated successfully" });
    });
});

//Delete Itinerary
app.delete("/itinerary/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM itinerary WHERE id=?";
    db.query(sql, [id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error deleting itinerary" });
        }
        res.json({ message: "Deleted successfully" });
    });
});
