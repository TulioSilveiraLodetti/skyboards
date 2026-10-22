import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const destino = loc.state?.from || "/";

  const submit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(email, senha);
      toast(`Bem-vindo, ${u.nome || "skatista"}!`);
      nav(u.tipo === "ADMIN" ? "/admin" : destino, { replace: true });
    } catch {
      toast("E-mail ou senha incorretos.", "erro");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 pt-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full bg-volt/10 blur-[120px]" />
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-coal/80 p-8 backdrop-blur-xl">
        <Link to="/" className="mb-6 flex justify-center">
          <img src={logoWhite} alt="SkyBoard's" className="h-12 w-auto" />
        </Link>
        <h1 className="text-center font-display text-3xl font-black">Entrar</h1>
        <p className="mb-6 text-center text-sm text-white/50">Acesse sua conta SkyBoard's</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="voce@email.com" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="btn btn-volt w-full">{loading ? "Entrando..." : "Entrar"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-volt hover:underline">Criar agora</Link>
        </p>
      </div>
    </div>
  );
}
