// src/lib/useAuth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Define default user interface
interface DefaultUser {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  isDefaultUser: boolean;
}

// 1) Define the shape of our context
interface AuthContextType {
  user: DefaultUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const noopAsync = async () => {};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: noopAsync,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DefaultUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const defaultUserData = localStorage.getItem("defaultUser");
    
    if (isLoggedIn === "true" && defaultUserData) {
      try {
        const userData = JSON.parse(defaultUserData);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  // logout implementation that clears localStorage
  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear localStorage
      localStorage.removeItem("defaultUser");
      localStorage.removeItem("isLoggedIn");
      
      // Set local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4) Custom hook to consume the context (named export)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

// default export so existing default imports still work
export default useAuth;