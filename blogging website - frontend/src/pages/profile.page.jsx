import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InpageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {
    youtube: "https://www.youtube.com/yourchannel",
    github: "https://github.com/yourusername",
    instagram: "https://www.instagram.com/yourusername",
    twitter: "https://twitter.com/yourusername",
    linkedin: "https://www.linkedin.com/in/yourusername",
  },
  joinedAt: " ",
};


const ProfilePage = () => {
  let { id: profileId } = useParams(); // Get the profile ID from the route params

  const [profile, setProfile] = useState(profileDataStructure); // State for profile data
  const [loading, setLoading] = useState(true); // Loading state
  const [blogs, setBlogs] = useState(null); // State for user's blogs

  const { personal_info, account_info, social_links, joinedAt } = profile;
  const { fullname, username: profile_username, profile_img, bio } = personal_info;
  const { total_posts, total_reads } = account_info;

  const { userAuth: { username } } = useContext(UserContext); // Get the current user's info from context

  let [profileLoaded , setProfileLoaded] = useState("")

  // Fetch the user's profile
  const fetchUserProfile = () => {
    setLoading(true);
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId })
      .then(({ data: user }) => {
        if(user){
            setProfile(user);
        }
        setProfileLoaded(profileId)
        getBlogs({ user_id: user._id }); // Fetch the blogs of the user
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false); // Stop loading in case of error
      });
  };

  // Fetch the user's blogs
  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id ?? blogs?.user_id; // Use user_id from state if available

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        });
        formatedData.user_id = user_id;
        setBlogs(formatedData); // Set the blogs state with the updated data
        setLoading(false); // Stop loading once blogs are loaded
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  // Fetch profile and blogs when profileId changes
  useEffect(() => {
    if (profileId !== profileLoaded) {
        setBlogs(null)
    }
    if(blogs == null) {
        resetState();
        fetchUserProfile();
    }

  }, [profileId, blogs]);

  // Reset state on profileId change
  const resetState = () => {
    setProfile(profileDataStructure);
    // setBlogs(null);
    setLoading(true);
    setProfileLoaded("");
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
                <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                <div className="flex flex-col max-md:items-center gap-5 min-w-[250-px] md: w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px]">
                    <img
                    src={profile_img}
                    alt={`${fullname}'s profile`}
                    className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
                    />
                    <h1 className="text-2xl font-medium">@{profile_username}</h1>
                    <p className="text-xl capitalize h-6">{fullname}</p>

                    <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>

                    <div className="flex gap-4 mt-2">
                    {profileId === username ? (
                        <Link to="/settings/edit-profile" className="btn-light rounded-md">
                        EDIT PROFILE
                        </Link>
                    ) : (
                        ""
                    )}
                    </div>

                    <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />
                </div>

                <div className="max-md:mt-12 w-full">
                    <InpageNavigation routes={["blogs published", "About"]} defaultHidden={["About"]}>
                    <>
                        {!blogs ? (
                        <Loader />
                        ) : blogs.results.length ? (
                        blogs.results.map((blog, i) => (
                            <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={blog.id || i}>
                            <BlogPostCard content={blog} author={blog.author.personal_info} />
                            </AnimationWrapper>
                        ))
                        ) : (
                        <NoDataMessage message="No blogs published" />
                        )}
                        <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
                    </>
                    <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                    </InpageNavigation>
                </div>
                </section> 
      ) : <PageNotFound/>}
    </AnimationWrapper>
  );
};

export default ProfilePage;
