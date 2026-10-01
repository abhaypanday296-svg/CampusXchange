import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import { useTheme, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import signinAnimation from "../../assets/signin.json";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Signin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focus, setFocus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("All fields required");
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Signin failed");
    } finally {
      setLoading(false);
    }
  };

  const inputWrapper = (name) => ({
    position: "relative",
    marginBottom: "20px",
  });

  const inputStyle = (name) => ({
    width: "100%",
    padding: "14px 12px",
    borderRadius: "12px",
    border: `1px solid ${
      focus === name ? theme.palette.primary.main : theme.palette.divider
    }`,
    background:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.05)"
        : "#fff",
    color: theme.palette.text.primary,
    outline: "none",
    transition: "all 0.25s ease",
    backdropFilter: "blur(10px)",
  });

  const labelStyle = (name, value) => ({
    position: "absolute",
    left: "12px",
    top: focus === name || value ? "-8px" : "50%",
    fontSize: focus === name || value ? "0.75rem" : "0.95rem",
    color:
      focus === name
        ? theme.palette.primary.main
        : theme.palette.text.secondary,
    background: theme.palette.background.paper,
    padding: "0 6px",
    transform: focus === name || value ? "translateY(0)" : "translateY(-50%)",
    transition: "0.25s ease",
    pointerEvents: "none",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.default,
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1000px",
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          backdropFilter: "blur(20px)",
          background:
            theme.palette.mode === "dark"
              ? "rgba(20,20,20,0.8)"
              : "rgba(255,255,255,0.9)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 20px 60px rgba(0,0,0,0.7)"
              : "0 20px 60px rgba(0,0,0,0.1)",
        }}
      >
        {/* LOTTIE */}
        <div
          style={{
            flex: 1,
            display: window.innerWidth < 768 ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "70%", maxWidth: "320px" }}>
            <Lottie animationData={signinAnimation} loop />
          </div>
        </div>

        {/* FORM */}
        <div style={{ flex: 1, padding: "40px 30px" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "28px",
              fontWeight: "700",
              marginBottom: "6px",
              color: theme.palette.text.primary,
            }}
          >
            Welcome Back
          </h2>

          <p
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: theme.palette.text.secondary,
            }}
          >
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div style={inputWrapper("email")}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onFocus={() => setFocus("email")}
                onBlur={() => setFocus("")}
                style={inputStyle("email")}
              />
              <label style={labelStyle("email", formData.email)}>
                Email Address
              </label>
            </div>

            {/* PASSWORD */}
            <div style={inputWrapper("password")}>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onFocus={() => setFocus("password")}
                onBlur={() => setFocus("")}
                style={inputStyle("password")}
              />
              <label style={labelStyle("password", formData.password)}>
                Password
              </label>

              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: theme.palette.primary.main,
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* LINK */}
            <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                color: theme.palette.text.secondary,
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: theme.palette.primary.main,
                  fontWeight: "600",
                }}
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
