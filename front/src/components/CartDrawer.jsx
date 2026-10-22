import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { brl } from "../lib/format";

export default function CartDrawer() {
  const { items, open, setOpen, remove, setQtd, subtotal, count } = useCart();
  const nav = useNavigate();

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[110] bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-[111] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-coal transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h3 className="text-lg font-bold">Carrinho ({count})</h3>
          <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:border-volt" aria-label="Fechar">
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-bone" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-white/50">Seu carrinho está vazio.</p>
            <Link to="/produtos" onClick={() => setOpen(false)} className="btn btn-volt">Ver produtos</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {items.map((i) => (
                <div key={i.key} className="flex gap-3 rounded-xl border border-white/5 bg-steel p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                    <img src={i.imagem} alt={i.nome} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-2 text-sm font-semibold">{i.nome}</p>
                    {i.tamanho && <span className="text-xs text-white/40">Tam: {i.tamanho}</span>}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQtd(i.key, i.qtd - 1)} className="h-7 w-7 rounded-md bg-concrete text-bone">-</button>
                        <span className="w-5 text-center text-sm">{i.qtd}</span>
                        <button onClick={() => setQtd(i.key, i.qtd + 1)} className="h-7 w-7 rounded-md bg-concrete text-bone">+</button>
                      </div>
                      <span className="text-sm font-bold text-volt">{brl(i.preco * i.qtd)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(i.key)} className="self-start text-white/30 hover:text-red-400" aria-label="Remover">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-white/60">Subtotal</span>
                <span className="text-xl font-extrabold">{brl(subtotal)}</span>
              </div>
              <button
                onClick={() => { setOpen(false); nav("/carrinho"); }}
                className="btn btn-volt w-full"
              >
                Finalizar compra
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
