import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt"


//schema below


import User from "./Schema/User.js"

const server = express();
const PORT = process.env.PORT || 9008;

server.use(express.json());

const dburl = process.env.DB_URL;

mongoose.connect(dburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

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

    bcrypt.hash(password,10,(err,hashed_password)=>{
        let username = email.split("@")[0]; 
        let user = new User({
            personal_info : {fullname, email,password:hashed_password,username}
        })

        user.save().then((u)=>{
            return res.status(200).json({user:u})
        })
        .catch(err=>{
            if(err.code == 11000){
                // whenever mongoose get a error of 10000 means duplication error
            }
            return res.status(400).json({error:err.message})
        })

        console.log(hashed_password)
    })
    
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
