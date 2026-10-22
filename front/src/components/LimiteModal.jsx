import { useCart } from "../context/CartContext";
import { LIMITE_POR_PRODUTO, waMsg } from "../lib/config";

export default function LimiteModal() {
  const { limite, setLimite } = useCart();
  if (!limite) return null;

  const link = waMsg(
    `Olá! Quero comprar mais de ${LIMITE_POR_PRODUTO} unidades do produto "${limite.nome}". Pode me ajudar?`
  );

  return (
    <div
      className="fixed inset-0 z-[130] grid place-items-center bg-ink/80 p-4 backdrop-blur"
      onClick={() => setLimite(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-volt/30 bg-coal p-7 text-center"
      >
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-volt/15 text-3xl">
          ⚠️
        </div>
        <h3 className="font-display text-2xl font-black">Limite por produto atingido</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Você atingiu o limite de <span className="font-bold text-volt">{LIMITE_POR_PRODUTO} unidades</span> deste
          produto por pedido:
          <br />
          <span className="font-semibold text-bone">{limite.nome}</span>.
        </p>
        <p className="mt-3 text-sm text-white/60">
          Precisa de uma quantidade maior? Fale com a gente no WhatsApp que a gente resolve pra você. 🛹
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="btn btn-volt flex-1"
            onClick={() => setLimite(null)}
          >
            Falar no WhatsApp
          </a>
          <button onClick={() => setLimite(null)} className="btn btn-ghost">
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
