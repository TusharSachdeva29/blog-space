import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { useEffect, useState, createContext } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages"
import Homepage from "./pages/home.page";
export const UserContext = createContext();

const App = () => {
  const [userAuth, setUserAuth] = useState({ username: null, access_token: null });

  useEffect(() => {
    const userInSession = lookInSession("user");
    if (userInSession && typeof userInSession === "string") {
      try {
        const userData = JSON.parse(userInSession);
        setUserAuth(userData);
      } catch (error) {
        console.error("Failed to parse user session:", error);
        setUserAuth({ username: null, access_token: null });
      }
    } else {
      setUserAuth({ username: null, access_token: null });
    }
  }, [lookInSession]);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path ="/editor" element = {<Editor/>} />
        <Route path="/" element={<NavBar />} >
          <Route index element={<Homepage/>}/>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;