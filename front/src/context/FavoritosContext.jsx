import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const FavoritosContext = createContext(null);

export function FavoritosProvider({ children }) {
  const { isAuth } = useAuth();
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sky_favs") || "[]");
    } catch {
      return [];
    }
  });

  // ao logar, sincroniza com o backend
  useEffect(() => {
    if (isAuth) {
      api
        .get("/favoritos/ids")
        .then(({ data }) => setIds(data || []))
        .catch(() => {});
    }
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) localStorage.setItem("sky_favs", JSON.stringify(ids));
  }, [ids, isAuth]);

  const isFav = (id) => ids.includes(id);

  const toggle = async (id) => {
    const nowFav = ids.includes(id);
    setIds((prev) => (nowFav ? prev.filter((x) => x !== id) : [...prev, id]));
    if (isAuth) {
      try {
        if (nowFav) await api.delete(`/favoritos/${id}`);
        else await api.post(`/favoritos/${id}`);
      } catch {
        // reverte em caso de erro
        setIds((prev) => (nowFav ? [...prev, id] : prev.filter((x) => x !== id)));
      }
    }
  };

  return (
    <FavoritosContext.Provider value={{ ids, isFav, toggle }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export const useFavoritos = () => useContext(FavoritosContext);
