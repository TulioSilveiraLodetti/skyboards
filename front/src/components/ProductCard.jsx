import { Link } from "react-router-dom";
import { useRef } from "react";
import { brl } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useFavoritos } from "../context/FavoritosContext";
import useReducedMotion from "../hooks/useReducedMotion";

export default function ProductCard({ produto }) {
  const { add } = useCart();
  const { isFav, toggle } = useFavoritos();
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const fav = isFav(produto.id);
  const esgotado = produto.estoque === 0;

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-coal transition-transform duration-300 will-change-transform hover:border-white/15 hover:shadow-card"
    >
      {produto.descontoPercent ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-volt px-3 py-1 text-xs font-black text-ink">
          -{produto.descontoPercent}%
        </span>
      ) : null}

      <button
        onClick={() => toggle(produto.id)}
        aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-ink/60 backdrop-blur transition hover:border-volt"
      >
        <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${fav ? "fill-volt stroke-volt" : "fill-none stroke-white/70"}`} strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>

      <Link to={`/produto/${produto.id}`} className="relative block aspect-square overflow-hidden bg-white">
        <img
          src={produto.imagem}
          alt={produto.nome}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {esgotado && (
          <span className="absolute inset-0 grid place-items-center bg-ink/60 text-sm font-black uppercase tracking-widest text-bone">
            Esgotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-volt">{produto.marca}</span>
        <Link to={`/produto/${produto.id}`} className="mt-1 line-clamp-2 text-sm font-semibold text-bone transition group-hover:text-volt">
          {produto.nome}
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-bone">{brl(produto.preco)}</span>
            {produto.precoAntigo ? (
              <span className="text-sm text-white/30 line-through">{brl(produto.precoAntigo)}</span>
            ) : null}
          </div>
          <span className="text-xs text-white/40">12x de {brl(produto.preco / 12)}</span>
          <button
            disabled={esgotado}
            onClick={() => add(produto, Array.isArray(produto.tamanhos) ? null : null, 1)}
            className="btn btn-volt mt-3 w-full py-2.5 text-xs disabled:bg-concrete disabled:text-white/40"
          >
            {esgotado ? "Indisponível" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
