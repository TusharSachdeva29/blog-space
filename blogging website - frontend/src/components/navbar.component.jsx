import logo from "../imgs/logo.png"
import {Link} from "react-router-dom"


const NavBar = () => {
    return (
      
      <nav className = "navbar">
        {/* link for if  person clickas on it redirects ot home apage  */}
        {/* to use any react router dom we have to werap APp component in browser router thing  */}
        <Link to="/" className="flex-none w-10"> 
          <img src = {logo} className="w-full"  />
        </Link>
          
      </nav>
    );
}

export default NavBar;
