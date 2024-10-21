import { Link, useNavigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import { useRef } from "react";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor.pages";
import EditorJs from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { Toaster, toast } from "react-hot-toast";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {
    let {blog, blog: {title,des,content,tags},setBlog,textEditor,setTextEditor,setEditorState } = useContext(EditorContext)

    console.log(blog)


    let { userAuth: { access_token } } = useContext(UserContext);  // Fix here

    let navigate = useNavigate();

    // Use Effect for initializing Editor.js
    useEffect(() => {

        // let editorl = new EditorJs({
        //     holder: 'textEditor',
        //     data: '',
        //     placeholder: "lets wrtie an awersome story"
        // })

        if (!textEditor.isReady) {
            setTextEditor(new EditorJs({
                holder: "textEditor",
                data: content,  
                tools: tools,
                placeholder: "Let's write an awesome story"
            }));
        }
    },[]);


    

    const handleBannerUpload = (e) => {
        // let img = e.target.files[0];
        // const reader = new FileReader();
        // reader.onloadend = () => {
        //     setBlog({ ...blog, banner: reader.result });
        // };
        // if (img) {
        //     reader.readAsDataURL(img);
        // }
    };

    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) { // Enter key
            e.preventDefault();
        }
    };

    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";
        setBlog({ ...blog, title: input.value });
    };

    const handleSaveDraft = (e) => {
        console.log("m saaaave draft me aayaa")
        if (e.target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            console.log("maa title.length mea aay",title.length)
             toast.error("Write blog title before saving as draft");
             return 
        }

        let loadingToast = toast.loading("Saving draft...");

        e.target.classList.add('disable');

        // if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title, des, content, tags, draft: true
                };
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                .then(() => {
                    toast.dismiss(loadingToast);
                    e.target.classList.remove('disable');
                    toast.success("Saved as draft");

                    setTimeout(() => {
                        navigate("/");
                    }, 500);
                })
                .catch(({ response }) => {
                    toast.dismiss(loadingToast);
                    e.target.classList.remove('disable');
                    return toast.error(response.data.error);
                });
            });
        // }

        // else return toast.error("Editor is not initialized yet");
    };

const handlePublishEvent = (e) => {
        // Check if the blog title is empty
        e.preventDefault()
        if (!title.length) {
            return toast.error("Write blog title to publish it");
        }
    
        // Check if Editor.js is ready and validate content

        if (textEditor.isReady) {
        console.log("ma aasdfsdfasas")
            textEditor.save().then(data => {
                console.log("ma aya otext editor")

                console.log(data)
                // Check if there is actual content to publish
                if (!data.blocks.length) {
                    return toast.error("Write something in your blog to publish it");
                }

                console.log(" ma set blog pr aaayua huyn deakgkgggggg")
                setBlog({ ...blog, content: data });
                setEditorState("publish");
            }).catch(err => {
                // Handle any errors that occur while saving content
                console.error("Error saving editor content:", err);
                return toast.error("Something went wrong while saving your blog content.");
            });
        }
        else {
            console.log("text editor ke maa chudd rhe hai")
        }
    };
    

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex none w-10">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden text-black line-clamp w-full">
                    {title.length ? title : "New Blog"}
                </p>
                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" onClick={handlePublishEvent}>Publish</button>
                    <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>

            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img src={defaultBanner} className="z-20" />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder="Blog title"
                            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>

                        <hr className="w-full opacity-10 my-5" />

                        <div id="textEditor" className="font-gelasio"></div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
};

export default BlogEditor;
