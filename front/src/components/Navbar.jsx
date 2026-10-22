import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/produtos?categoria=TENIS", label: "Tênis" },
  { to: "/produtos?categoria=CHINELO", label: "Chinelos" },
  { to: "/produtos?categoria=MOCHILA", label: "Mochilas" },
];

export default function Navbar() {
  const { count, setOpen } = useCart();
  const { user, isAuth, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [busca, setBusca] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitBusca = (e) => {
    e.preventDefault();
    nav(`/produtos?busca=${encodeURIComponent(busca)}`);
    setMenu(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl" : "bg-gradient-to-b from-ink/80 to-transparent"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link to="/" className="flex shrink-0 items-center" aria-label="SkyBoard's">
          <img src={logoWhite} alt="SkyBoard's Surf Skate Shop" className="h-9 w-auto sm:h-11" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "text-volt" : "text-bone/80 hover:text-volt"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <form onSubmit={submitBusca} className="hidden items-center md:flex">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar..."
              className="w-36 rounded-full border border-white/10 bg-steel/70 px-4 py-2 text-sm text-bone placeholder-white/30 outline-none transition focus:w-48 focus:border-volt"
            />
          </form>

          {isAuth ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-steel text-sm font-bold text-volt transition hover:border-volt"
              >
                {(user?.nome || user?.email || "U").charAt(0).toUpperCase()}
              </button>
              {menu && (
                <div
                  onMouseLeave={() => setMenu(false)}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-coal shadow-card"
                >
                  <div className="border-b border-white/5 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-bone">{user?.nome || "Minha conta"}</p>
                    <p className="truncate text-xs text-white/40">{user?.email}</p>
                  </div>
                  <MenuLink to="/conta" onClick={() => setMenu(false)}>Minha conta</MenuLink>
                  <MenuLink to="/conta?tab=pedidos" onClick={() => setMenu(false)}>Meus pedidos</MenuLink>
                  <MenuLink to="/conta?tab=favoritos" onClick={() => setMenu(false)}>Favoritos</MenuLink>
                  {isAdmin && <MenuLink to="/admin" onClick={() => setMenu(false)}>Painel admin</MenuLink>}
                  <button
                    onClick={() => { logout(); setMenu(false); nav("/"); }}
                    className="block w-full px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost hidden py-2 text-xs sm:inline-flex">
              Entrar
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir carrinho"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-steel transition hover:border-volt"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-bone" fill="none" strokeWidth="2">
              <path d="M3 3h2l2.4 12.3a2 2 0 0 0 2 1.7h8.7a2 2 0 0 0 2-1.6L23 6H6" />
              <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-volt px-1 text-[11px] font-black text-ink">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenu((m) => !m)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-steel lg:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-bone" fill="none" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>

      {menu && (
        <div className="border-t border-white/10 bg-ink/95 px-4 pb-4 pt-2 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenu(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-bone/90 hover:bg-steel"
            >
              {l.label}
            </NavLink>
          ))}
          {!isAuth && (
            <Link to="/login" onClick={() => setMenu(false)} className="btn btn-volt mt-2 w-full">
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block px-4 py-3 text-sm text-bone/90 transition hover:bg-steel">
      {children}
    </Link>
  );
}
