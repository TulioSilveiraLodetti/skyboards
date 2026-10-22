import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import logoWhite from "../assets/logo-white.png";

const paragrafos = [
  "A Skyboards Surf Skate Shop nasceu da paixão pelo universo do surf, skate e do estilo de vida que esses esportes representam. Nossa história começou em setembro de 2006, quando três jovens, movidos pelo sonho de empreender e pela paixão pela cultura board, decidiram abrir uma loja dedicada a quem vive esse estilo de vida.",
  "Desde o início, nosso objetivo sempre foi oferecer produtos de qualidade, das melhores marcas, aliados a um atendimento próximo, transparente e especializado. Mais do que vender roupas, calçados e acessórios, queremos proporcionar uma experiência para quem compartilha da mesma paixão pelo esporte, pela liberdade e pela autenticidade.",
  "Escolhemos atuar no ramo de Surf & Skate Shop porque acreditamos que esse universo vai muito além da moda: ele representa um estilo de vida, atitude e conexão com pessoas que valorizam qualidade, conforto e personalidade.",
  "Ao longo dos anos, conquistamos a confiança de nossos clientes através do compromisso, dedicação e da constante busca pelas melhores novidades do mercado. Cada cliente que entra em nossa loja faz parte da nossa história.",
  "Por trás da Skyboards está uma equipe apaixonada pelo que faz, sempre pronta para ajudar na escolha do produto ideal, oferecendo um atendimento de confiança e atenção em cada detalhe.",
  "Seja bem-vindo à Skyboards Surf Skate Shop. É um prazer fazer parte da sua história e continuar levando o melhor do universo surf e skate para você.",
];

export default function QuemSomos() {
  return (
    <div>
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[40vmax] w-[40vmax] -translate-x-1/2 rounded-full bg-volt/10 blur-[120px]" />
        <div className="container-x text-center">
          <Reveal>
            <img src={logoWhite} alt="SkyBoard's" className="mx-auto h-16 w-auto" />
            <span className="mt-6 block text-sm font-bold uppercase tracking-widest text-volt">Desde 2006</span>
            <h1 className="font-display text-5xl font-black sm:text-7xl">Quem Somos</h1>
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-20">
        <div className="mx-auto max-w-3xl space-y-6 text-[15px] leading-relaxed text-white/70">
          {paragrafos.map((p, i) => (
            <Reveal key={i} delay={i * 60} as="p" className={i === 0 ? "text-lg text-white/80" : ""}>
              {p}
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { n: "2006", l: "Desde" },
            { n: "+18", l: "Anos de estrada" },
            { n: "100%", l: "Original" },
            { n: "BR", l: "Entrega nacional" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80} className="rounded-2xl border border-white/10 bg-coal p-5 text-center">
              <p className="font-display text-3xl font-black text-volt">{s.n}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{s.l}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/produtos" className="btn btn-volt">Conheça a loja</Link>
        </div>
      </section>
    </div>
  );
}
