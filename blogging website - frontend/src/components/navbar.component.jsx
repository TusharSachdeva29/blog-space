import logo from "../imgs/logo.png";
import { Link,Outlet } from "react-router-dom";
import { useState } from "react";

const NavBar = () => {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

    return (
      <div>  
              <nav className="navbar relative flex items-center justify-between">
            {/* Link for if person clicks on it redirects to home page */}
            <Link to="/" className="flex-none w-10"> 
                <img src={logo} alt="Logo" className="w-full" />
            </Link>

            {/* Toggle button for the search box */}
            <button 
                className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center ml-auto"
                onClick={() => setSearchBoxVisibility(!searchBoxVisibility)}
            >
                <i className="fi fi-rr-search text-xl"></i>
            </button>

            {/* Search box */}
            <div className={`absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-5 flex items-center ${searchBoxVisibility ? "block" : "hidden"} md:flex md:relative md:inset-0 md:p-0 md:w-auto`}>
                <div className="relative w-full">
                    <input  
                        type="text" 
                        placeholder="search"
                        className="w-full bg-grey p-4 pl-10 pr-10 rounded-full placeholder:text-dark-grey md:pl-12"
                    />
                    <i className="fi fi-rr-search absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-grey text-2xl"></i>
                </div>
            </div>

            {/* Write link (visible on larger screens) */}
            <Link to="/editor" className="hidden md:flex gap-2 ml-auto">
                <i className="fi fi-rr-file-edit"></i>
                <p>write</p>
            </Link>
            
            <Link className="btn-dark py-2" to="/signin">
              sign In
            </Link>

            <Link className="btn-light py-2 hidden md:block" to="/signup">
              sign Up
            </Link>
        </nav>
        
        
        <Outlet />
      {/* outlet for nested routes in app.jsx abopve */}
      </div>
    );
}

export default NavBar;
