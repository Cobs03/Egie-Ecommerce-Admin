import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Here you would typically validate credentials
    // For now, we'll just navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen text-[#F3F7F6]">
      {/* Left Side with Form */}
      <div className="w-full md:w-1/2 bg-black p-10 shadow-lg flex flex-col justify-center h-full">
        <form onSubmit={handleLogin}>
          <div className="flex items-center mb-3 justify-center">
            <img
              className="w-28 h-20 object-contain"
              src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
              alt="Logo"
            />
            <h2 className="font-bold text-4xl mb-2 text-center">EGIE ADMIN</h2>
          </div>

          <h2 className="font-bold text-3xl mb-2 text-center">
            Power Up Your Build – Premium Parts. Peak Performance.
          </h2>
          <p className="mb-4 text-center">
            Welcome back! Please login to your account to continue
          </p>

          {/* Email */}
          <label className="text-sm" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="p-2 border border-gray-300 rounded w-full text-black mb-4 bg-white"
            placeholder="wayne.enterprises@gotham.com"
            required
          />

          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between">
              <label className="text-sm" htmlFor="password">
                Password
              </label>
            </div>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="p-2 border border-gray-300 rounded w-full pr-10 text-black bg-white"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <IoMdEyeOff className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[60%] bg-green-500 text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-transparent border hover:border-green-500 hover:text-green-500 transition duration-200"
            >
              LOG IN
            </button>
          </div>
        </form>
      </div>

      {/* Right Side with Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-200 to-purple-200 items-center justify-center">
        <img
          className="w-full h-full object-cover"
          src="https://i.ibb.co/yF04zrC9/vecteezy-computer-electronic-chip-with-processor-transistors-29336852.jpg"
          alt="Computer Illustration"
        />
      </div>
    </div>
  );
};

export default SignIn;
