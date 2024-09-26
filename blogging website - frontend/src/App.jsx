import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { useEffect, useState, createContext } from "react";
import { lookInSession } from "./common/session";

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
        <Route path="/" element={<NavBar />} >
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;