import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import { brl, parcelar } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useFavoritos } from "../context/FavoritosContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const { add } = useCart();
  const { isFav, toggle } = useFavoritos();
  const { toast } = useToast();
  const [produto, setProduto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [tamanho, setTamanho] = useState(null);
  const [qtd, setQtd] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTamanho(null);
    setQtd(1);
    api.get(`/produtos/${id}`).then(({ data }) => {
      setProduto(data);
      api
        .get("/produtos", { params: { categoria: data.categoria } })
        .then(({ data: rel }) => setRelacionados(rel.filter((p) => p.id !== data.id).slice(0, 4)));
    });
  }, [id]);

  if (!produto) {
    return <div className="container-x grid min-h-[60vh] place-items-center pt-24 text-white/40">Carregando...</div>;
  }

  const tamanhos = (produto.tamanhos || "").split(",").map((t) => t.trim()).filter(Boolean);
  const precisaTam = tamanhos.length > 0 && tamanhos[0] !== "UNICO";
  const esgotado = produto.estoque === 0;
  const fav = isFav(produto.id);

  const adicionar = () => {
    if (precisaTam && !tamanho) {
      toast("Escolha um tamanho.", "erro");
      return;
    }
    add(produto, tamanho, qtd);
    toast("Adicionado ao carrinho!");
  };

  return (
    <div className="pt-24 sm:pt-28">
      <div className="container-x">
        <nav className="mb-6 text-sm text-white/40">
          <Link to="/" className="hover:text-volt">Início</Link> /{" "}
          <Link to="/produtos" className="hover:text-volt">Produtos</Link> /{" "}
          <span className="text-white/70">{produto.nome}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white">
            {produto.descontoPercent ? (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-volt px-3 py-1 text-sm font-black text-ink">
                -{produto.descontoPercent}%
              </span>
            ) : null}
            <img src={produto.imagem} alt={produto.nome} className="aspect-square w-full object-cover" />
          </div>

          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-volt">{produto.marca}</span>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">{produto.nome}</h1>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-4xl font-black text-bone">{brl(produto.preco)}</span>
              {produto.precoAntigo ? (
                <span className="pb-1 text-xl text-white/30 line-through">{brl(produto.precoAntigo)}</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-white/50">{parcelar(produto.preco)} sem juros</p>

            {produto.cor && <p className="mt-5 text-sm text-white/60">Cor: <span className="font-semibold text-bone">{produto.cor}</span></p>}

            {precisaTam && (
              <div className="mt-6">
                <p className="label">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {tamanhos.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTamanho(t)}
                      className={`h-11 w-11 rounded-xl border text-sm font-bold transition ${
                        tamanho === t ? "border-volt bg-volt text-ink" : "border-white/15 text-bone hover:border-volt"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/15 p-1">
                <button onClick={() => setQtd((q) => Math.max(1, q - 1))} className="h-9 w-9 rounded-lg bg-steel">-</button>
                <span className="w-6 text-center font-semibold">{qtd}</span>
                <button onClick={() => setQtd((q) => q + 1)} className="h-9 w-9 rounded-lg bg-steel">+</button>
              </div>
              <span className={`text-sm ${esgotado ? "text-red-400" : "text-white/50"}`}>
                {esgotado ? "Esgotado" : `${produto.estoque} em estoque`}
              </span>
            </div>

            <div className="mt-7 flex gap-3">
              <button onClick={adicionar} disabled={esgotado} className="btn btn-volt flex-1 disabled:bg-concrete disabled:text-white/40">
                {esgotado ? "Indisponível" : "Adicionar ao carrinho"}
              </button>
              <button
                onClick={() => toggle(produto.id)}
                className={`btn ${fav ? "btn-volt" : "btn-ghost"} px-5`}
                aria-label="Favoritar"
              >
                <svg viewBox="0 0 24 24" className={`h-5 w-5 ${fav ? "fill-ink stroke-ink" : "fill-none stroke-current"}`} strokeWidth="2">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-coal p-5">
              <h3 className="mb-2 font-bold">Descrição</h3>
              <p className="text-sm leading-relaxed text-white/60">{produto.descricao}</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-white/50">
              <div className="rounded-xl border border-white/10 bg-coal p-3">🚚<br />Entrega Brasil</div>
              <div className="rounded-xl border border-white/10 bg-coal p-3">💳<br />Até 12x</div>
              <div className="rounded-xl border border-white/10 bg-coal p-3">🔒<br />Compra segura</div>
            </div>
          </div>
        </div>

        {relacionados.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 font-display text-3xl font-black">Você também pode curtir</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relacionados.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard produto={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
