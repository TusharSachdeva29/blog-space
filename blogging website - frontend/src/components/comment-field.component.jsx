import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
// import BlogContent from "./blog-content.component";
import { BlogContext } from "../pages/blog.page";

const CommentFeild = ({ action }) => {

    let { blog, blog: { _id, author: { _id: blog_author }, comments, activity , activity:{total_comments, total_parent_comments} }, setBlog, setTotalParentsCommentsLoaded } = useContext(BlogContext);


    

    let { userAuth : {access_token , username , fullname, profile_img}  } = useContext(UserContext)
 
    const [ comment , setComment ] = useState("");

    const handleComment = () => {
        if(!access_token){
            return toast.error("Please login to comment");
        }
        if(!comment.length){
            return toast.error("write something to leave a comment .... ")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment" , {
            _id , blog_author , comment 
        },{
            headers : {
                'Authorization' : `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            console.log(data)

            setComment("")
            data.commented_by = { personal_info: {username, profile_img, fullname} }

            let newCommentArr;

            data.childrenLevel = 0;

            newCommentArr = [data]
            let parentCommentIncrementaval = 1;

            setBlog({ ...blog,comments:{...comments , results : newCommentArr} , activity: {...activity , total_comments : total_comments + 1 , total_parent_comments : total_parent_comments + parentCommentIncrementaval} })


            setTotalParentsCommentsLoaded(preVal => preVal+ parentCommentIncrementaval)

        })
        .catch(err => {
            console.log("ma aaaa err mein")
            console.log(err.response)
        })
        
    }

    return (
        <>
            <Toaster/>
            <textarea value = {comment} onChange={(e) => setComment(e.target.value)} placeholder="leave a comment .. " className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"></textarea>
            <button className="btn-dark mt-5px-10"
                onClick={handleComment}
            > {action}
            </button>



        </>
    )
}

export default CommentFeild