import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("sky_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const persist = (u, token) => {
    setUser(u);
    localStorage.setItem("sky_user", JSON.stringify(u));
    localStorage.setItem("sky_token", token);
  };

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      const u = { email, nome: data.nome || "", tipo: data.tipo };
      persist(u, data.token);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      const u = { email: payload.email, nome: data.nome || payload.nome || "", tipo: data.tipo };
      persist(u, data.token);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sky_user");
    localStorage.removeItem("sky_token");
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("sky_user", JSON.stringify(next));
      return next;
    });
  };

  const isAdmin = user?.tipo === "ADMIN";
  const isAuth = !!user;

  useEffect(() => {
    // valida token silenciosamente ao abrir o app
    if (localStorage.getItem("sky_token")) {
      api.get("/auth/me").catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuth, isAdmin, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
