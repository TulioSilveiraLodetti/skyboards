import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../lib/api";
import Marquee from "../components/Marquee";
import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import useReducedMotion from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const categorias = [
  { nome: "Tênis", key: "TENIS", desc: "Vans · Nike SB", emoji: "👟" },
  { nome: "Chinelos", key: "CHINELO", desc: "Sliders La Costa", emoji: "🩴" },
  { nome: "Mochilas", key: "MOCHILA", desc: "Old Skool", emoji: "🎒" },
];

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [novidades, setNovidades] = useState([]);
  const heroRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    api.get("/produtos", { params: { destaque: true } }).then(({ data }) => setDestaques(data.slice(0, 8)));
    api.get("/produtos").then(({ data }) => setNovidades(data.slice(0, 8)));
  }, []);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-line", { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.12 })
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .from(".hero-shoe", { scale: 0.6, rotate: -18, opacity: 0, duration: 1, ease: "back.out(1.6)" }, "-=0.8")
        .from(".hero-badge", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.4");

      // parallax do tênis no hero
      gsap.to(".hero-shoe", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-bgword", {
        xPercent: -15,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [reduced, destaques.length]);

  const heroShoe = destaques[0]?.imagem;

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/10 blur-[120px]" />
          <span className="hero-bgword absolute -right-10 top-1/3 select-none text-[22vw] font-black leading-none text-white/[0.03]">
            SKATE
          </span>
        </div>

        <div className="container-x grid items-center gap-8 py-10 lg:grid-cols-2">
          <div>
            <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-volt">
              ● Surf · Skate · Shop
            </span>
            <h1 className="mt-5 font-display text-[16vw] font-black leading-[0.82] sm:text-7xl lg:text-8xl">
              <span className="block overflow-hidden"><span className="hero-line block">ROLE</span></span>
              <span className="block overflow-hidden"><span className="hero-line block text-volt">COM</span></span>
              <span className="block overflow-hidden"><span className="hero-line block text-stroke">ESTILO</span></span>
            </h1>
            <p className="hero-sub mt-6 max-w-md text-lg text-white/60">
              Tênis, chinelos e mochilas das marcas que a cena respeita. Vans, Nike SB e mais, com entrega pra todo o Brasil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/produtos" className="hero-cta btn btn-volt">Ver coleção</Link>
              <Link to="/produtos?destaque=1" className="hero-cta btn btn-ghost">Promoções 🔥</Link>
            </div>
          </div>

          <div className="relative hidden h-[460px] items-center justify-center lg:flex">
            {heroShoe && (
              <>
                <div className="absolute h-80 w-80 rounded-full border border-white/10 bg-steel/40" />
                <div className="absolute h-96 w-96 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-white/10" />
                <img src={heroShoe} alt="Destaque SkyBoard's" className="hero-shoe relative z-10 w-[26rem] rotate-[-8deg] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
                <Link to={`/produto/${destaques[0]?.id}`} className="absolute bottom-4 right-6 z-20 rounded-2xl border border-white/10 bg-ink/80 px-4 py-3 backdrop-blur">
                  <p className="text-xs text-white/50">Destaque</p>
                  <p className="max-w-[12rem] truncate text-sm font-bold">{destaques[0]?.nome}</p>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-white/30">
          role pra baixo ↓
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-white/10 bg-coal py-2">
        <Marquee items={["Entrega Brasil", "Vans", "Nike SB", "Até 12x", "Skate Shop", "Içara/SC", "Originais"]} />
      </section>

      {/* CATEGORIAS */}
      <section className="container-x py-20">
        <Reveal className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-4xl font-black sm:text-5xl">Categorias</h2>
          <Link to="/produtos" className="text-sm font-semibold text-volt hover:underline">Ver tudo →</Link>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {categorias.map((c, i) => (
            <Reveal key={c.key} delay={i * 100}>
              <Link
                to={`/produtos?categoria=${c.key}`}
                className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-steel to-coal p-6 transition hover:border-volt"
              >
                <span className="text-5xl">{c.emoji}</span>
                <div>
                  <h3 className="font-display text-3xl font-black transition group-hover:text-volt">{c.nome}</h3>
                  <p className="text-sm text-white/50">{c.desc}</p>
                </div>
                <span className="absolute -right-6 -top-6 text-[8rem] font-black text-white/[0.03] transition group-hover:text-volt/10">
                  {c.nome.charAt(0)}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container-x pb-20">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-volt">Seleção</span>
            <h2 className="font-display text-4xl font-black sm:text-5xl">Destaques da loja</h2>
          </div>
          <Link to="/produtos?destaque=1" className="text-sm font-semibold text-volt hover:underline">Ver todos →</Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {destaques.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard produto={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container-x pb-20">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-volt/20 bg-gradient-to-r from-volt/15 via-coal to-coal p-10 sm:p-16">
          <span className="absolute -right-10 -top-10 text-[12rem] font-black leading-none text-volt/10">%</span>
          <span className="text-sm font-bold uppercase tracking-widest text-volt">Cupom de boas-vindas</span>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-black sm:text-6xl">
            15% OFF na sua primeira compra
          </h2>
          <p className="mt-4 max-w-md text-white/60">
            Use o cupom <span className="font-bold text-volt">BEMVINDO15</span> no carrinho e economize nos seus próximos rolês.
          </p>
          <Link to="/produtos" className="btn btn-volt mt-7">Aproveitar agora</Link>
        </Reveal>
      </section>

      {/* NOVIDADES */}
      <section className="container-x pb-24">
        <Reveal className="mb-10">
          <span className="text-sm font-bold uppercase tracking-widest text-volt">Acabou de chegar</span>
          <h2 className="font-display text-4xl font-black sm:text-5xl">Novidades</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {novidades.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard produto={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/produtos" className="btn btn-ghost">Ver todos os produtos</Link>
        </div>
      </section>
    </div>
  );
}
