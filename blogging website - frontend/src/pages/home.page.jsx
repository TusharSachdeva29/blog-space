import AnimationWrapper from "../common/page-animation"
import InpageNavigation from "../components/inpage-navigation.component"
import axios from "axios"
import { useEffect, useState } from "react"
import Loader from "../components/loader.component"
import BlogPostCard from "../components/blog-post.component"
import MinimalBlogPost from "../components/nobanner-blog-post.component"

const Homepage = () => {

    let [ blogs,setBlog] = useState(null)
    let [ trendingBlog,setTrendingBlog] = useState(null)

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
        .then(({data}) => {
            console.log(data.blogs)
            setBlog(data.blogs)
        })
        .catch((err) => {
            console.log(err)
        })  
    }
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
        .then(({data}) => {
            // console.log(trendingBlog.blogs)
            setTrendingBlog(data.blogs)
        })
        .catch((err) => {
            console.log(err)
        })  
    }

    useEffect(() => {
        fetchLatestBlogs()
        fetchTrendingBlogs();
    },[])

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
{/* latest blogs */}
                <div className="w-full">

                    <InpageNavigation routes={["home","trending blogs"]} defaultHidden={["trending blogs"]}>

                        <>
                            {
                                blogs == null ? <Loader/> : blogs.map((blog,i) => {
                                    return <AnimationWrapper transition={{duration:1,delay:i *.1}} key={i} ><BlogPostCard content={blog} author={blog.author.personal_info}/></AnimationWrapper>
                                })
                            }
                        </>

                        {
                                trendingBlog == null ? <Loader/> : trendingBlog.map((blog,i) => {
                                    return <AnimationWrapper transition={{duration:1,delay: i*.1}} key={i} >
                                        
                                        <MinimalBlogPost blog={blog} index={i}/>
                                        
                                    </AnimationWrapper>
                                })
                        }

                    </InpageNavigation>
                    
                </div>
{/* filtert and trendign blogs */}
                <div className="min-w-[40%] lg:min-w-p[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">

                    <div className="flex flex-col gap-10 ">
                        
                        <h1 className="font-medium text-xl">  stories form all interests </h1>

                    </div>

                </div>
                
            </section>
        </AnimationWrapper>
    )
}
export default Homepage