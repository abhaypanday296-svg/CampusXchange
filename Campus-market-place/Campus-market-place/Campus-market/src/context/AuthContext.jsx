import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/apiClient";

//This creates a global box where auth data will be stored.

const AuthContext = createContext();  
// ❌ ERROR FIXED: AuthContect → AuthContext (spelling mistake)

// createContext → used to create a global store
// useContext → used to access that store
// useState → store data (like user)
// useEffect → run code when component loads
// apiClient → your backend API handler (like Axios)

export const AuthProvider = ({ children }) => {
  //👉 It is a wrapper component that gives login information to your whole app.

  //AuthProvider = box
  //<children /> = item inside box

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //“Is the user already logged in or not?”
  const checkAuth = async () => {
    try {
      const response = await apiClient.get("/auth/get-user");  
      // 👉 It asks backend: “Hey, is someone logged in?”

      setUser(response.data);  // sending response 
    } catch (err) {
      setUser(null);  // If backend says NO (or error)
    } finally {
      setLoading(false);  
      //👉 Whether success or fail
    }
  };

  // login   Send email & password → backend checks → save user
  const login = async (Credential) => {
    const response = await apiClient.post("/auth/signin", Credential);
    setUser(response.data.user);
    return response.data;
  };

  // logout 
  const logout = async () => {
    await apiClient.post("/auth/signout");
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    // AuthProvider → prepares the data
    // AuthContext.Provider → distributes the data

    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {/* 1. value={...}
      ➡️ What data to give */}
      
      {children}  
      {/* 2. {children} ➡️ Who will receive that data */}
    </AuthContext.Provider>
  );
};

// useContext to use the function 
export const useAuth = () => {
  const context = useContext(AuthContext);  
  // ➡️ “Go to the AuthContext and get all the data from it”

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};