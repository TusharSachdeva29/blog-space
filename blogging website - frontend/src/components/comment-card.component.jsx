import { Children, useContext, useState } from "react"
import { getDay } from "../common/date"
import { UserContext } from "../App"
import toast from "react-hot-toast"
import CommentFeild from "./comment-field.component"
// import BlogContent from "./blog-content.component"
import { BlogContext } from "../pages/blog.page"
import axios from "axios"

    const CommentCard = ({index , leftval , commentData}) => {
        let { commented_by : {personal_info : {profile_img , fullname , username : commented_by_username}} , commentedAt , comment , _id , children} = commentData

        let { userAuth : {access_token , username} } = useContext(UserContext)

        let {blog , blog : {comments, activity ,activity:{total_parent_comments} ,comments : {results : commentsArr} , author : {personal_info : {username : blog_author}}} , setBlog , setTotalParentsCommentsLoaded}= useContext(BlogContext)

        const [isReplying , setReplying ] = useState(false)

        const handleReplyClick = () => {
            if(!access_token){
                toast.error("login to reply ..")
            }
            
            setReplying(preVal => !preVal)
            
        }

        const getParentIndex = () => {
            let startingPoint = index - 1

            try{
                while(commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel){
                    startingPoint--;

                }
            }
            catch{
                startingPoint = undefined
            }
            return startingPoint
        }

        
const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
        while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
            commentsArr.splice(startingPoint, 1);
            if (!commentsArr[startingPoint]) {
                break;
            }
        }
    }

    if (isDelete) {
        let parentIndex = getParentIndex();
        if (parentIndex != undefined) {
            commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(
                (child) => child != _id
            );

            if (!commentsArr[parentIndex].children.length) {
                commentsArr[parentIndex].isReplyLoaded = false;
            }
        }
        commentsArr.splice(index,1);
    }

    if (commentData.childrenLevel === 0 && isDelete) {
        setTotalParentsCommentsLoaded((preVal) => preVal - 1);
    }
    setBlog({...blog , comments:{results : commentsArr} , activity :{...activity , total_parent_comments : total_parent_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0)}})
};

        const hideReplies = () => {
            commentData.isReplyLoaded = false;
            removeCommentsCards(index+1)

        }

        const loadReplies = ({skip = 0 , currentIndex = index}) => {



            if(commentsArr[currentIndex].children.length ){
                hideReplies();
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies" , {
                    _id : commentsArr[currentIndex]._id, skip
                })
                .then(({data : {replies}}) => {
                    commentsArr[currentIndex].isReplyLoaded = true
                    for(let i=0;i<replies.length ; i++){
                        replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;

                        commentsArr.splice(currentIndex +1+i+skip , 0,replies[i])
                    }



                    setBlog({...blog , comments : {...comments , results: commentsArr}})
                })
                .catch(err => {
                    console.log(err)
                })


            }
        
        }

        const deleteComment = (e) => {
            e.target.setAttribute("disabled", true);

            // removeCommentsCards(index + 1, true);
        
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(() => {
                e.target.removeAttribute("disabled");
                // toast.success("comment deleted succ")
        
                
                removeCommentsCards(index+ 1 , true)
            })
            .catch(err => {
                console.log(err)
        })


        }

        const LoadMoreReplyButton = () => {

            let parentIndex = getParentIndex()

            let button = <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            onClick={() => loadReplies({ skip: index - parentIndex , currentIndex : parentIndex })}
            >Load More Replies</button>

            if(commentsArr[index + 1]){
                if(commentsArr[index+1].childrenLevel < commentsArr[index].childrenLevel){

                    if((index - parentIndex) < commentsArr[parentIndex].children.length){
                        return button
                    }
                }
            }else {
                if(parentIndex){
                    if((index - parentIndex) < commentsArr[parentIndex].children.length){
                        return button
                    }
                }
            }
            
        }
        

    return (
        

        <div className="w-full" style = {{paddingLeft : `${leftval * 10}px`}} >

            <div className="my-5 p-6 rounded-md border border-grey">

                <div className="flex gap-3 items-center mb-8">

                    <img src={profile_img} className="w-6 h-6 rounded-full" />

                    <p className="line-clamp-1"> {fullname} @{commented_by_username}  </p>

                    <p className="min-w-fit"> {getDay(commentedAt)} </p>

                </div>

                <p className="font-gelasio text-xl ml-3"> {comment} </p>

                <div className="flex gap-5 items-center mt-5">

                    {
                        commentData.isReplyLoaded ? 
                        <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" 
                            onClick={hideReplies}
                        >
                            <i className="fi fi-rs-comment-dots"></i>
                            Hide Reply
                        </button> : 

                        <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" 
                            onClick={loadReplies}
                        >
                        <i className="fi fi-rs-comment-dots">{" " + children.length}</i>

                        Reply
                            
                        </button>
                    }

                    <button className="underline" onClick ={handleReplyClick} >
                        Reply
                    </button>

                    {
                        username == commented_by_username || username == blog_author ? 
                        <button className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center" onClick={deleteComment}>

                            <i className="fi fi-rr-trash pointer-events-none"></i>

                        </button> : ""
                    }
                </div>

                {
                    isReplying ? 
                    <div className="mt-8">
                        <CommentFeild action = "reply" index={index} 
                            replyingTo={ _id } setReplying={setReplying}
                        />
                    </div> : ""
                }

            </div>

            <LoadMoreReplyButton />

        </div>
        
    )
}

export default CommentCard