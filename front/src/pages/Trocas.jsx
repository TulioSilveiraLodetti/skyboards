import { Link } from "react-router-dom";
import { WHATSAPP_LINK } from "../lib/config";
import Reveal from "../components/Reveal";

export default function Trocas() {
  return (
    <div className="container-x pt-28 pb-24">
      <nav className="mb-6 text-sm text-white/40">
        <Link to="/" className="hover:text-volt">Início</Link> / <span className="text-white/70">Trocas e Devoluções</span>
      </nav>

      <Reveal>
        <span className="text-sm font-bold uppercase tracking-widest text-volt">Política</span>
        <h1 className="font-display text-5xl font-black sm:text-6xl">Trocas e Devoluções</h1>
      </Reveal>

      <Reveal className="mt-10 max-w-3xl space-y-6 text-[15px] leading-relaxed text-white/70">
        <p>
          Em caso de defeito de fabricação, danos na viajem, ou outro motivo qualquer por avaria na peça, o produto
          adquirido em nosso estabelecimento apresente defeito nas 48 horas após o recebimento, O frete de IDA e VOLTA
          é por conta da <strong className="text-bone">EMPRESA</strong>. Em caso de troca do produto por motivo que não
          serviu, ou não gostou entre outros motivos que não seja por defeito do produto, o frete de IDA e VOLTA é por
          conta da <strong className="text-bone">COMPRADOR</strong>.
        </p>
        <p>
          Em caso de devolução da compra por qualquer motivo, salvo por defeito de fabricação no produto em questão o
          frete de VOLTA é por conta da <strong className="text-bone">COMPRADOR</strong>. OBS: O cliente terá 7 dias
          corridos a partir do dia de recebimento da compra para postar nos correios e fazer a devolução:
        </p>

        <div className="rounded-2xl border border-white/10 bg-coal p-5">
          <p className="text-sm font-bold uppercase tracking-wider text-volt">Endereço da loja</p>
          <p className="mt-1 text-bone">Rua Cel. Marcos Rovaris, 659 , Centro - 88820-007 - Içara – SC.</p>
        </div>

        <p>
          O cliente tem direito ao arrependimento, desistência da compra ou solicitação de troca em até 7 dias corridos
          após o recebimento do pedido, conforme o Código de Defesa do Consumidor. O prazo considera dias úteis, finais
          de semana e feriados.
        </p>
        <p>
          Para solicitar a troca ou devolução, é necessário entrar em contato com a SkyBoards Store pelo canal abaixo:
        </p>
        <p className="text-bone">
          Telefone/WhatsApp:{" "}
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="font-bold text-volt hover:underline">
            (48) 3432-4903
          </a>
        </p>

        <div>
          <p className="mb-2 font-semibold text-bone">Informações necessárias para atendimento:</p>
          <ul className="space-y-1 pl-1">
            <li>• Motivo da troca ou devolução</li>
            <li>• Número do pedido</li>
            <li>• Número da Nota Fiscal</li>
          </ul>
        </div>

        <p>
          Após o contato, nossa equipe fará a análise da solicitação, verificando o motivo informado e o prazo desde o
          recebimento do produto. Estando tudo de acordo com as regras, enviaremos uma autorização de postagem,
          garantindo que não haja custo de frete para o cliente na devolução.
        </p>

        <div>
          <p className="mb-2 font-semibold text-bone">O produto deve ser devolvido:</p>
          <ul className="space-y-1 pl-1">
            <li>- Com etiqueta afixada</li>
            <li>- Na embalagem original</li>
            <li>- Sem indícios de uso</li>
          </ul>
        </div>
      </Reveal>

      <div className="mt-10">
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-volt">
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
