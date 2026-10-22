import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Cadastro() {
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "" });

  const up = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.senha.length < 6) {
      toast("A senha precisa de ao menos 6 caracteres.", "erro");
      return;
    }
    try {
      await register(form);
      toast("Conta criada! Bem-vindo à cena.");
      nav("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Não foi possível criar a conta.";
      toast(msg, "erro");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 pt-24 pb-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full bg-volt/10 blur-[120px]" />
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-coal/80 p-8 backdrop-blur-xl">
        <Link to="/" className="mb-6 flex justify-center">
          <img src={logoWhite} alt="SkyBoard's" className="h-12 w-auto" />
        </Link>
        <h1 className="text-center font-display text-3xl font-black">Criar conta</h1>
        <p className="mb-6 text-center text-sm text-white/50">Junte-se à SkyBoard's</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input required value={form.nome} onChange={up("nome")} className="input" placeholder="Seu nome" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" required value={form.email} onChange={up("email")} className="input" placeholder="voce@email.com" />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input value={form.telefone} onChange={up("telefone")} className="input" placeholder="(48) 90000-0000" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" required value={form.senha} onChange={up("senha")} className="input" placeholder="mínimo 6 caracteres" />
          </div>
          <button disabled={loading} className="btn btn-volt w-full">{loading ? "Criando..." : "Criar conta"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-volt hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
