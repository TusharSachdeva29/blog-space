import { useContext, useEffect } from "react"
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import {UserContext} from "../App"
import { connectAuthEmulator } from "firebase/auth";
import { Toaster , toast } from "react-hot-toast";
import axios from "axios";



const BlogInteraction = () => {

    let { blog,blog: {_id , title , blog_id,activity,activity: {total_likes, total_comments},author:{personal_info : {username : author_username}}} , setBlog , islikedByUser,setLikedByUser, setCommentsWrapper
} = useContext(BlogContext);


    let { userAuth : {username,access_token} } = useContext(UserContext)

    useEffect(() => {
        if(access_token ) {
            // make req to user to give like cointent
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",{_id},{
                headers : {
                    'Authorization' : `Bearer ${access_token}`
                }
            })
            .then(({data : {result}}) => {
                console.log(result)
                setLikedByUser(Boolean(result))
                
            })
            .catch(err => {
                console.log(" maain blog-interaction me aaya error dene")
                console.log(err)
            })
        }
    },[])

    const handleLike = () => {

        if(access_token){
            //like the blog
            console.log("liked")
            // console.log("preval is ", preVal)
            setLikedByUser(preVal => !preVal)
            !islikedByUser ? total_likes++ : total_likes--;
            setBlog({...blog, activity: {...activity, total_likes}})

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog" , {
                _id, islikedByUser },{
                    headers : {
                        'Authorization' : `Bearer ${access_token}`
                    }
                })
                .then(({data}) => {
                    console.log(data)
                })
                .catch(err => {
                    console.log(err)
                })

        }
        else{

            toast.error("please log-in to like this blog")

        }
    }


    return (
        <>
            <Toaster/>
            <hr className="border-grey my-2"/>

            <div className="flex gap-6 justify-between">
                
                <div className="flex gap-3 items-center">

                    {/* console.log(total_likes) */}
 
                     <button className={"w-10 h-10 rounded-full flex items-center justify-center " + ( islikedByUser ? "bg-red/20 text-red" : "bg-grey/80" ) }
                        onClick={handleLike}
                    >
                        <i className="fi fi-rr-heart"></i>
                    </button>

                    <p className="text-xl text-dark-grey">
                        
                        {total_likes} likes
                    </p> 

                   

                    <div className="flex gap-3 itmes-center ">

                    <button 
                        onClick={() => {
                            setCommentsWrapper(preVal => !preVal)
                        }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>

                    <p className="text-xl text-dark-grey">
                        {total_comments} 
                    </p>

                    </div>
                </div>

                <div className="flex gap-6 items-center">

                    {
                        username == author_username ? 
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">
                            Edit
                        </Link> : ""
                    }

                    <Link to={`https://twitter.com/intent/ttweet?text=Read ${title}&url=${location.href}`}>
                        <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
                    </Link>
                 </div>


            </div>

            <hr className="border-grey my-2"/>
        </>
    )
}

export default BlogInteraction


// let {
//     blog,
//     blog: {
//         _id,
//         title,
//         blog_id,
//         activity = { total_likes: 0, total_comments: 0 },
//         author: { personal_info: { username: author_username } = {} } = {},
//     } = {},
//     setBlog,
//     islikedByUser,
//     setLikedByUser,
//     setCommentsWrapper,
// } = useContext(BlogContext);
