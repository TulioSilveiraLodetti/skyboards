import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { brl } from "../lib/format";
import { useToast } from "../context/ToastContext";

const tabs = [
  { key: "dashboard", label: "Estatísticas" },
  { key: "produtos", label: "Produtos" },
  { key: "promocoes", label: "Promoções" },
  { key: "pedidos", label: "Pedidos" },
  { key: "usuarios", label: "Usuários" },
];

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
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
        {tab === "dashboard" && <Dashboard />}
        {tab === "produtos" && <Produtos />}
        {tab === "promocoes" && <Promocoes />}
        {tab === "pedidos" && <Pedidos />}
        {tab === "usuarios" && <Usuarios />}
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD / ESTATÍSTICAS ---------------- */
const STATUS_CORES = {
  PENDENTE: "#eab308", PAGO: "#3b82f6", ENVIADO: "#a855f7", ENTREGUE: "#d7ff3e", CANCELADO: "#ef4444",
};

function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cupons, setCupons] = useState([]);

  useEffect(() => {
    api.get("/produtos").then(({ data }) => setProdutos(data)).catch(() => {});
    api.get("/pedidos").then(({ data }) => setPedidos(data)).catch(() => {});
    api.get("/usuarios").then(({ data }) => setUsuarios(data)).catch(() => {});
    api.get("/cupons").then(({ data }) => setCupons(data)).catch(() => {});
  }, []);

  const s = useMemo(() => {
    const faturamento = pedidos.reduce((a, p) => a + Number(p.total || 0), 0);
    const ticket = pedidos.length ? faturamento / pedidos.length : 0;
    const estoqueTotal = produtos.reduce((a, p) => a + (p.estoque || 0), 0);
    const valorEstoque = produtos.reduce((a, p) => a + Number(p.preco || 0) * (p.estoque || 0), 0);
    const esgotados = produtos.filter((p) => p.estoque === 0).length;
    const emPromo = produtos.filter((p) => p.descontoPercent).length;

    const porStatus = {};
    pedidos.forEach((p) => { porStatus[p.status] = (porStatus[p.status] || 0) + 1; });

    const porCategoria = {};
    produtos.forEach((p) => { porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1; });

    const porMarca = {};
    produtos.forEach((p) => { porMarca[p.marca] = (porMarca[p.marca] || 0) + 1; });

    const porPagamento = {};
    pedidos.forEach((p) => { if (p.formaPagamento) porPagamento[p.formaPagamento] = (porPagamento[p.formaPagamento] || 0) + 1; });

    return {
      faturamento, ticket, estoqueTotal, valorEstoque, esgotados, emPromo,
      porStatus, porCategoria, porMarca, porPagamento,
      admins: usuarios.filter((u) => u.nivelAcesso === "ADMIN").length,
      clientes: usuarios.filter((u) => u.nivelAcesso !== "ADMIN").length,
    };
  }, [produtos, pedidos, usuarios]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Faturamento" value={brl(s.faturamento)} icon="💰" />
        <Kpi label="Pedidos" value={pedidos.length} icon="🧾" />
        <Kpi label="Ticket médio" value={brl(s.ticket)} icon="📈" />
        <Kpi label="Clientes" value={s.clientes} icon="👟" />
        <Kpi label="Produtos" value={produtos.length} icon="📦" />
        <Kpi label="Itens em estoque" value={s.estoqueTotal} icon="🏷️" />
        <Kpi label="Valor em estoque" value={brl(s.valorEstoque)} icon="🏦" />
        <Kpi label="Esgotados" value={s.esgotados} icon="🚫" />
        <Kpi label="Em promoção" value={s.emPromo} icon="🔥" />
        <Kpi label="Cupons ativos" value={cupons.length} icon="🎟️" />
        <Kpi label="Admins" value={s.admins} icon="🛡️" />
        <Kpi label="Usuários" value={usuarios.length} icon="👥" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Painel titulo="Pedidos por status">
          {Object.keys(s.porStatus).length === 0 ? <Vazio /> : (
            <Barras dados={Object.entries(s.porStatus).map(([k, v]) => ({ label: k, valor: v, cor: STATUS_CORES[k] }))} />
          )}
        </Painel>

        <Painel titulo="Produtos por categoria">
          <Barras dados={Object.entries(s.porCategoria).map(([k, v]) => ({ label: k, valor: v }))} />
        </Painel>

        <Painel titulo="Produtos por marca">
          <Barras dados={Object.entries(s.porMarca).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, valor: v }))} />
        </Painel>

        <Painel titulo="Pagamentos usados">
          {Object.keys(s.porPagamento).length === 0 ? <Vazio /> : (
            <Barras dados={Object.entries(s.porPagamento).map(([k, v]) => ({ label: k, valor: v }))} />
          )}
        </Painel>
      </div>

      <Painel titulo="Produtos mais caros">
        <div className="space-y-2">
          {[...produtos].sort((a, b) => b.preco - a.preco).slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-steel px-4 py-2">
              <span className="line-clamp-1 text-sm">{p.nome}</span>
              <span className="font-bold text-volt">{brl(p.preco)}</span>
            </div>
          ))}
        </div>
      </Painel>
    </div>
  );
}

