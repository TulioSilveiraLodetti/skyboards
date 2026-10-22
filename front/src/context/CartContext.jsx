import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("sky_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [cupom, setCupom] = useState(() => {
    try {
      const raw = localStorage.getItem("sky_cupom");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sky_cart", JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem("sky_cupom", JSON.stringify(cupom));
  }, [cupom]);

  const add = (produto, tamanho, qtd = 1) => {
    setItems((prev) => {
      const key = `${produto.id}-${tamanho || ""}`;
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) =>
          i.key === key ? { ...i, qtd: i.qtd + qtd } : i
        );
      }
      return [
        ...prev,
        {
          key,
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          imagem: produto.imagem,
          tamanho: tamanho || null,
          qtd,
        },
      ];
    });
    setOpen(true);
  };

  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const setQtd = (key, qtd) =>
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, qtd: Math.max(1, qtd) } : i))
        .filter((i) => i.qtd > 0)
    );
  const clear = () => {
    setItems([]);
    setCupom(null);
  };

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.preco) * i.qtd, 0),
    [items]
  );
  const desconto = useMemo(
    () => (cupom ? (subtotal * cupom.percentual) / 100 : 0),
    [subtotal, cupom]
  );
  const total = Math.max(0, subtotal - desconto);
  const count = useMemo(() => items.reduce((s, i) => s + i.qtd, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items, add, remove, setQtd, clear,
        subtotal, desconto, total, count,
        cupom, setCupom,
        open, setOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
