export const brl = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const parcelar = (v, n = 12) => {
  const valor = Number(v || 0) / n;
  return `${n}x de ${brl(valor)}`;
};
