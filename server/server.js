import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from 'cors';
import User from "./Schema/User.js"; // Import the User schema

const server = express();
server.use(cors());
server.use(express.json());

const PORT = process.env.PORT || 9007;
const dburl = process.env.DB_URL;

mongoose.connect(dburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    const isUsernamenotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernamenotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

// Signup route
server.post("/signup", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    try {
        User.findOne({"personal_info.email" : email})
        .then((user) => {
            if(user) {
                return res.status(400).json({ "error": "email already exists" });
            }
        })
    
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Invalid password format" });
        }

        const hashed_password = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const newUser = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        });

        const savedUser = await newUser.save();
        return res.status(200).json(formatDatatoSend(savedUser));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Signin route
server.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.personal_info.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ error: "Invalid password" });
        }

        return res.status(200).json(formatDatatoSend(user));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
