import { Link } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png"


const UserAuthForm = ({ type }) => {
    return (
        <section className="h-cover flex items-center justify-center">
            <form className="w-[80%] max-w-[400px]">
                <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                    {type === "sign-in" ? "Welcome back" : "Join us today"}
                </h1>

                {type !== "sign-in" ? 
                    <InputBox 
                        name="Full-Name"
                        type="text"
                        placeholder="full-name"
                        icon = "fi-rr-user"
                        /> 
                    : 
                    ""
                }
                <InputBox 
                    name="email"
                    type="text"
                    placeholder="email"
                    icon = "fi-rr-envelope"
                /> 
                <InputBox 
                    name="password"
                    type="password"
                    placeholder="password"
                    icon = "fi-rr-key"
                /> 

                <button className="btn-dark center mt-14"
                type = "submit">
                    {type.replace("-"," ")}
                </button>
                <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-blackfont-bold">
                    <hr className="w-1/2 border-black"/>
                    <p>or</p>
                    <hr className="w-1/2 border-black"/>
                </div>

                <button className = "btn-dark flex items-center justify-center gap-4 w-[90%] center">
                    <img src={googleIcon} className="w-5" />
                    contnue wth google
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
    );
}

export default UserAuthForm;
