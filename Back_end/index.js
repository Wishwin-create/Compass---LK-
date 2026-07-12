const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;
const UPLOADS_BASE_URL = `http://localhost:${PORT}/uploads`;


const ADMIN_EMAIL = "johndoe@gmail.com"; // <-- the one allowed admin

function requireAdmin(req, res, next) {
    // sent from frontend as a header on every admin request
    const userId = req.header("x-user-id");

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    db.query("SELECT email FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0 || results[0].email !== ADMIN_EMAIL) {
            return res.status(403).json({ message: "Admin access only" });
        }
        next();
    });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

function parseInterests(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
}

function buildUploadUrl(filename) {
    return filename ? `${UPLOADS_BASE_URL}/${filename}` : null;
}

// Test route
app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.post("/signup", async (req, res) => {
    

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Email already exists" });
                }
                return res.status(500).json({ message: "Database error" });
            }
            res.status(201).json({ message: "Signup successful" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ================= LOGIN ROUTE =================//
app.post("/login", (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            userID: user.id,
            name: user.name,
            email: user.email,
            interests: parseInterests(user.interests),
            profilePic: user.profile_pic
        });
    });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    }
});

//Add review route
app.post("/add-review", (req, res) => {
    const { rating, review, destination_id, user_id } = req.body;

    if(!user_id) {
        return res.status(401).json({ message: "You must be logged in to add a review" });
    }

    const sql = "INSERT INTO reviews (rating, review, destination_id, user_id) VALUES (?, ?, ?, ?)";

    db.query(sql, [rating, review, destination_id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.status(201).json({ message: "Review added successfully" });
    });
});


//Get all reviews 
app.get("/reviews/:destination_id", (req, res) => {
    const destination_id = req.params.destination_id;

    const sql = `SELECT reviews.*, users.name AS userName, users.id as userId, users.profile_pic as userProfilePic
                 FROM reviews 
                 LEFT JOIN users ON reviews.user_id = users.id
                 WHERE reviews.destination_id = ? ORDER BY reviews.id DESC`;

    db.query(sql, [destination_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching reviews" });
        }

        res.json(results.map(review => ({
            ...review,
            userProfilePic: buildUploadUrl(review.userProfilePic)
        })));
    });
});

app.get("/admin/stats", requireAdmin,(req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM users) AS userCount,
            (SELECT COUNT(*) FROM reviews) AS reviewCount
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching dashboard stats" });
        }

        res.json(results[0] || { userCount: 0, reviewCount: 0 });
    });
});

app.get("/admin/reviews/recent",requireAdmin, (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const sql = `
        SELECT
            reviews.id,
            reviews.rating,
            reviews.review,
            reviews.destination_id,
            reviews.user_id,
            users.name AS userName,
            users.profile_pic AS userProfilePic
        FROM reviews
        LEFT JOIN users ON reviews.user_id = users.id
        ORDER BY reviews.id DESC
        LIMIT ?
    `;

    db.query(sql, [limit], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching recent reviews" });
        }

        res.json(results.map(review => ({
            ...review,
            userProfilePic: buildUploadUrl(review.userProfilePic)
        })));
    });
});

app.delete("/admin/reviews/:id",requireAdmin, (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM reviews WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting review" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.json({ message: "Review deleted successfully" });
    });
});

app.post("/update-profile", upload.single("profileImage"), async(req, res) => {
    const { userId,name, email, newPassword ,interests } = req.body;
    let parsedInterests = [];
    try {
        parsedInterests = parseInterests(interests);
    } catch {
        return res.status(400).json({ message: "Invalid interests payload" });
    }
    let profilePicPath = null;
    if (!userId || !name || !email) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (req.file) {
        profilePicPath = req.file.filename;
    }

    try {
        let sql, params;

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            sql = `
                UPDATE users 
                SET name=?, email=?, password=?, interests=?, profile_pic=COALESCE(?, profile_pic)
                WHERE id=?
            `;

            params = [
                name,
                email,
                hashedPassword,
                JSON.stringify(parsedInterests),
                profilePicPath,
                userId
            ];
        } else {
            sql = `
                UPDATE users 
                SET name=?, email=?, interests=?, profile_pic=COALESCE(?, profile_pic)
                WHERE id=?
            `;
            params = [
                name,
                email,
                JSON.stringify(parsedInterests),
                profilePicPath,
                userId
            ];
        }

        db.query(sql, params, (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            res.json({
                message: "Profile updated successfully",
                profilePic: profilePicPath
            });
        });
    } catch (error) {
        console.error("Error in update-profile route:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Get User Itinerary
app.get("/itinerary/:user_id", (req, res) => {
    const user_id = req.params.user_id;

    const sql ="SELECT * FROM itinerary WHERE user_id = ? ORDER BY id DESC";
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
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
            return res.status(500).json({ message: "Error adding itinerary" });
        }

        res.status(201).json({ message: "Destination added successfully" });
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
            return res.status(500).json({ message: "Error deleting itinerary" });
        }
        res.json({ message: "Deleted successfully" });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
