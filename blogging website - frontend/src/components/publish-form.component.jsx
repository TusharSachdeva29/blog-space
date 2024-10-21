import AnimationWrapper from "../common/page-animation"
import {Toaster,toast } from "react-hot-toast"
import { EditorContext } from "../pages/editor.pages"
import { useContext } from "react"
import Tag from "./tags.component"
import axios from "axios"
import { UserContext } from "../App"
import { useNavigate } from "react-router-dom"
const PublishForm = () => {

    let { userAuth : {access_token} } = useContext(UserContext)

    let navigate = useNavigate()

    let characterLimit = 200;

    let { blog: {title,tags,des,content}, setEditorState,setBlog,blog } = useContext(EditorContext)

    const handleCloseEvent = () =>{
        setEditorState("editor")
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;
        setBlog({...blog , title: input.value})
    }
    const handleBlogDesChange = (e) => {
        let input = e.target;
        setBlog({...blog, des: input.value})
    }
    const handleTitleKeyDown = (e) =>{
        console.log(e)
        if(e.keyCode == 13){//enter key
          e.preventDefault();  
        }
      }
      const tagLimit = 10
    const handleKeyDown = (e) => {
        if(e.keyCode==13 || e.keyCode==108){
            e.preventDefault();
            let tag = e.target.value
            if(tags.length < tagLimit){
                if(!tags.includes(tag) &&  tag.length){
                    setBlog({...blog,tags:[...tags,tag]})
                }
            }
            else{
                toast.error(`you can add max {tagLimit} tags`)
            }
            e.target.value =  "";
        }
    }

    const publishBlog = (e) => {

        console.log(e)
        console.log("m aaataa")

        if(e.target.className.includes("disable")){
            return ;
        }

        if(!title.length){
            return toast.error("write blog title before publishing")
        }
        if(!des.length || des.length > characterLimit){
            return toast.error("write character description ")
        }
        if(!tags.length){
            return toast.error("enter at elast 1 tag to help us rank ur blog")
        }

        let loadingToast = toast.loading("publishing...")

        e.target.classList.add('disable') 

        let blogObj = {
            title,des,content,tags,draft:false
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",blogObj,{
            headers:{
                'Authorization' : `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast)
            e.target.classList.remove('disable')
            toast.success("published")

            setTimeout(() => {
                navigate("/")
            },500)
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast)
            e.target.classList.remove('disable')
            return toast.error(response.data.error)
        })
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster/>
 
                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>
                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">PREVIEW</p>
                    <div className="w-full aspect-vedio rounded-1g overflow-hidden bg-grey mt-4">
                        {/* <img src={banner}/> */}
                    </div>
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2"> {title}

                    </h1>
                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
                        {des}
                    </p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">blog title</p>
                    <input type="text" placeholder="blog title" defaultValue={title} className="input-box pl-4" onChange={handleBlogTitleChange}/>
                    <p className="text-dark-grey mb-2 mt-9">descition about your blog</p>
                    <textarea 
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                     >
                        
                    </textarea>    
                    <p className="mt-1 text-dark-grey text-sm text-right">
                        { characterLimit-des.length } characters left  
                    </p>         
                    <p className="text-dark-grey mb-2 mt-9">
                        topics - (helps is searching and ranking yout post)
                    </p>
                    <div className="realtive input-box pl-2 py-2 pb-4">
                            <input type="text" placeholder="topi" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                            onKeyDown={handleKeyDown}
                            />
                            { tags.map((tag,i) => {
                                return <Tag tag= {tag} tagIndex={i} key={i}/>
                            }) 
                            }
                    </div>
                    <button className="btn-dark px-6 mt-5" onClick={publishBlog}>
                            publish
                    </button>

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm