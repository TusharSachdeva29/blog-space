import logo from "../imgs/logo.png";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import UserNavigationPannel from "./user-navigation.component";
import axios from "axios";

const NavBar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

  const [UserNavPannel , setUserNavPanel] = useState(false);


  const { userAuth , setUserAuth} = useContext(UserContext);
  const { access_token, profile_img , new_notification_available } = userAuth;

  useEffect(() => {
    if(access_token){
      axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification" , {
        headers : {
          'Authorization' : `Bearer ${access_token}`
        }
      })
      .then(({data}) => {
        setUserAuth({...userAuth , ...data})
      })
      .catch(err => {
        console.log(err)
      })
    }
  },[access_token])

  const toggleSearchBoxVisibility = () => {
    setSearchBoxVisibility((prev) => !prev);
  };

  const handleUserNavPanel = () => {
    setUserNavPanel(val => !val);
  }

  let navigate = useNavigate()

  const handleBlur = () => {
    setTimeout(() => {
        setUserNavPanel(false);
    },200)//if i dont use timeout and then click on profile onBlur will make me away ratrher than redirecting to profile so by dpoing this i will redirect first to profile than vlurring ..
    
  }

  const handleSearch = (e) => {
    let query = e.target.value;
    console.log(e)
    if(e.keyCode == 13 && query.length){
      navigate(`/search/${query}`)
    }
  }

  return (
    <div>
      <nav className="navbar z-50">
        {/* Logo */}
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="Logo" className="w-full" />
        </Link>

        {/* console.log(new_notification_available) */}



        {/* Search Box Toggle Button */}
        <button
          className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center ml-auto"
          onClick={toggleSearchBoxVisibility}
          aria-label="Toggle search box"
        >
          <i className="fi fi-rr-search text-xl"></i>
        </button>

        {/* Search Box */}
        <div
          className={`absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-5 flex items-center ${
            searchBoxVisibility ? "block" : "hidden"
          } md:flex md:relative md:inset-0 md:p-0 md:w-auto`}
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-grey p-4 pl-10 pr-10 rounded-full placeholder:text-dark-grey md:pl-12"
              onKeyDown={handleSearch}
            />
            <i className="fi fi-rr-search absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-grey text-2xl"></i>
          </div>
        </div>

        {/* Write Link (visible on larger screens) */}
        <Link to="/editor" className="hidden md:flex gap-2 ml-auto">
          <i className="fi fi-rr-file-edit"></i>
          <p>Write</p>
        </Link>

        {/* User Options */}
        {access_token ? (
          <>
            <Link to="/dashboard/notifications">
              <button
                className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10"
                aria-label="Notifications"
              >
                <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                {
                  new_notification_available ?                 <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span> : ""
                }



                
              </button>
            </Link>
            <div className="relative" onClick={handleUserNavPanel} onBlur = {handleBlur}>
              <button className="w-12 h-12 mt-1" aria-label="User Profile">
                <img
                  src={profile_img || "default-profile.png"}
                  className="w-full h-full object-cover rounded-full"
                  alt="User Profile"
                />
              </button>
              {
                UserNavPannel ? <UserNavigationPannel /> : ""
              }
            </div>
          </>
        ) : (
          <>
            <Link className="btn-dark py-2" to="/signin">
              Sign In
            </Link>
            <Link className="btn-light py-2 hidden md:block" to="/signup">
              Sign Up
            </Link>
          </>
        )}
      </nav>

      <Outlet />
    </div>
  );
};

export default NavBar;
