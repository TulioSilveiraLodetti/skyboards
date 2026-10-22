import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { brl } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Carrinho() {
  const { items, setQtd, remove, subtotal, desconto, total, cupom, setCupom, clear } = useCart();
  const { isAuth, user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("PIX");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(null);

  const aplicarCupom = async () => {
    if (!codigo.trim()) return;
    try {
      const { data } = await api.get(`/cupons/validar/${codigo.trim()}`);
      setCupom({ codigo: data.codigo, percentual: data.percentual });
      toast(`Cupom ${data.codigo} aplicado (-${data.percentual}%)!`);
    } catch {
      toast("Cupom inválido.", "erro");
    }
  };

  const finalizar = async () => {
    if (!isAuth) {
      nav("/login", { state: { from: "/carrinho" } });
      return;
    }
    if (!endereco.trim()) {
      toast("Informe o endereço de entrega.", "erro");
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        nomeCliente: user?.nome || user?.email,
        enderecoEntrega: endereco,
        formaPagamento: pagamento,
        itensJson: JSON.stringify(items),
        total,
        status: "PENDENTE",
      };
      const { data } = await api.post("/pedidos", payload);
      clear();
      setConcluido(data);
    } catch {
      toast("Não foi possível finalizar o pedido.", "erro");
    } finally {
      setEnviando(false);
    }
  };

  if (concluido) {
    return (
      <div className="container-x grid min-h-[70vh] place-items-center pt-28 pb-20 text-center">
        <div>
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-volt text-3xl text-ink">✓</div>
          <h1 className="font-display text-4xl font-black">Pedido confirmado!</h1>
          <p className="mt-3 text-white/60">Pedido #{concluido.id} recebido. Acompanhe pela sua conta.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/conta?tab=pedidos" className="btn btn-volt">Meus pedidos</Link>
            <Link to="/produtos" className="btn btn-ghost">Continuar comprando</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center pt-28 pb-20 text-center">
        <div>
          <h1 className="font-display text-4xl font-black">Seu carrinho está vazio</h1>
          <p className="mt-3 text-white/50">Que tal dar um rolê pelo catálogo?</p>
          <Link to="/produtos" className="btn btn-volt mt-7">Ver produtos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pt-28 pb-20">
      <h1 className="mb-8 font-display text-5xl font-black">Carrinho</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((i) => (
            <div key={i.key} className="flex gap-4 rounded-2xl border border-white/10 bg-coal p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                <img src={i.imagem} alt={i.nome} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="font-semibold">{i.nome}</p>
                {i.tamanho && <span className="text-xs text-white/40">Tamanho: {i.tamanho}</span>}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQtd(i.key, i.qtd - 1)} className="h-8 w-8 rounded-lg bg-steel">-</button>
                    <span className="w-6 text-center">{i.qtd}</span>
                    <button onClick={() => setQtd(i.key, i.qtd + 1)} className="h-8 w-8 rounded-lg bg-steel">+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-volt">{brl(i.preco * i.qtd)}</span>
                    <button onClick={() => remove(i.key)} className="text-white/30 hover:text-red-400">remover</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-white/10 bg-coal p-5">
            <h3 className="mb-3 font-bold">Dados de entrega</h3>
            <label className="label">Endereço completo</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade/UF" className="input" />
            <label className="label mt-4">Forma de pagamento</label>
            <div className="flex flex-wrap gap-2">
              {["PIX", "Cartão", "Boleto"].map((p) => (
                <button key={p} onClick={() => setPagamento(p)} className={`chip ${pagamento === p ? "border-volt bg-volt text-ink" : "hover:border-volt"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-coal p-6 lg:sticky lg:top-24">
          <h3 className="mb-4 text-lg font-bold">Resumo</h3>

          <div className="mb-4 flex gap-2">
            <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Cupom" className="input" />
            <button onClick={aplicarCupom} className="btn btn-dark shrink-0 px-5">Aplicar</button>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
            <Row label="Subtotal" value={brl(subtotal)} />
            {cupom && <Row label={`Cupom ${cupom.codigo}`} value={`- ${brl(desconto)}`} volt />}
            <Row label="Frete" value="Grátis" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-white/60">Total</span>
            <span className="text-2xl font-black text-volt">{brl(total)}</span>
          </div>

          <button onClick={finalizar} disabled={enviando} className="btn btn-volt mt-6 w-full">
            {enviando ? "Processando..." : isAuth ? "Finalizar pedido" : "Entrar e finalizar"}
          </button>
          {!isAuth && <p className="mt-2 text-center text-xs text-white/40">Você precisa estar logado para fechar o pedido.</p>}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, volt }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className={volt ? "font-semibold text-volt" : "text-bone"}>{value}</span>
    </div>
  );
}
