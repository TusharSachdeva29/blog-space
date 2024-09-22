import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import jwt from "jsonwebtoken"

// Import the User schema
import User from "./Schema/User.js";

const server = express();
const PORT = process.env.PORT || 9008;

server.use(express.json());

const dburl = process.env.DB_URL;

mongoose.connect(dburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

// Correct the formatDataToSend function to properly access user data
const formatDatatoSend = (user) => {

    const access_token = jwt.sign({id:user._id},process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernamenotUnique = await User.exists({ "personal_info.username": username }).then((result) => result);

    if (isUsernamenotUnique) {
        username += nanoid().substring(0, 5); // Add unique string if username is not unique
    }

    return username;
};

server.post("/signup", (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Invalid password format" });
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        if (err) {
            return res.status(500).json({ error: "Error hashing password" });
        }

        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        });

        user.save()
            .then((u) => {
                // Directly return formatted data, not wrapped in a "user" object
                return res.status(200).json(formatDatatoSend(u));
            })
            .catch((err) => {
                if (err.code === 11000) {
                    // Handle duplicate email error
                    return res.status(500).json({ error: "Email already exists" });
                }
                return res.status(400).json({ error: err.message });
            });

        console.log(hashed_password);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
