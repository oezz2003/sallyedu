// src/lib/useAuth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

// 1) Define the shape of our context
interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // logout implementation
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
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

// Custom hook to consume the context (named export)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

// default export so existing default imports still work
export default useAuth;