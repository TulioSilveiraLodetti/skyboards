import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { brl } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";

const tabs = [
  { key: "perfil", label: "Dados da conta" },
  { key: "pedidos", label: "Meus pedidos" },
  { key: "favoritos", label: "Favoritos" },
];

export default function Conta() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "perfil";
  const { user, logout, updateUser } = useAuth();

  return (
    <div className="container-x pt-28 pb-20">
      <h1 className="font-display text-5xl font-black">Olá, {user?.nome || "skatista"} 👋</h1>
      <p className="mt-2 text-white/50">{user?.email}</p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setParams({ tab: t.key })}
            className={`chip ${tab === t.key ? "border-volt bg-volt text-ink" : "hover:border-volt"}`}
          >
            {t.label}
          </button>
        ))}
        <button onClick={logout} className="chip ml-auto text-red-300 hover:border-red-400">Sair</button>
      </div>

      <div className="mt-8">
        {tab === "perfil" && <Perfil updateUser={updateUser} />}
        {tab === "pedidos" && <Pedidos />}
        {tab === "favoritos" && <Favoritos />}
      </div>
    </div>
  );
}

function Perfil({ updateUser }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: "", telefone: "", endereco: "", email: "" });
  const [senhas, setSenhas] = useState({ senhaAtual: "", novaSenha: "" });
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setForm({
      nome: data.nome || "", telefone: data.telefone || "", endereco: data.endereco || "", email: data.email,
    }));
  }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/me", {
        nome: form.nome, telefone: form.telefone, endereco: form.endereco, email: form.email,
      });
      // se o email mudou, o back devolve um token novo (o email é o subject do JWT)
      if (data?.token) localStorage.setItem("sky_token", data.token);
      updateUser({ nome: form.nome, email: data?.usuario?.email || form.email });
      toast("Dados atualizados!");
    } catch (err) {
      toast(err?.response?.data?.message || "Erro ao salvar.", "erro");
    }
  };

  const trocarSenha = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/me/senha", senhas);
      setSenhas({ senhaAtual: "", novaSenha: "" });
      toast("Senha alterada!");
    } catch (err) {
      toast(err?.response?.data?.message || "Erro ao trocar senha.", "erro");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={salvar} className="rounded-2xl border border-white/10 bg-coal p-6">
        <h3 className="mb-4 text-lg font-bold">Informações pessoais</h3>
        <label className="label">Nome</label>
        <input value={form.nome} onChange={up("nome")} className="input" />
        <label className="label mt-4">E-mail</label>
        <input type="email" value={form.email} onChange={up("email")} className="input" />
        <p className="mt-1 text-xs text-white/40">Você pode trocar seu e-mail. Use um e-mail válido e que ainda não esteja em uso.</p>
        <label className="label mt-4">Telefone</label>
        <input value={form.telefone} onChange={up("telefone")} className="input" />
        <label className="label mt-4">Endereço</label>
        <input value={form.endereco} onChange={up("endereco")} className="input" placeholder="Rua, número, cidade/UF" />
        <button className="btn btn-volt mt-6 w-full">Salvar alterações</button>
      </form>

      <form onSubmit={trocarSenha} className="h-fit rounded-2xl border border-white/10 bg-coal p-6">
        <h3 className="mb-4 text-lg font-bold">Alterar senha</h3>
        <label className="label">Senha atual</label>
        <input type="password" required value={senhas.senhaAtual} onChange={(e) => setSenhas({ ...senhas, senhaAtual: e.target.value })} className="input" />
        <label className="label mt-4">Nova senha</label>
        <input type="password" required value={senhas.novaSenha} onChange={(e) => setSenhas({ ...senhas, novaSenha: e.target.value })} className="input" />
        <button className="btn btn-dark mt-6 w-full">Trocar senha</button>
      </form>
    </div>
  );
}

const statusCor = {
  PENDENTE: "bg-yellow-500/15 text-yellow-300",
  PAGO: "bg-blue-500/15 text-blue-300",
  ENVIADO: "bg-purple-500/15 text-purple-300",
  ENTREGUE: "bg-volt/15 text-volt",
  CANCELADO: "bg-red-500/15 text-red-300",
};

function Pedidos() {
  const [pedidos, setPedidos] = useState(null);
  useEffect(() => {
    api.get("/pedidos/meus").then(({ data }) => setPedidos(data)).catch(() => setPedidos([]));
  }, []);

  if (pedidos === null) return <p className="text-white/40">Carregando...</p>;
  if (pedidos.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-coal p-12 text-center text-white/50">Você ainda não fez pedidos.</div>;

  return (
    <div className="space-y-4">
      {pedidos.map((p) => {
        let itens = [];
        try { itens = JSON.parse(p.itensJson || "[]"); } catch { itens = []; }
        return (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-coal p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">Pedido #{p.id}</p>
                <p className="text-xs text-white/40">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("pt-BR") : ""} · {p.formaPagamento}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusCor[p.status] || "bg-white/10"}`}>{p.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {itens.map((i, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-white/5 bg-steel p-2">
                  <img src={i.imagem} alt="" className="h-10 w-10 rounded bg-white object-cover" />
                  <span className="text-xs text-white/70">{i.qtd}x {i.nome?.slice(0, 22)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-white/10 pt-3">
              <span className="text-white/50">Total</span>
              <span className="font-bold text-volt">{brl(p.total)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Favoritos() {
  const [produtos, setProdutos] = useState(null);
  useEffect(() => {
    api.get("/favoritos/meus").then(({ data }) => setProdutos(data)).catch(() => setProdutos([]));
  }, []);

  if (produtos === null) return <p className="text-white/40">Carregando...</p>;
  if (produtos.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-coal p-12 text-center text-white/50">Nenhum favorito ainda. Toque no ♥ nos produtos.</div>;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {produtos.map((p) => <ProductCard key={p.id} produto={p} />)}
    </div>
  );
}
