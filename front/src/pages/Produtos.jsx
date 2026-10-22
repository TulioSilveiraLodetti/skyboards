import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const cats = [
  { label: "Todos", value: "" },
  { label: "Tênis", value: "TENIS" },
  { label: "Chinelos", value: "CHINELO" },
  { label: "Mochilas", value: "MOCHILA" },
];

export default function Produtos() {
  const [params, setParams] = useSearchParams();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordem, setOrdem] = useState("relevancia");

  const categoria = params.get("categoria") || "";
  const busca = params.get("busca") || "";
  const soDestaque = params.get("destaque") === "1";

  useEffect(() => {
    setLoading(true);
    api
      .get("/produtos", { params: { categoria: categoria || undefined, busca: busca || undefined } })
      .then(({ data }) => setProdutos(data))
      .finally(() => setLoading(false));
  }, [categoria, busca]);

  const lista = useMemo(() => {
    let l = [...produtos];
    if (soDestaque) l = l.filter((p) => p.destaque || p.descontoPercent);
    if (ordem === "menor") l.sort((a, b) => a.preco - b.preco);
    if (ordem === "maior") l.sort((a, b) => b.preco - a.preco);
    if (ordem === "desconto") l.sort((a, b) => (b.descontoPercent || 0) - (a.descontoPercent || 0));
    return l;
  }, [produtos, ordem, soDestaque]);

  const setCat = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("categoria", value);
    else next.delete("categoria");
    next.delete("busca");
    setParams(next);
  };

  return (
    <div className="container-x pt-28 pb-24 sm:pt-32">
      <div className="mb-8">
        <span className="text-sm font-bold uppercase tracking-widest text-volt">Catálogo</span>
        <h1 className="font-display text-5xl font-black sm:text-6xl">
          {busca ? `Busca: "${busca}"` : soDestaque ? "Promoções" : "Produtos"}
        </h1>
        <p className="mt-2 text-white/50">{lista.length} itens encontrados</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`chip ${
                categoria === c.value && !soDestaque ? "border-volt bg-volt text-ink" : "text-bone/80 hover:border-volt"
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => {
              const next = new URLSearchParams(params);
              if (soDestaque) next.delete("destaque");
              else next.set("destaque", "1");
              setParams(next);
            }}
            className={`chip ${soDestaque ? "border-volt bg-volt text-ink" : "text-bone/80 hover:border-volt"}`}
          >
            🔥 Em promoção
          </button>
        </div>

        <select
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className="rounded-full border border-white/10 bg-steel px-4 py-2 text-sm text-bone outline-none focus:border-volt"
        >
          <option value="relevancia">Relevância</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
          <option value="desconto">Maior desconto</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-steel" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-coal p-16 text-center text-white/50">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}>
              <ProductCard produto={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
