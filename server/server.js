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


import Notification from "./Schema/Notification.js";

import Comment from "./schema/Comment.js"


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
    let { tag,query,author } = req.body;
    let findQuery 
    if(tag){
        findQuery = { tags: tag, draft: false };
    }else if(query){
        findQuery = {draft: false , title: new RegExp(query,'i')}
    }
    else if(author){
        findQuery = {author,draft:false}
    }
    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({totalDocs: count})
    })
    .catch(err => {
        console.log(err.message)
        return res.status(500).json({ error: err.message })
    })
})

server.post("/search-users", (req, res) => {
    console.log("Request body: ", req.body);

    let { query } = req.body;

    // Check if query exists and is not an empty string
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ error: "Invalid query" });
    }

    // Perform search with a case-insensitive regular expression
    User.find({ "personal_info.username": new RegExp(query, 'i') })
        .limit(50)
        // Fixed the exclusion of _id field
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json({ users });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});


server.post("/get-profile", (req, res) => {
    let { username } = req.body;

    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            return res.status(200).json(user)
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({error : err.message})
        })
});


  

server.get('/trending-blogs',(req,res) => {
    // console.log("Request Body:", req.b`````ody);
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
    let {tag,query,page,author,limit, eliminate_blog} = req.body; 

    let findQuery 
    if(tag){
        findQuery = { tags: tag, draft: false , blog_id: {$ne : eliminate_blog } };
    }else if(query){
        findQuery = {draft: false , title: new RegExp(query,'i')}
    }
    else if(author){
        findQuery = {author,draft:false}
    }

    let maxLimit = limit ? limit : 2;

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


server.post("/get-blog",(req,res) => {
    let { blog_id , draft , mode } = req.body
    let incrementVal = mode != 'edit' ? 1 : 0;

    Blog.findOneAndUpdate({blog_id},{$inc : { "activity.total_reads" : 
    incrementVal }}  )

    .populate("author","personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content activity publishedAt blog_id tags")
    .then(blog => {

        User.findOneAndUpdate({"personal_info.username" : blog.author.personal_info.username} , {$inc : {"account_info.total_reads" : incrementVal}})
        .catch(err => {
            return res.status(500).json({error : err.message})
        })

        if(blog.draft && !draft){
            return res.status(500).json({error : "you can not access draft blogs"})
        }

        return res.status(200).json({blog})
    })
    .catch(err => {
        return res.status(500).json({error:err.message})
    })
})










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

server.post("/change-password" , verifyJWT , (req,res) => {
    let { currentPassword , newPassword } = req.body
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
        return res.status(403).josn({error : " password should be 6 to 20 characters long with a numeric , 1 lowercase and 1 uppercase letter "})
    }

    User.findOne({ _id : req.user })
    .then((user) => {
        if(user.google_auth){
            return res.status(403).json({error : "you cant change account password because you are logged in using google"})
        }

        bcrypt.compare(currentPassword , user.personal_info.password, (err,result) => {
            if(err){
                return res.status(500).json({error : "some error occured while changing the password , pleaase try again later"})
            }
            if(!result){
                return res.status(403).json({error : "incorrect current password"})
            }
            bcrypt.hash(newPassword,10, (err, hashed_password) => {
                User.findOneAndUpdate({ _id : req.user } , {"personal_info.password": hashed_password})
                .then((u) => {
                    return res.status(200).json({status : 'password changed'})
                })
                .catch(err => {
                    return res.status(500).json({error : "some error occurred while saving new password , please try again later"})
                })
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : "user not find"})
    })


})



server.post('/create-blog', verifyJWT ,(req,res) => {
    let { title,des,tags,content,draft ,id} = req.body
    // console.log(content)
    console.log("req.bosy is  == ", req.body)
    let authorId = req.user;

    if(!title.length){
        return res.status(403).json({error:"tou must provide a title"})
    }   
    
    

    if(!draft){
    
        if(!title.length){
            return res.status(403).json({error:"tou must provide a title"})
        }        
        if(!des.length || des.length>200){
                return res.status(403).json({error:"description must be between 1 and 200"})
        }
        // if(!content.block.length){
        //     xout << " m !content.block.length me aaya "
        // }
    }

    
    // converting tags to lower case tech,Tech shoulf be treated same 
    tags = tags.map(tag=> tag.toLowerCase());

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g,"-").trim() + nanoid();
    // special chara in title will be reapladced by ' ' nd replace it with -
    console.log(blog_id)

    if(id){
        Blog.findOneAndUpdate({ blog_id }, { title,des,content,tags,draft:draft ? draft : false })
        .then( () => {
            return res.status(200).json({id: blog_id})
        })
        .catch(err => {
            return res.status(500).json({error : err.message})
        })
    }
    else {
        let blog = new Blog({
        
            title,des,content,tags,author:authorId,blog_id,draft: Boolean(draft) 
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
    }

    // return res.json({status:"done"})

})

// Endpoint to handle liking/unliking a blog
server.post("/like-blog", verifyJWT, async (req, res) => {
    const user_id = req.user;
    const { _id, islikedByUser } = req.body;

    // Determine if we are adding or removing a like
    const incrementVal = !islikedByUser ? 1 : -1;

    try {
        // First, find the blog and increment total_likes
        const blog = await Blog.findOneAndUpdate(
            { _id }, 
            { $inc: { "activity.total_likes": incrementVal } }, 
            { new: true } // This will return the updated blog
        );

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // If the blog is liked, create a notification
        if (!islikedByUser) {
            const likeNotification = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            });

            // Save the notification to the database
            await likeNotification.save();
            return res.status(200).json({ liked_by_user: true });
        } else {
            // If the blog is unliked, remove the notification
            const deletedNotification = await Notification.findOneAndDelete({
                user: user_id,
                blog: _id,
                type: "like"
            });

            // If the notification was found and deleted
            if (deletedNotification) {
                return res.status(200).json({ liked_by_user: false });
            } else {
                return res.status(404).json({ error: "Notification not found" });
            }
        }

    } catch (err) {
        // Handle any errors that occur
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// Endpoint to check if a blog is liked by a user
server.post("/isliked-by-user", verifyJWT, async (req, res) => {
    const user_id = req.user;
    const { _id } = req.body;

    try {
        // Check if a "like" notification exists for this user and blog
        const isLiked = await Notification.exists({
            user: user_id,
            type: "like",
            blog: _id
        });

        return res.status(200).json({ result: Boolean(isLiked)});

    } catch (err) {
        // Handle any errors that occur
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

server.post("/add-comment", verifyJWT , (req,res) => {
    console.log("m aayta add comment me ")
    let user_id = req.user
    let{_id, comment , blog_author , replying_to } = req.body 

    if(!comment.length){
        return res.status(403).json({error :" write something to leave a comment "})
    }

    // creatinf a comment des
    let commentObj  = {
        blog_id : _id, blog_author, comment , commented_by : user_id  
    }

    if(replying_to){
        commentObj.parent = replying_to
        commentObj.isReply = true;
    }

    console.log("m yaha tk aauya commentObj")

    new Comment(commentObj).save().then(async commentFile => {
        let {  comment, commentedAt , children } = commentFile

        Blog.findOneAndUpdate({_id},{ $push:{"comments": commentFile._id} , $inc : {"activity.total_comments": 1 , "activity.total_parent_comments" : replying_to ? 0 : 1 }})
        .then(blog => {
            console.log("new comment created")
            
        })

        let notificationObj = {
            type : replying_to ? "reply" : "comment",
            blog : _id ,
            notification_for : blog_author,
            user : user_id ,
            comment : commentFile._id
        }


        if(replying_to){
            notificationObj.replied_on_comment = replying_to;
            await Comment.findOneAndUpdate({_id : replying_to} ,{$push : { children : commentFile._id }} )
            .then(replyingToCommentDoc => {
                notificationObj.notification_for = replyingToCommentDoc.commented_by 
            })
            
        }


        new Notification(notificationObj).save().then(notification => console.log("new notificatin created"))

        return res.status(200).json({
            comment,commentedAt,_id:commentFile._id,user_id, children
        })
    })
    .catch(err => {
        console.log("add-commetn ke error section ke aaay")
        return res.status(403).json({
            error : err.message
        })
    })

})

server.post("/get-blog-comments", (req,res) => {
    let { blog_id , skip } = req.body;
    let maxLimit = 5;
    Comment.find({blog_id , isReply : false})
    .populate("commented_by","persoanal_info.username personal_info.fullname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({
        'commentedAt' : -1
    })
    .then(comment => {
        return res.status(200).json(comment)
    })
    .catch(err => {
        console.log(err.message)
        return res.status(500).json({error : err.message})
    })
})

server.post("/get-replies", (req,res) => {
    console.log("m req.body hun get-replies ke " , req.body)
    let { _id , skip } = req.body
    let maxLimit = 5
    Comment.findOne({_id})
    .populate({
        path  : "children",
        options : {
            limit : maxLimit,
            skip : skip,
            sort : {'commentedAt' : -1}
        },
        populate : {
            path : 'commented_by',
            select : "personal_info.profile_img personal_info.fullname personal_info.username"
        },
        select : "-blog_id -updatedAt"
    })
    .select("children")
    .then(doc => {
        return res.status(200).json({replies:doc.children})
    })
    .catch(err => {
        console.log("ma erroe me aatay get-replises ke")
        return res.status(500).json({error : err.message})
    })
})

const deleteComments = (_id) => {
    Comment.findOneAndDelete({_id})
    .then(comment => {
         if(comment.parent){
            Comment.findOneAndUpdate({_id : comment.parent} , {$pull : {children : _id}})
            .then(data => console.log("comment dekete from parent "))
            .catch(err => console.log(err))
        }

        Notification.findOneAndDelete({comment : _id}).then(notification => console.log('comment notification deleted'))

        Notification.findOneAndDelete({reply : _id}).then(notification => console.log('reply notifivcation deleted'))


        Blog.findOneAndUpdate({_id : comment.blog_id} , {$pull : {comments : _id} , $inc : {"activity.total_comments" : -1} , "activity.total_parent_comments" : comment.parent ? 0 : -1})
        .then(blog => {
            console.log(blog)
            if(comment.children.length){
                comment.children.map(replies => {
                    deleteComments(replies)
                })
            }
        })
    })
    .catch(err => {
        console.log(err.message)
    })
}


server.post("/delete-comment", verifyJWT ,(req,res) => {
    let user_id = req.user
    let {_id} = req.body
    Comment.findOne({_id})
    .then(comment => {
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if(user_id == comment.commented_by || user_id == comment.blog_author){
            deleteComments(_id)

            return res.status(200).json({status : 'done'})
        }
        else {
            return res.status(402).json({error : "you cann not delete this ccommetn"})
        }
    })
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
 