function Kpi({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-coal p-5">
      <div className="mb-2 text-2xl">{icon}</div>
      <p className="text-2xl font-black text-bone">{value}</p>
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

function Painel({ titulo, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-coal p-5">
      <h3 className="mb-4 font-bold">{titulo}</h3>
      {children}
    </div>
  );
}

function Vazio() {
  return <p className="py-6 text-center text-sm text-white/40">Sem dados ainda.</p>;
}

function Barras({ dados }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  return (
    <div className="space-y-3">
      {dados.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-white/60">{d.label}</span>
            <span className="font-bold text-bone">{d.valor}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-steel">
            <div className="h-full rounded-full" style={{ width: `${(d.valor / max) * 100}%`, background: d.cor || "#d7ff3e" }} />
          </div>
        </div>
      ))}
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
      <div onClick={(e) => e.stopPropagation()} className="my-8 w-full max-w-5xl rounded-3xl border border-white/10 bg-coal p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold">{form.id ? "Editar" : "Novo"} produto</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:border-volt" aria-label="Fechar">
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-bone" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nome" className="sm:col-span-2 lg:col-span-3"><input value={form.nome} onChange={up("nome")} className="input" /></Field>
          <Field label="Marca"><input value={form.marca} onChange={up("marca")} className="input" /></Field>
          <Field label="Categoria">
            <select value={form.categoria} onChange={up("categoria")} className="input">
              <option value="TENIS">Tênis</option><option value="CHINELO">Chinelo</option><option value="MOCHILA">Mochila</option>
            </select>
          </Field>
          <Field label="Cor"><input value={form.cor || ""} onChange={up("cor")} className="input" /></Field>
          <Field label="Preço"><input type="number" step="0.01" value={form.preco} onChange={up("preco")} className="input" /></Field>
          <Field label="Preço antigo"><input type="number" step="0.01" value={form.precoAntigo || ""} onChange={up("precoAntigo")} className="input" /></Field>
          <Field label="Desconto %"><input type="number" value={form.descontoPercent || ""} onChange={up("descontoPercent")} className="input" /></Field>
          <Field label="Estoque"><input type="number" value={form.estoque} onChange={up("estoque")} className="input" /></Field>
          <Field label="Tamanhos (csv)" className="lg:col-span-2"><input value={form.tamanhos || ""} onChange={up("tamanhos")} className="input" /></Field>
          <Field label="Imagem (URL)" className="sm:col-span-2 lg:col-span-3"><input value={form.imagem || ""} onChange={up("imagem")} className="input" /></Field>
          <Field label="Descrição" className="sm:col-span-2 lg:col-span-3"><textarea value={form.descricao || ""} onChange={up("descricao")} rows={2} className="input" /></Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-3">
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
  const [editId, setEditId] = useState(null);

  const carregar = () => api.get("/cupons").then(({ data }) => setLista(data));
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, percentual: Number(form.percentual) };
      if (editId) await api.put(`/cupons/${editId}`, payload);
      else await api.post("/cupons", payload);
      setForm({ codigo: "", percentual: "", descricao: "" });
      setEditId(null);
      toast(editId ? "Cupom atualizado!" : "Cupom criado!");
      carregar();
    } catch {
      toast("Erro ao salvar cupom (código já existe?).", "erro");
    }
  };

  const editar = (c) => { setForm({ codigo: c.codigo, percentual: c.percentual, descricao: c.descricao || "" }); setEditId(c.id); };
  const excluir = async (id) => { await api.delete(`/cupons/${id}`); toast("Cupom removido."); if (editId === id) { setEditId(null); setForm({ codigo: "", percentual: "", descricao: "" }); } carregar(); };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={salvar} className="h-fit rounded-2xl border border-white/10 bg-coal p-6">
        <h3 className="mb-4 text-lg font-bold">{editId ? "Editar cupom" : "Novo cupom"}</h3>
        <label className="label">Código</label>
        <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} className="input" placeholder="SKATE10" disabled={!!editId} />
        <label className="label mt-4">Percentual (%)</label>
        <input type="number" value={form.percentual} onChange={(e) => setForm({ ...form, percentual: e.target.value })} className="input" />
        <label className="label mt-4">Descrição</label>
        <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input" />
        <button className="btn btn-volt mt-6 w-full">{editId ? "Salvar alterações" : "Criar cupom"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ codigo: "", percentual: "", descricao: "" }); }} className="btn btn-ghost mt-2 w-full">Cancelar edição</button>}
      </form>

      <div className="lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {lista.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-volt/20 bg-gradient-to-r from-volt/10 to-coal p-5">
              <div>
                <p className="font-display text-2xl font-black text-volt">{c.codigo}</p>
                <p className="text-sm text-white/60">{c.percentual}% OFF · {c.descricao}</p>
              </div>
              <div className="flex flex-col gap-1 text-right text-sm">
                <button onClick={() => editar(c)} className="text-white/60 hover:text-volt">editar</button>
                <button onClick={() => excluir(c.id)} className="text-white/40 hover:text-red-400">excluir</button>
              </div>
            </div>
          ))}
          {lista.length === 0 && <p className="text-white/40">Nenhum cupom cadastrado.</p>}
        </div>
        <p className="mt-4 text-sm text-white/40">Dica: promoções por produto (desconto %) são definidas na aba <span className="text-volt">Produtos</span>, no campo "Desconto %".</p>
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
          <tr><th className="p-3">#</th><th className="p-3">Cliente</th><th className="p-3">Entrega</th><th className="p-3">Total</th><th className="p-3">Pagamento</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id} className="border-t border-white/5 align-top">
              <td className="p-3 font-bold">{p.id}</td>
              <td className="p-3">{p.nomeCliente}<br /><span className="text-xs text-white/40">{p.usuarioEmail}</span></td>
              <td className="p-3 text-xs text-white/50">{p.tipoEntrega || "—"}<br />{p.enderecoEntrega}</td>
              <td className="p-3 font-semibold text-volt">{brl(p.total)}</td>
              <td className="p-3 text-white/60">{p.formaPagamento}{p.parcelas > 1 ? ` ${p.parcelas}x` : ""}</td>
              <td className="p-3">
                <select value={p.status} onChange={(e) => mudarStatus(p.id, e.target.value)} className="rounded-lg border border-white/10 bg-steel px-3 py-1.5 text-xs outline-none focus:border-volt">
                  {STATUS.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/40">Nenhum pedido.</td></tr>}
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
          <tr>
            <th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Telefone</th>
            <th className="p-3">Endereço</th><th className="p-3">Nível</th><th className="p-3">Criado em</th><th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id} className="border-t border-white/5 align-top">
              <td className="p-3 font-medium">{u.nome || "—"}</td>
              <td className="p-3 text-white/60">{u.email}</td>
              <td className="p-3 text-white/60">{u.telefone || "—"}</td>
              <td className="p-3 text-xs text-white/50">{u.endereco || "—"}</td>
              <td className="p-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.nivelAcesso === "ADMIN" ? "bg-volt/15 text-volt" : "bg-white/10 text-white/60"}`}>
                  {u.nivelAcesso}
                </span>
              </td>
              <td className="p-3 text-xs text-white/50">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}</td>
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
