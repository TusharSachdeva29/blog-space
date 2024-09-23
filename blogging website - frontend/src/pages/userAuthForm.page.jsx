import { Link } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const UserAuthForm = ({ type }) => {
    const authForm = useRef();

    const userAuthThroughServer = async (serverRoute, formData) => {
        console.log(import.meta.env);

        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData);
            console.log(data);
            toast.success("Authenticated successfully!");
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.error);
            } else {
                toast.error("An error occurred while trying to authenticate.");
                console.error("Error:", error);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        let serverRoute = type === "sign-in" ? "/signin" : "/signup";
        console.log("Server Route:", serverRoute); // Log server route
    
        const form = new FormData(authForm.current);
        let formData = {};
    
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
    
        let { fullname, email, password } = formData;
    
        if (type !== "sign-in" && !fullname) {
            return toast.error("Please enter your full name");
        }
    
        if (!email || !password) {
            return toast.error("Please fill all the fields");
        }
    
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    
        if (!emailRegex.test(email)) {
            return toast.error("Invalid email format");
        }
        if (!passwordRegex.test(password)) {
            return toast.error(
                "Password must be 6-20 characters, include at least one number, one uppercase, and one lowercase letter."
            );
        }
    
        userAuthThroughServer(serverRoute, formData);
    };

    return (
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                <form className="w-[80%] max-w-[400px]" ref={authForm} onSubmit={handleSubmit}>
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type === "sign-in" ? "Welcome back" : "Join us today"}
                    </h1>

                    {type !== "sign-in" && (
                        <InputBox 
                            name="fullname" 
                            type="text"
                            placeholder="Full Name"
                            icon="fi-rr-user"
                        />
                    )}

                    <InputBox 
                        name="email"
                        type="text"
                        placeholder="Email"
                        icon="fi-rr-envelope"
                    /> 
                    <InputBox 
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon="fi-rr-key"
                    /> 

                    <button className="btn-dark center mt-14" type="submit">
                        {type === "sign-in" ? "Sign In" : "Sign Up"}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black"/>
                        <p>or</p>
                        <hr className="w-1/2 border-black"/>
                    </div>

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
                        <img src={googleIcon} className="w-5" alt="Google Icon"/>
                        Continue with Google
                    </button>

                    {type === "sign-in" ? (
                        <p className="text-dark-grey text-xl text-center">
                            Don't have an account? 
                            <Link to="/signup" className="text-black text-xl ml-1">
                                Join us today
                            </Link>
                        </p>
                    ) : (
                        <p className="text-dark-grey text-xl text-center">
                            Already a member?
                            <Link to="/signin" className="text-black text-xl ml-1">
                                Sign in here.
                            </Link>
                        </p>
                    )}
                </form>
            </section>
        </AnimationWrapper>
    );
};

export default UserAuthForm;
