import { useEffect, useState } from "react";
import api from "../lib/api";
import { brl } from "../lib/format";
import { useToast } from "../context/ToastContext";

const tabs = [
  { key: "produtos", label: "Produtos" },
  { key: "promocoes", label: "Promoções" },
  { key: "pedidos", label: "Pedidos" },
  { key: "usuarios", label: "Usuários" },
];

export default function Admin() {
  const [tab, setTab] = useState("produtos");
  return (
    <div className="container-x pt-28 pb-20">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-volt px-3 py-1 text-xs font-black text-ink">ADMIN</span>
        <h1 className="font-display text-4xl font-black sm:text-5xl">Painel</h1>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`chip ${tab === t.key ? "border-volt bg-volt text-ink" : "hover:border-volt"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "produtos" && <Produtos />}
        {tab === "promocoes" && <Promocoes />}
        {tab === "pedidos" && <Pedidos />}
        {tab === "usuarios" && <Usuarios />}
      </div>
    </div>
  );
}

/* ---------------- PRODUTOS ---------------- */
const vazio = {
  nome: "", marca: "Vans", categoria: "TENIS", preco: "", precoAntigo: "",
  descontoPercent: "", cor: "", estoque: 0, tamanhos: "36,37,38,39,40,41,42,43,44",
  imagem: "", descricao: "", destaque: false,
};

function Produtos() {
  const { toast } = useToast();
  const [lista, setLista] = useState([]);
  const [editando, setEditando] = useState(null);

  const carregar = () => api.get("/produtos").then(({ data }) => setLista(data));
  useEffect(() => { carregar(); }, []);

  const salvar = async (form) => {
    const payload = {
      ...form,
      preco: Number(form.preco),
      precoAntigo: form.precoAntigo ? Number(form.precoAntigo) : null,
      descontoPercent: form.descontoPercent ? Number(form.descontoPercent) : null,
      estoque: Number(form.estoque),
    };
    try {
      if (form.id) await api.put(`/produtos/${form.id}`, payload);
      else await api.post("/produtos", payload);
      toast("Produto salvo!");
      setEditando(null);
      carregar();
    } catch {
      toast("Erro ao salvar produto.", "erro");
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Excluir este produto?")) return;
    await api.delete(`/produtos/${id}`);
    toast("Produto excluído.");
    carregar();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-white/50">{lista.length} produtos</p>
        <button onClick={() => setEditando(vazio)} className="btn btn-volt py-2.5">+ Novo produto</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-steel text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="p-3">Produto</th><th className="p-3">Categoria</th>
              <th className="p-3">Preço</th><th className="p-3">Estoque</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="flex items-center gap-3 p-3">
                  <img src={p.imagem} alt="" className="h-10 w-10 rounded bg-white object-cover" />
                  <span className="line-clamp-1 max-w-[16rem] font-medium">{p.nome}</span>
                </td>
                <td className="p-3 text-white/60">{p.categoria}</td>
                <td className="p-3 font-semibold text-volt">{brl(p.preco)}</td>
                <td className="p-3">{p.estoque}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditando(p)} className="mr-2 text-white/60 hover:text-volt">editar</button>
                  <button onClick={() => excluir(p.id)} className="text-white/40 hover:text-red-400">excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && <ProdutoModal inicial={editando} onClose={() => setEditando(null)} onSave={salvar} />}
    </div>
  );
}

function ProdutoModal({ inicial, onClose, onSave }) {
  const [form, setForm] = useState(inicial);
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-ink/80 p-4 backdrop-blur" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-coal p-6">
        <h3 className="mb-5 text-xl font-bold">{form.id ? "Editar" : "Novo"} produto</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2"><input value={form.nome} onChange={up("nome")} className="input" /></Field>
          <Field label="Marca"><input value={form.marca} onChange={up("marca")} className="input" /></Field>
          <Field label="Categoria">
            <select value={form.categoria} onChange={up("categoria")} className="input">
              <option value="TENIS">Tênis</option><option value="CHINELO">Chinelo</option><option value="MOCHILA">Mochila</option>
            </select>
          </Field>
          <Field label="Preço"><input type="number" step="0.01" value={form.preco} onChange={up("preco")} className="input" /></Field>
          <Field label="Preço antigo"><input type="number" step="0.01" value={form.precoAntigo || ""} onChange={up("precoAntigo")} className="input" /></Field>
          <Field label="Desconto %"><input type="number" value={form.descontoPercent || ""} onChange={up("descontoPercent")} className="input" /></Field>
          <Field label="Estoque"><input type="number" value={form.estoque} onChange={up("estoque")} className="input" /></Field>
          <Field label="Cor"><input value={form.cor || ""} onChange={up("cor")} className="input" /></Field>
          <Field label="Tamanhos (csv)"><input value={form.tamanhos || ""} onChange={up("tamanhos")} className="input" /></Field>
          <Field label="Imagem (URL)" className="sm:col-span-2"><input value={form.imagem || ""} onChange={up("imagem")} className="input" /></Field>
          <Field label="Descrição" className="sm:col-span-2"><textarea value={form.descricao || ""} onChange={up("descricao")} rows={3} className="input" /></Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={!!form.destaque} onChange={up("destaque")} className="h-4 w-4 accent-[#d7ff3e]" />
            Marcar como destaque
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => onSave(form)} className="btn btn-volt flex-1">Salvar</button>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return <div className={className}><label className="label">{label}</label>{children}</div>;
}

/* ---------------- PROMOÇÕES ---------------- */
function Promocoes() {
  const { toast } = useToast();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ codigo: "", percentual: "", descricao: "" });

  const carregar = () => api.get("/cupons").then(({ data }) => setLista(data));
  useEffect(() => { carregar(); }, []);

  const criar = async (e) => {
    e.preventDefault();
    try {
      await api.post("/cupons", { ...form, percentual: Number(form.percentual) });
      setForm({ codigo: "", percentual: "", descricao: "" });
      toast("Cupom criado!");
      carregar();
    } catch {
      toast("Erro ao criar cupom (código já existe?).", "erro");
    }
  };

  const excluir = async (id) => {
    await api.delete(`/cupons/${id}`);
    toast("Cupom removido.");
    carregar();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={criar} className="h-fit rounded-2xl border border-white/10 bg-coal p-6">
        <h3 className="mb-4 text-lg font-bold">Novo cupom</h3>
        <label className="label">Código</label>
        <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} className="input" placeholder="SKATE10" />
        <label className="label mt-4">Percentual (%)</label>
        <input type="number" value={form.percentual} onChange={(e) => setForm({ ...form, percentual: e.target.value })} className="input" />
        <label className="label mt-4">Descrição</label>
        <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input" />
        <button className="btn btn-volt mt-6 w-full">Criar cupom</button>
      </form>

      <div className="lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {lista.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-volt/20 bg-gradient-to-r from-volt/10 to-coal p-5">
              <div>
                <p className="font-display text-2xl font-black text-volt">{c.codigo}</p>
                <p className="text-sm text-white/60">{c.percentual}% OFF · {c.descricao}</p>
              </div>
              <button onClick={() => excluir(c.id)} className="text-white/40 hover:text-red-400">excluir</button>
            </div>
          ))}
          {lista.length === 0 && <p className="text-white/40">Nenhum cupom cadastrado.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- PEDIDOS ---------------- */
const STATUS = ["PENDENTE", "PAGO", "ENVIADO", "ENTREGUE", "CANCELADO"];

function Pedidos() {
  const { toast } = useToast();
  const [lista, setLista] = useState([]);
  const carregar = () => api.get("/pedidos").then(({ data }) => setLista(data));
  useEffect(() => { carregar(); }, []);

  const mudarStatus = async (id, status) => {
    await api.put(`/pedidos/${id}/status`, null, { params: { status } });
    toast("Status atualizado.");
    carregar();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-steel text-xs uppercase tracking-wider text-white/50">
          <tr><th className="p-3">#</th><th className="p-3">Cliente</th><th className="p-3">Total</th><th className="p-3">Pagamento</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id} className="border-t border-white/5">
              <td className="p-3 font-bold">{p.id}</td>
              <td className="p-3">{p.nomeCliente}<br /><span className="text-xs text-white/40">{p.usuarioEmail}</span></td>
              <td className="p-3 font-semibold text-volt">{brl(p.total)}</td>
              <td className="p-3 text-white/60">{p.formaPagamento}</td>
              <td className="p-3">
                <select value={p.status} onChange={(e) => mudarStatus(p.id, e.target.value)} className="rounded-lg border border-white/10 bg-steel px-3 py-1.5 text-xs outline-none focus:border-volt">
                  {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/40">Nenhum pedido.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- USUÁRIOS ---------------- */
function Usuarios() {
  const { toast } = useToast();
  const [lista, setLista] = useState([]);
  const carregar = () => api.get("/usuarios").then(({ data }) => setLista(data));
  useEffect(() => { carregar(); }, []);

  const excluir = async (id) => {
    if (!window.confirm("Remover este usuário?")) return;
    await api.delete(`/usuarios/${id}`);
    toast("Usuário removido.");
    carregar();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-steel text-xs uppercase tracking-wider text-white/50">
          <tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Nível</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id} className="border-t border-white/5">
              <td className="p-3 font-medium">{u.nome || "—"}</td>
              <td className="p-3 text-white/60">{u.email}</td>
              <td className="p-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.nivelAcesso === "ADMIN" ? "bg-volt/15 text-volt" : "bg-white/10 text-white/60"}`}>
                  {u.nivelAcesso}
                </span>
              </td>
              <td className="p-3 text-right">
                <button onClick={() => excluir(u.id)} className="text-white/40 hover:text-red-400">remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
