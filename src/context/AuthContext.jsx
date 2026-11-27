import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [authData, setauthData] = useState({
    user: null,
    token: null,
  });

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (user && token) {
        setauthData({ user, token });
      }
    } catch (error) {
      console.error("Authentication restoration failed:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setAuthLoading(false);
    }
  }, []);
  function handleLogin(user, token) {
    setauthData({ user, token });
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }

  function verifyOTP(user, token) {
    setauthData({ user, token });
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }
  function handleLogout() {
    setauthData({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
  return (
    <AuthContext.Provider
      value={{ authData, handleLogin, verifyOTP, handleLogout, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
