import logo from "../imgs/logo.png";
import { Link, Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import UserNavigationPannel from "./user-navigation.component";

const NavBar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

  const { userAuth } = useContext(UserContext);
  const { access_token, profile_img } = userAuth;

  const toggleSearchBoxVisibility = () => {
    setSearchBoxVisibility((prev) => !prev);
  };

  return (
    <div>
      <nav className="navbar relative flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="Logo" className="w-full" />
        </Link>

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
            <Link to="/dashboard/notification">
              <button
                className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10"
                aria-label="Notifications"
              >
                <i className="fi fi-rr-bell text-2xl block mt-1"></i>
              </button>
            </Link>
            <div className="relative">
              <button className="w-12 h-12 mt-1" aria-label="User Profile">
                <img
                  src={profile_img || "default-profile.png"}
                  className="w-full h-full object-cover rounded-full"
                  alt="User Profile"
                />
              </button>
              <UserNavigationPannel />
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