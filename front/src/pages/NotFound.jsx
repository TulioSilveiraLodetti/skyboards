import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-display text-[20vw] font-black leading-none text-volt/20 sm:text-[12rem]">404</p>
        <h1 className="font-display text-3xl font-black">Essa manobra não existe</h1>
        <p className="mt-2 text-white/50">A página que você procurou saiu do pico.</p>
        <Link to="/" className="btn btn-volt mt-7">Voltar pro início</Link>
      </div>
    </div>
  );
}
