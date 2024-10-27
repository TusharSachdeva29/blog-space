import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import BlogContent from "./blog-content.component";
import { BlogContext } from "../pages/blog.page";

const CommentFeild = ({ action , index = undefined, replyingTo = undefined , setReplying }) => {

    let { blog, blog: { _id, author: { _id: blog_author }, comments,comments:{results: commentsArr},  activity , activity:{total_comments, total_parent_comments} }, setBlog, setTotalParentsCommentsLoaded } = useContext(BlogContext);

    

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
            _id , blog_author , comment , replying_to : replyingTo
        },{
            headers : {
                'Authorization' : `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            console.log("m hun data " , data)

            setComment("")
            data.commented_by = { personal_info: {username, profile_img, fullname} }

            let newCommentArr;

            if(replyingTo) {

                commentsArr[index].children.push(data._id)

                data.childrenLevel = commentsArr[index].childrenLevel + 1;

                data.parentIndex = index;

                commentsArr[index].isReplyLoaded = true

                commentsArr.splice(index+1, 0 , data)

                // jb reply  add krga 2 commemet pr toh it would be like 1 , 2 , 2->repy , 3 ,4 ..

                newCommentArr = commentsArr

                setReplying(false)

            }else {

                data.childrenLevel = 0;

                newCommentArr = [data, ...commentsArr]
            }


            let parentCommentIncrementaval = replyingTo ? 0 : 1;

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