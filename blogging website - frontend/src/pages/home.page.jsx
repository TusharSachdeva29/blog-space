import AnimationWrapper from "../common/page-animation";
import InpageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";

import { activeTabLineRef , activeTabRef } from "../components/inpage-navigation.component";

const Homepage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);

  let [pageState, setpageState ] = useState("home")

  const categories = ["programming", "hollywood", "film making", "finances", "cooking", "gym", "travel"];

  const fetchLatestBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
      .then(({ data }) => {
        console.log(data.blogs);
        setBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        console.log(data.blogs);
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const loadBlogByCategory = (category) => {
    

    setBlogs(null); 
    if(pageState === category){
      setpageState("home");
      return;
    }
    setpageState(category);
  }
  
  useEffect(() => {
    
    activeTabRef.current.click();

    if(pageState == "home"){
        fetchLatestBlogs();
    }

    if(!trendingBlogs){
        fetchTrendingBlogs();
    }

  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest blogs */}
        <div className="w-full">
          <InpageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
            <>
              {blogs == null ? (
                <Loader />
              ) : (
                blogs.map((blog, i) => (
                  <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={blog.id || i}>
                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                  </AnimationWrapper>
                ))
              )}
            </>
            <>
              {trendingBlogs == null ? (
                <Loader />
              ) : (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={blog.id || i}>
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              )}
            </>
          </InpageNavigation>
        </div>

        {/* Filter and Trending Blogs Section */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            {/* Category Filter Section */}
            <>
      <h1 className="font-medium text-xl">Stories from all interests</h1>
      <div className="flex gap-3 flex-wrap">
        {categories.map((category, i) => (
          <button
            onClick={() => loadBlogByCategory(category)}
            className={`tag ${pageState === category ? "bg-black text-white" : " "}`}
            key={i}
          >
            {category}
          </button>
        ))}
      </div>
    </>

            {/* Trending Blogs Section */}
            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up" />
              </h1>

              {trendingBlogs == null ? (
                <Loader />
              ) : (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={blog.id || i}>
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Homepage;
