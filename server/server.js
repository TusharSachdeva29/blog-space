import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from 'cors';
import User from "./Schema/User.js"; // Import the User schema
import admin from "firebase-admin";
import serviceAccountKey from "./mern-blogging-web-firebase-adminsdk-6n04c-fbb88be2fa.json" assert {type: "json"};
import { getAuth } from "firebase-admin/auth";
import rateLimit from 'express-rate-limit';

const server = express();

// Rate Limiter Middleware
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many authentication attempts from this IP, please try again after 15 minutes."
});

// Apply rate limiter to auth routes
server.use('/signup', authLimiter);
server.use('/signin', authLimiter);
server.use('/google-auth', authLimiter);

server.use(cors());
server.use(express.json());

// server.use(cors({
//     origin: 'http://localhost:5173',  // Allow requests from this origin
//     methods: 'GET,POST',              // Allow only specific HTTP methods
//     credentials: true                 // Enable if you need to send cookies
//   }));

const PORT = process.env.PORT || 9007;
const dburl = process.env.DB_URL;

// Validate environment variables
const requiredEnv = ['DB_URL', 'SECRET_ACCESS_KEY'];
requiredEnv.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable ${envVar}`);
        process.exit(1);
    }
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

mongoose.connect(dburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });

const formatDatatoSend = (user) => {
    const access_token = jwt.sign(
        { id: user._id },
        process.env.SECRET_ACCESS_KEY,
        { expiresIn: '1h' }
    );
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernameNotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

// Signup route
server.post("/signup", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields." });
    }

    try {
        const existingUser = await User.findOne({ "personal_info.email": email });
        if (existingUser) {
            return res.status(400).json({ "error": "Email already exists." });
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be 6-20 characters long and include at least one uppercase letter, one lowercase letter, and one number." });
        }

        const hashed_password = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const newUser = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        });

        const savedUser = await newUser.save();
        return res.status(201).json(formatDatatoSend(savedUser));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ "error": "Internal Server Error." });
    }
});

// Signin route
server.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) {
            return res.status(401).json({ "error": "Invalid email or password." });
        }

        if (!user.google_auth) {
            const isMatch = await bcrypt.compare(password, user.personal_info.password);
            if (!isMatch) {
                return res.status(401).json({ "error": "Invalid email or password." });
            }
    
            return res.status(200).json(formatDatatoSend(user));
        } 

        return res.status(403).json({ "error": "Please sign in using your Google account." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ "error": "Internal Server Error." });
    }
});

// Google Auth route
server.post("/google-auth", async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ "error": "Access token is required." });
    }

    try {
        const decodedUser = await getAuth().verifyIdToken(access_token);
        const { email, name, picture } = decodedUser;

        const updatedPicture = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email })
            .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.google_auth");

        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({
                    "error": "This email was signed up without Google. Please log in with your password to access the account."
                });
            }
        } else {
            const username = await generateUsername(email);
            user = new User({
                personal_info: { fullname: name, email, profile_img: updatedPicture, username },
                google_auth: true
            });
            await user.save();
        }

        return res.status(200).json(formatDatatoSend(user));
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            "error": "Failed to authenticate you with Google. Please try another Google account."
        });
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
