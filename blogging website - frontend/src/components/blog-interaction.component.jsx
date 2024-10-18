import { useContext } from "react"
import { BlogContext } from "../pages/blog.page";

const BlogInteraction = () => {

    let { blog: {blog_id,activity,activity: {total_likes},author:{personal_info : {username : author_username}}} , setBlog
} = useContext(BlogContext);


    return (
        <h1>helo form </h1>
    )
}

export default BlogInteraction