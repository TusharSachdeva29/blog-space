import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from 'cors';
import User from "./Schema/User.js"; // Import the User schema
import Blog from "./Schema/Blog.js";
import admin from "firebase-admin";
import serviceAccountKey from "./mern-blogging-web-firebase-adminsdk-6n04c-fbb88be2fa.json" assert {type: "json"};
import { getAuth } from "firebase-admin/auth";
import rateLimit from 'express-rate-limit';
import { formatPostcssSourceMap } from "vite";

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


    const verifyJWT = (req, res, next) => {
        const authHeader = req.header('authorization');
        const token = authHeader && authHeader.split(" ")[1];
    
        if (!token) {
            return res.status(401).json({ error: "No access token, please sign up first" });
        }
    
        jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Access token is invalid" }); // Corrected this part
            }
            req.user = user.id; // Assuming user object has an 'id' field
            next();
        });
    };
    


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

server.post('/latest-blogs', (req, res) => {

    let { page }= req.body
    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1 ) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

server.post("/all-latest-blog-count", (req, res) => {
    Blog.countDocuments({ draft: false })
      .then((count) => {
        return res.status(200).json({ totalDocs: count });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
      });
  });

server.post("/search-blogs-count",(req,res) => {
    let { tag } = req.body;
    let findQuery = {tags:tag,draft:false}
    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({totalDocs: count})
    })
    .catch(err => {
        console.log(err.message)
        return res.status(500).json({ error: err.message })
    })
})
  

server.get('/trending-blogs',(req,res) => {
    // console.log("Request Body:", req.body);
    Blog.find({draft:false})
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"activity.total_reads":-1,"activity.total_likes":-1,"publishedAt":-1})
    .select("blog_id title  publishedAt -_id")
    .limit(5)
    .then(blogs => {
        return res.status(200).json({blogs});
    })
    .catch(err => {
        return res.status(500).json({error:err.message});
    })
})

server.post('/search-blogs', (req, res) => {
    let {tag, page} = req.body; 
    tag = tag.toLowerCase();
    let findQuery = { tags: tag, draft: false };
    let maxLimit = 2;

    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id") 
        .sort({ "publishedAt": -1 })
        .select("blog_id title des activity tags publishedAt -_id")  
        .skip((page-1)*maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            console.log(blogs);  // Log the found blogs
            return res.status(200).json({ blogs });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
        
});













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



server.post('/create-blog', verifyJWT ,(req,res) => {
    let { title,des,banner,tags,content,draft } = req.body
    let authorId = req.user;

    if(!title.length){
        return res.status(403).json({error:"tou must provide a title"})
    }      

    if(!draft){
    
        if(!title.length){
            return res.status(403).json({error:"tou must provide a title"})
        }        
        if(!des.length || des.length>200){
                return res.status(403).json({"error":"description must be between 1 and 200"})
        }
    }

    
    // converting tags to lower case tech,Tech shoulf be treated same 
    tags = tags.map(tag=> tag.toLowerCase());

    let blog_id = title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g,"-").trim() + nanoid();
    // special chara in title will be reapladced by ' ' nd replace it with -
    console.log(blog_id)

    let blog = new Blog({
        title,des,banner,content,tags,author:authorId,blog_id,draft: Boolean(draft) 
    })

    blog.save().then(blog => {
        let incrementVal = draft ? 0 : 1;
        
        User.findOneAndUpdate({ _id : authorId } , { $inc : {"account_info.total_posts": incrementVal} , $push : { "blogs" : blog._id } })
        .then(user => {
            return res.status(200).json({id : blog.blog_id })
        })
        .catch(err => {
            return res.status(500).json({"error": "faied to update total post number"})
        })
    })
    .catch(err => {
        return res.status(500).json({"error":err.message})
    })

    // return res.json({status:"done"})

})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
