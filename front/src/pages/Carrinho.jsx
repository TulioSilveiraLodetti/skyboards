import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { brl } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const FRETE_GRATIS_ACIMA = 300;

function opcoesEntrega(valor) {
  const pacGratis = valor >= FRETE_GRATIS_ACIMA;
  return [
    { id: "RETIRADA", nome: "Retirada na loja", desc: "Içara/SC · hoje", frete: 0, prazo: 0 },
    { id: "PAC", nome: "PAC (Correios)", desc: pacGratis ? "Frete grátis" : "até 8 dias úteis", frete: pacGratis ? 0 : 24.9, prazo: 8 },
    { id: "SEDEX", nome: "SEDEX (Correios)", desc: "2 a 3 dias úteis", frete: 39.9, prazo: 3 },
  ];
}

export default function Carrinho() {
  const { items, setQtd, remove, subtotal, desconto, cupom, setCupom, clear } = useCart();
  const { isAuth, user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();

  const [etapa, setEtapa] = useState(1); // 1 entrega, 2 pagamento
  const [codigo, setCodigo] = useState("");
  const [concluido, setConcluido] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // entrega
  const [ent, setEnt] = useState({ cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "", complemento: "" });
  const [tipoEntrega, setTipoEntrega] = useState("PAC");
  const [buscandoCep, setBuscandoCep] = useState(false);

  // pagamento
  const [pagamento, setPagamento] = useState("PIX");
  const [parcelas, setParcelas] = useState(1);
  const [cartao, setCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" });

  const base = Math.max(0, subtotal - desconto);
  const entregas = useMemo(() => opcoesEntrega(base), [base]);
  const entregaSel = entregas.find((e) => e.id === tipoEntrega) || entregas[0];
  const frete = entregaSel.frete;
  const descontoPix = pagamento === "PIX" && etapa === 2 ? base * 0.05 : 0;
  const total = Math.max(0, base + frete - descontoPix);

  const upEnt = (k) => (e) => setEnt({ ...ent, [k]: e.target.value });

  const buscarCep = async (cepRaw) => {
    const cep = (cepRaw || "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (!d.erro) {
        setEnt((p) => ({ ...p, rua: d.logradouro || "", bairro: d.bairro || "", cidade: d.localidade || "", uf: d.uf || "" }));
      } else {
        toast("CEP não encontrado.", "erro");
      }
    } catch {
      toast("Não foi possível buscar o CEP.", "erro");
    } finally {
      setBuscandoCep(false);
    }
  };

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

  const validarEntrega = () => {
    if (tipoEntrega === "RETIRADA") return true;
    if (!ent.cep || !ent.rua || !ent.numero || !ent.cidade) {
      toast("Preencha o endereço de entrega (CEP, rua, número e cidade).", "erro");
      return false;
    }
    return true;
  };

  const irPagamento = () => {
    if (!validarEntrega()) return;
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finalizar = async () => {
    if (!isAuth) {
      nav("/login", { state: { from: "/carrinho" } });
      return;
    }
    if (pagamento === "Cartão") {
      const num = cartao.numero.replace(/\s/g, "");
      if (num.length < 13 || !cartao.nome || !cartao.validade || !cartao.cvv) {
        toast("Preencha os dados do cartão (simulado).", "erro");
        return;
      }
    }
    setEnviando(true);
    try {
      const enderecoEntrega =
        tipoEntrega === "RETIRADA"
          ? "Retirada na loja - Içara/SC"
          : `${ent.rua}, ${ent.numero} ${ent.complemento ? "(" + ent.complemento + ") " : ""}- ${ent.bairro} - ${ent.cidade}/${ent.uf}`;
      const payload = {
        nomeCliente: user?.nome || user?.email,
        enderecoEntrega,
        cep: ent.cep,
        tipoEntrega: entregaSel.nome,
        frete,
        prazoDias: entregaSel.prazo,
        formaPagamento: pagamento,
        parcelas: pagamento === "Cartão" ? Number(parcelas) : 1,
        itensJson: JSON.stringify(items),
        total,
        status: "PENDENTE",
      };
      const { data } = await api.post("/pedidos", payload);
      clear();
      setConcluido({ ...data, pagamento, entrega: entregaSel });
    } catch {
      toast("Não foi possível finalizar o pedido.", "erro");
    } finally {
      setEnviando(false);
    }
  };

  /* ---------- telas ---------- */
  if (concluido) {
    return (
      <div className="container-x grid min-h-[70vh] place-items-center pt-28 pb-20 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-volt text-3xl text-ink">✓</div>
          <h1 className="font-display text-4xl font-black">Pedido confirmado!</h1>
          <p className="mt-3 text-white/60">Pedido #{concluido.id} recebido.</p>

          {concluido.pagamento === "PIX" && <PixBox total={total} />}
          {concluido.pagamento === "Boleto" && <BoletoBox total={total} />}
          {concluido.pagamento === "Cartão" && (
            <p className="mt-4 rounded-xl border border-white/10 bg-coal p-4 text-sm text-white/60">
              Pagamento no cartão aprovado (simulado) em {parcelas}x.
            </p>
          )}

          <p className="mt-4 text-sm text-white/50">Entrega: {concluido.entrega.nome}{concluido.entrega.prazo ? ` · ${concluido.entrega.prazo} dias úteis` : ""}</p>

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
      <div className="mb-8 flex items-center gap-4">
        <h1 className="font-display text-4xl font-black sm:text-5xl">Checkout</h1>
        <div className="flex items-center gap-2 text-xs">
          <Passo n={1} ativo={etapa === 1} feito={etapa > 1} label="Entrega" />
          <div className="h-px w-8 bg-white/15" />
          <Passo n={2} ativo={etapa === 2} label="Pagamento" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* ITENS */}
          <div className="rounded-2xl border border-white/10 bg-coal p-5">
            <h3 className="mb-3 font-bold">Itens ({items.length})</h3>
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.key} className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                    <img src={i.imagem} alt={i.nome} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-semibold">{i.nome}</p>
                    {i.tamanho && <span className="text-xs text-white/40">Tam: {i.tamanho}</span>}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQtd(i.key, i.qtd - 1)} className="h-7 w-7 rounded-md bg-steel">-</button>
                        <span className="w-6 text-center text-sm">{i.qtd}</span>
                        <button onClick={() => setQtd(i.key, i.qtd + 1)} className="h-7 w-7 rounded-md bg-steel">+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-volt">{brl(i.preco * i.qtd)}</span>
                        <button onClick={() => remove(i.key)} className="text-white/30 hover:text-red-400">remover</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {etapa === 1 ? (
            <div className="rounded-2xl border border-white/10 bg-coal p-5">
              <h3 className="mb-4 font-bold">Entrega</h3>

              <div className="mb-5 space-y-2">
                {entregas.map((e) => (
                  <label key={e.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${tipoEntrega === e.id ? "border-volt bg-volt/5" : "border-white/10 hover:border-white/25"}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="entrega" checked={tipoEntrega === e.id} onChange={() => setTipoEntrega(e.id)} className="h-4 w-4 accent-[#d7ff3e]" />
                      <div>
                        <p className="text-sm font-semibold">{e.nome}</p>
                        <p className="text-xs text-white/40">{e.desc}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-volt">{e.frete === 0 ? "Grátis" : brl(e.frete)}</span>
                  </label>
                ))}
              </div>

              {tipoEntrega !== "RETIRADA" && (
                <div className="grid gap-3 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="label">CEP</label>
                    <input value={ent.cep} onChange={upEnt("cep")} onBlur={(e) => buscarCep(e.target.value)} className="input" placeholder="00000-000" />
                    {buscandoCep && <span className="text-xs text-white/40">buscando...</span>}
                  </div>
                  <div className="sm:col-span-4">
                    <label className="label">Rua</label>
                    <input value={ent.rua} onChange={upEnt("rua")} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Número</label>
                    <input value={ent.numero} onChange={upEnt("numero")} className="input" />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="label">Complemento</label>
                    <input value={ent.complemento} onChange={upEnt("complemento")} className="input" placeholder="apto, bloco..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Bairro</label>
                    <input value={ent.bairro} onChange={upEnt("bairro")} className="input" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="label">Cidade</label>
                    <input value={ent.cidade} onChange={upEnt("cidade")} className="input" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="label">UF</label>
                    <input value={ent.uf} onChange={upEnt("uf")} maxLength={2} className="input uppercase" />
                  </div>
                </div>
              )}

              <button onClick={irPagamento} className="btn btn-volt mt-5 w-full">Ir para pagamento →</button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-coal p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Pagamento</h3>
                <button onClick={() => setEtapa(1)} className="text-sm text-white/50 hover:text-volt">← Voltar pra entrega</button>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { id: "PIX", label: "PIX", nota: "-5%" },
                  { id: "Cartão", label: "Cartão", nota: "até 12x" },
                  { id: "Boleto", label: "Boleto", nota: "à vista" },
                ].map((p) => (
                  <button key={p.id} onClick={() => setPagamento(p.id)} className={`rounded-xl border p-3 text-center transition ${pagamento === p.id ? "border-volt bg-volt/5" : "border-white/10 hover:border-white/25"}`}>
                    <p className="text-sm font-bold">{p.label}</p>
                    <p className="text-xs text-volt">{p.nota}</p>
                  </button>
                ))}
              </div>

              {pagamento === "PIX" && (
                <div className="rounded-xl border border-white/10 bg-steel p-4 text-sm text-white/70">
                  <p className="font-semibold text-bone">PIX com 5% de desconto 🤑</p>
                  <p className="mt-1">Ao confirmar, geramos o QR Code e o código copia e cola pra você pagar na hora.</p>
                </div>
              )}

              {pagamento === "Boleto" && (
                <div className="rounded-xl border border-white/10 bg-steel p-4 text-sm text-white/70">
                  <p className="font-semibold text-bone">Boleto bancário</p>
                  <p className="mt-1">À vista, com vencimento em 3 dias úteis. O código é gerado ao confirmar o pedido.</p>
                </div>
              )}

              {pagamento === "Cartão" && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40">Pagamento simulado (ambiente de teste). Não use dados reais.</p>
                  <div>
                    <label className="label">Número do cartão</label>
                    <input value={cartao.numero} onChange={(e) => setCartao({ ...cartao, numero: e.target.value })} className="input" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                  </div>
                  <div>
                    <label className="label">Nome no cartão</label>
                    <input value={cartao.nome} onChange={(e) => setCartao({ ...cartao, nome: e.target.value })} className="input" placeholder="Como está no cartão" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="label">Validade</label>
                      <input value={cartao.validade} onChange={(e) => setCartao({ ...cartao, validade: e.target.value })} className="input" placeholder="MM/AA" />
                    </div>
                    <div className="col-span-1">
                      <label className="label">CVV</label>
                      <input value={cartao.cvv} onChange={(e) => setCartao({ ...cartao, cvv: e.target.value })} className="input" placeholder="000" inputMode="numeric" />
                    </div>
                    <div className="col-span-1">
                      <label className="label">Parcelas</label>
                      <select value={parcelas} onChange={(e) => setParcelas(e.target.value)} className="input">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}x de {brl(total / (i + 1))}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RESUMO */}
        <aside className="h-fit rounded-2xl border border-white/10 bg-coal p-6 lg:sticky lg:top-24">
          <h3 className="mb-4 text-lg font-bold">Resumo</h3>
          <div className="mb-4 flex gap-2">
            <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Cupom" className="input" />
            <button onClick={aplicarCupom} className="btn btn-dark shrink-0 px-5">Aplicar</button>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
            <Row label="Subtotal" value={brl(subtotal)} />
            {cupom && <Row label={`Cupom ${cupom.codigo}`} value={`- ${brl(desconto)}`} volt />}
            {pagamento === "PIX" && etapa === 2 && <Row label="Desconto PIX (5%)" value={`- ${brl(descontoPix)}`} volt />}
            <Row label="Frete" value={frete === 0 ? "Grátis" : brl(frete)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-white/60">Total</span>
            <span className="text-2xl font-black text-volt">{brl(total)}</span>
          </div>

          {etapa === 1 ? (
            <button onClick={irPagamento} className="btn btn-volt mt-6 w-full">Continuar</button>
          ) : (
            <button onClick={finalizar} disabled={enviando} className="btn btn-volt mt-6 w-full">
              {enviando ? "Processando..." : isAuth ? "Finalizar pedido" : "Entrar e finalizar"}
            </button>
          )}
          {!isAuth && <p className="mt-2 text-center text-xs text-white/40">Você precisa estar logado para fechar o pedido.</p>}
          <p className="mt-3 text-center text-xs text-white/30">🔒 Ambiente de compra seguro</p>
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

function Passo({ n, ativo, feito, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${ativo ? "bg-volt text-ink" : feito ? "bg-volt/30 text-volt" : "bg-steel text-white/40"}`}>
        {feito ? "✓" : n}
      </span>
      <span className={`text-xs ${ativo ? "text-bone" : "text-white/40"}`}>{label}</span>
    </div>
  );
}

function PixBox({ total }) {
  const codigo = "00020126330014BR.GOV.BCB.PIX0111skyboards5204000053039865406" + String(total.toFixed(2)).replace(".", "") + "5802BR5913SKYBOARDS6009ICARA62070503***6304A1B2";
  const { toast } = useToast();
  return (
    <div className="mt-5 rounded-2xl border border-volt/20 bg-steel p-5 text-left">
      <p className="text-center font-bold text-bone">Pague com PIX</p>
      <div className="mx-auto my-4 grid h-40 w-40 place-items-center rounded-xl bg-white">
        <div className="grid grid-cols-8 gap-0.5">
          {Array.from({ length: 64 }).map((_, i) => (
            <span key={i} className={`h-3 w-3 ${Math.random() > 0.45 ? "bg-ink" : "bg-white"}`} />
          ))}
        </div>
      </div>
      <p className="mb-1 text-xs text-white/50">Copia e cola:</p>
      <div className="flex gap-2">
        <input readOnly value={codigo} className="input truncate text-xs" />
        <button onClick={() => { navigator.clipboard?.writeText(codigo); toast("Código PIX copiado!"); }} className="btn btn-dark shrink-0 px-4 text-xs">Copiar</button>
      </div>
    </div>
  );
}

function BoletoBox({ total }) {
  const linha = "34191.79001 01043.510047 91020.150008 1 " + Math.floor(10000 + Math.random() * 89999) + "0000" + String(Math.round(total * 100));
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-steel p-5 text-left">
      <p className="text-center font-bold text-bone">Boleto gerado</p>
      <div className="my-3 flex h-12 items-end justify-center gap-px">
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i} className="bg-ink" style={{ width: Math.random() > 0.5 ? 3 : 1, height: "100%" }} />
        ))}
      </div>
      <p className="break-all text-center text-xs text-white/60">{linha}</p>
      <p className="mt-2 text-center text-xs text-white/40">Vencimento em 3 dias úteis</p>
    </div>
  );
}
