import { useParams } from "react-router-dom"

const BlogPage = () => {

    let { blog_id } = useParams()
    console.log(blog_id)
    const fetchBlog = () => {
        axios.post("import.meta.env.VITE_SERVER_DOMAIN" + "get-blog",{blog_id})
    }
    return (
        <h1>helelo from blog page for - {blog_id}</h1>
    )
}

export default BlogPage