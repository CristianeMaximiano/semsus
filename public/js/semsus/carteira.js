// Carteira de eco-pontos — mesma estrutura e mesma chave do painel (Gamificacao.jsx),
// então os pontos ganhos em qualquer página valem em todas. Protótipo: fica no navegador.
var CHAVE = "semsus-carteira-v1";
var VAZIA = { saldo: 0, total: 0, blog: [], quiz: {}, jogoDia: "", desafios: [], voluntariado: {}, historico: [], resgates: [] };
var ouvintes = [];

export var PONTOS = { blog: 20, quizAcerto: 10, jogoAcerto: 5, desafio: 50, voluntariado: 150 };
export var PONTOS_POR_REAL = 10;
export var NIVEIS = [
  { nome: "Semente", min: 0 },
  { nome: "Broto", min: 200 },
  { nome: "Árvore", min: 600 },
  { nome: "Floresta", min: 1500 }
];

export function hoje() { return new Date().toISOString().slice(0, 10); }
export function precoEmPontos(preco) { return Math.round(preco * PONTOS_POR_REAL); }

export function ler() {
  try {
    var raw = window.localStorage.getItem(CHAVE);
    return Object.assign({}, VAZIA, raw ? JSON.parse(raw) : {});
  } catch (e) { return Object.assign({}, VAZIA); }
}

function gravar(c) {
  try { window.localStorage.setItem(CHAVE, JSON.stringify(c)); } catch (e) { /* sem armazenamento */ }
  ouvintes.forEach(function (fn) { fn(c); });
  return c;
}

export function aoMudar(fn) { ouvintes.push(fn); }

export function atualizar(mudanca) {
  return gravar(Object.assign(ler(), mudanca));
}

export function ganhar(pts, desc, mudanca) {
  var c = ler();
  c = Object.assign(c, mudanca || {});
  c.saldo += pts;
  c.total += pts;
  c.historico = [{ data: hoje(), desc: desc, pts: pts }].concat(c.historico).slice(0, 50);
  return gravar(c);
}

export function resgatar(produto) {
  var c = ler();
  var custo = precoEmPontos(produto.preco);
  if (c.saldo < custo) return false;
  c.saldo -= custo;
  c.resgates = [{ id: produto.id, nome: produto.nome, pts: custo, data: hoje() }].concat(c.resgates);
  c.historico = [{ data: hoje(), desc: "Troca: " + produto.nome, pts: -custo }].concat(c.historico).slice(0, 50);
  gravar(c);
  return true;
}

export function zerar() { return gravar(Object.assign({}, VAZIA)); }

export function nivel(total) {
  var atual = NIVEIS[0], proximo = null;
  NIVEIS.forEach(function (n) { if (total >= n.min) atual = n; else if (!proximo) proximo = n; });
  return { atual: atual, proximo: proximo };
}

window.addEventListener("storage", function (e) {
  if (e.key === CHAVE) { var c = ler(); ouvintes.forEach(function (fn) { fn(c); }); }
});
