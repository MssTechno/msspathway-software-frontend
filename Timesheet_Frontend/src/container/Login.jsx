import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

function Login() {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9_]+@msstechno\.com$/;
    return emailRegex.test(value);
  };

  const handleSignIn = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Please enter email");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Error in email account");
      valid = false;
    }

    if (!password) {
      setPasswordError("Please enter password");
      valid = false;
    }

    if (!valid) return false;

    return true;
  };

  // api
  const loginHandler = async (e) => {
    console.log("Hello",email);
    e.preventDefault();

    const isValid = handleSignIn();
    if (!isValid) return;

    try {
      const response = await axios.post(
        "https://timesheet-api-790373899641.asia-south1.run.app/auth/login",
        
        {
          email: email,
          password: password,
        }
      );

      console.log("Login Success:", response.data.access_token);

      // Optional: store token if API returns it
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      navigate("/timesheet");

    } catch (error) {
        console.error("Login Error:", error);

        if (error.response && error.response.data) {
          setError(error.response.data.message || "Invalid credentials");
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center bg-gradient-to-br from-[#66211E] to-[#135C27] px-4">
      {/* Login Card */}
      <form
        onSubmit={loginHandler}
        className="bg-white w-full max-w-sm sm:max-w-[360px] p-6 sm:p-8 rounded-xl shadow-2xl text-center"
      >
        {/* Logo */}
        <img
          src="/MSSLogo.png"
          alt="Company Logo"
          className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4"
        />

        <h2 className="text-xl sm:text-2xl font-semibold">
          Welcome to MSSTechno
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to your account
        </p>

        {/* Email */}
        <div className={`flex items-center border rounded-md mb-1 px-3 ${
          emailError ? "border-red-500" : ""
        }`}>
          <FiMail className="text-gray-400 mr-2 shrink-0" />
          <input
            type="email"
            placeholder="you@msstechno.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            className="w-full py-2 outline-none text-sm"
          />
        </div>

        {emailError && (
          <p className="text-red-500 text-xs text-left">
            {emailError}
          </p>
        )}

        {/* Password */}
        <div className={`flex items-center border rounded-md mb-1 px-3 ${
          passwordError ? "border-red-500" : ""
        }`}>
          <FiLock className="text-gray-400 mr-2 shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            className="w-full py-2 outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 ml-2"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {passwordError && (
          <p className="text-red-500 text-xs text-left">
            {passwordError}
          </p>
        )}

        <p
          className="text-left text-sm text-green-600 cursor-pointer hover:underline mb-6"
          onClick={() => setShowPopup(true)}
        >
          Forgot password?
        </p>

        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
        >
          Sign In
        </button>
      </form>

      {/* Forgot Password Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Access Denied
            </h3>
            <p className="text-gray-600 text-sm">
              You don’t have access to reset the password.
              Please contact the admin.
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="mt-5 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
