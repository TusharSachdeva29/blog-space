import { Toaster } from "react-hot-toast"
import { useState } from "react";


const NotificationCommentField = () => {
    let [ comment , setComment ] = useState('');

    const handleComment = () => {
        console.log('clicked')
    }
    
    return (
        <>

            <Toaster/>
            <textarea value = {comment} onChange={(e) => setComment(e.target.value)} placeholder="leave a reply .. " className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"></textarea>
            <button className="btn-dark mt-5px-10"
                onClick={handleComment}
            > Reply
            </button>

        </>
    )
}

export default NotificationCommentField