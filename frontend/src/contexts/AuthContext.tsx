import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "../api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
        } catch {
          // Token invalid — clear it
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await API.post("/auth/login", { email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await API.post("/auth/register", { name, email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
