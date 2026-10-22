import { Link } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-coal">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <img src={logoWhite} alt="SkyBoard's" className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-white/50">
            Surf · Skate · Shop. As melhores marcas de tênis, chinelos e mochilas com entrega para todo o Brasil.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-volt">Loja</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/produtos" className="hover:text-volt">Todos os produtos</Link></li>
            <li><Link to="/produtos?categoria=TENIS" className="hover:text-volt">Tênis</Link></li>
            <li><Link to="/produtos?categoria=CHINELO" className="hover:text-volt">Chinelos</Link></li>
            <li><Link to="/produtos?categoria=MOCHILA" className="hover:text-volt">Mochilas</Link></li>
            <li><Link to="/produtos?destaque=1" className="hover:text-volt">Promoções</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-volt">Conta</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/login" className="hover:text-volt">Entrar</Link></li>
            <li><Link to="/cadastro" className="hover:text-volt">Criar conta</Link></li>
            <li><Link to="/conta?tab=pedidos" className="hover:text-volt">Meus pedidos</Link></li>
            <li><Link to="/conta?tab=favoritos" className="hover:text-volt">Favoritos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-volt">Contato</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>Rua Cel. Marcos Rovaris · Içara/SC</li>
            <li>(48) 3434-2490</li>
            <li>skyboards_icara@hotmail.com</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <Social label="Instagram" />
            <Social label="WhatsApp" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} SkyBoard's Surf Skate Shop. Todos os direitos reservados.</p>
          <p>Feito com estilo para a cena do skate.</p>
        </div>
      </div>
    </footer>
  );
}

function Social({ label }) {
  return (
    <span className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-steel text-xs font-bold text-white/60 transition hover:border-volt hover:text-volt">
      {label.charAt(0)}
    </span>
  );
}
