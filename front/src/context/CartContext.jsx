import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LIMITE_POR_PRODUTO } from "../lib/config";

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
  const [limite, setLimite] = useState(null); // { nome } quando bate no limite

  useEffect(() => {
    localStorage.setItem("sky_cart", JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem("sky_cupom", JSON.stringify(cupom));
  }, [cupom]);

  // total de unidades do mesmo produto (todos os tamanhos) no carrinho
  const totalDoProduto = (id) =>
    items.filter((i) => i.id === id).reduce((s, i) => s + i.qtd, 0);

  const add = (produto, tamanho, qtd = 1) => {
    const atual = totalDoProduto(produto.id);
    if (atual + qtd > LIMITE_POR_PRODUTO) {
      setLimite({ nome: produto.nome });
      // completa só até o limite, se ainda couber
      const restante = LIMITE_POR_PRODUTO - atual;
      if (restante <= 0) return;
      qtd = restante;
    }

    setItems((prev) => {
      const key = `${produto.id}-${tamanho || ""}`;
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qtd: i.qtd + qtd } : i));
      }
      return [
        ...prev,
        {
          key,
          id: produto.id,
          nome: produto.nome,
          marca: produto.marca,
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
    setItems((prev) => {
      const item = prev.find((i) => i.key === key);
      if (!item) return prev;
      const outros = prev
        .filter((i) => i.id === item.id && i.key !== key)
        .reduce((s, i) => s + i.qtd, 0);
      let novo = Math.max(1, qtd);
      if (outros + novo > LIMITE_POR_PRODUTO) {
        setLimite({ nome: item.nome });
        novo = Math.max(1, LIMITE_POR_PRODUTO - outros);
      }
      return prev.map((i) => (i.key === key ? { ...i, qtd: novo } : i));
    });

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
        limite, setLimite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
