import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import signupAnimation from "../../assets/signup.json";
import apiClient from "../../api/apiClient";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    college: "",
  });

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingColleges, setFetchingColleges] = useState(false);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setFetchingColleges(true);
    try {
      const res = await apiClient.get("/college/get-colleges");
      setColleges(res.data?.data || []);
    } catch {
      alert("Failed to load colleges");
    } finally {
      setFetchingColleges(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { username, email, password, college } = formData;

    if (!username || !email || !password || !college) {
      alert("All fields required");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("auth/signup", formData);
      alert("Account created!");
      navigate("/signin");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `w-full px-4 py-3 rounded-xl bg-gray-900 border transition-all duration-300 outline-none
     ${focused === name 
        ? "border-blue-500 ring-2 ring-blue-500/40 scale-[1.02]" 
        : "border-gray-700 hover:border-gray-500"}
     text-white placeholder-gray-400`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="flex w-full max-w-5xl bg-gray-950 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">

        {/* LEFT - Lottie */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-black">
          <div className="w-72 lg:w-80 opacity-90">
            <Lottie animationData={signupAnimation} loop />
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className="w-full md:w-1/2 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Heading */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Join CampusXchange
              </p>
            </div>

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              onFocus={() => setFocused("username")}
              onBlur={() => setFocused("")}
              className={inputClass("username")}
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              className={inputClass("email")}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
              className={inputClass("password")}
            />

            {/* College */}
            <select
              value={formData.college}
              onChange={(e) =>
                setFormData({ ...formData, college: e.target.value })
              }
              onFocus={() => setFocused("college")}
              onBlur={() => setFocused("")}
              className={inputClass("college")}
            >
              <option value="" className="bg-black">
                Select College
              </option>
              {fetchingColleges ? (
                <option>Loading...</option>
              ) : (
                colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.collegeName}
                  </option>
                ))
              )}
            </select>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white 
              bg-blue-600 hover:bg-blue-700 active:scale-95 
              transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:bg-gray-700"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>

            {/* Link */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-blue-500 hover:text-blue-400 font-semibold transition"
              >
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;