// Contato da loja
export const WHATSAPP_NUMERO = "554834324903"; // (48) 3432-4903
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMERO}`;

// Limite de unidades do mesmo produto por pedido
export const LIMITE_POR_PRODUTO = 5;

export const waMsg = (texto) =>
  `${WHATSAPP_LINK}?text=${encodeURIComponent(texto)}`;
