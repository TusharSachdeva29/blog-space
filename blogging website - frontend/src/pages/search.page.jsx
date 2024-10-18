import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InpageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component"; 
import LoadMoreDataBtn from "../components/load-more.component";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

const SearchPage = () => {
    const { query } = useParams(); // Retrieve the search query from the URL
    const [blogs, setBlog] = useState(null); // State for blog data
    const [users,setUsers] = useState(null)
    const [loading, setLoading] = useState(false); // State for loading

    // Function to handle blog search
    const searchBlogs = ({page = 1, create_new_arr = false}) => {
        setLoading(true); // Set loading state to true
        setBlog(null); // Clear current blogs

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, { query, page })
        .then(async ({ data }) => {
            let formatedData = await filterPaginationData({
                state: create_new_arr ? null : blogs, // Clear previous blogs if creating new array
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr
            });
            setBlog(formatedData); // Update the blog state with new data
        })
        .catch(err => {
            console.log("Error:", err);
        })
        .finally(() => {
            setLoading(false); // Set loading to false once done
        });
    };

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+ "/search-users",{query})
        .then(({data:{users}}) => {
            setUsers(users)
            console.log(users)
        })
    }

    // Effect that runs when the query changes
    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers()
    }, [query]);

    const resetState = () =>{
        setBlog(null)
        setUsers(null)
    }

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader/> :
                        users.length ? 
                            users.map((user, i) => {
                                return <AnimationWrapper key={i} transition={{duration:1 , delay:i*0.08}}>

                                    <UserCard user={user}/>
                                    
                                </AnimationWrapper>
                            }) : 
                            <NoDataMessage message = " no user find"/>

                }
            </>
        )
    }

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InpageNavigation 
                    routes={[`Search results for "${query}"`, "Accounts Matched"]} 
                    defaultHidden={["Accounts Matched"]}
                >
                    <>
                        {loading ? ( // Show Loader when loading
                            <Loader />
                        ) : blogs && blogs.results.length ? ( // Display blogs if available
                            blogs.results.map((blog, i) => (
                                <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={blog.id || i}>
                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                </AnimationWrapper>
                            ))
                        ) : (
                            <NoDataMessage message="No blogs published" /> // Show no data message
                        )}
                        <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs}/>
                    </>

                    <UserCardWrapper>

                    </UserCardWrapper>
                </InpageNavigation>
            </div>
            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">

                    <h1 className="font-medium text-xl mb-8">user related to search <i className="fi fi-rr-user mt-1"></i></h1>

                    <UserCardWrapper/>

            </div>
        </section>
    );
};

export default SearchPage;
