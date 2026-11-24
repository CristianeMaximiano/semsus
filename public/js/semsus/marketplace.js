// Marketplace circular: produtos com selo de origem, compra (pedido por e-mail) ou troca por eco-pontos.
// Produtos de demonstração até a loja ser ligada ao Wix Stores.
import { esc } from "/js/semsus/layout.js";
import { ler, resgatar, precoEmPontos, aoMudar } from "/js/semsus/carteira.js";

var FATORES = { "Têxtil": [0.5, 2700], "Madeira": [0.3, 50], "Papel/Papelão": [0.9, 30], "Plástico": [1.6, 100], "Metal leve": [2, 10], "Vidro/Cerâmica": [0.3, 5] };
var ICONES = { "Têxtil": "🧵", "Madeira": "🪵", "Papel/Papelão": "📦", "Plástico": "🧴", "Metal leve": "🥫", "Vidro/Cerâmica": "🏺" };
var PRODUTOS = [
  { id: "P001", nome: "Bolsa patchwork retalhos", material: "Têxtil", kg: 4, preco: 89, artesao: "Marisa Costuras", origem: "Têxtil Bom Retalho" },
  { id: "P002", nome: "Chaveiro de retalho", material: "Têxtil", kg: 0.2, preco: 15, artesao: "Marisa Costuras", origem: "Têxtil Bom Retalho" },
  { id: "P003", nome: "Porta-copos de madeira (4 un.)", material: "Madeira", kg: 0.8, preco: 35, artesao: "Edu Marcenaria Criativa", origem: "Marcenaria União" },
  { id: "P004", nome: "Caderno artesanal de papel reaproveitado", material: "Papel/Papelão", kg: 0.5, preco: 28, artesao: "Ateliê Folha Nova", origem: "Gráfica Cores ABC" },
  { id: "P005", nome: "Organizador de mesa em MDF", material: "Madeira", kg: 1.2, preco: 49, artesao: "Edu Marcenaria Criativa", origem: "Marcenaria União" },
  { id: "P006", nome: "Ecobag de jeans reaproveitado", material: "Têxtil", kg: 0.6, preco: 39, artesao: "Marisa Costuras", origem: "Têxtil Bom Retalho" }
];
var EMAIL = "semsus.semearsutentabilidade@gmail.com";

var grade = document.getElementById("produtos");
var filtros = document.getElementById("filtros");
var aviso = document.getElementById("aviso");
var saldoEl = document.getElementById("saldo-market");
var filtro = "";

function impacto(p) {
  var f = FATORES[p.material] || [0, 0];
  return { co2: +(p.kg * f[0]).toFixed(1), agua: Math.round(p.kg * f[1]) };
}

function render() {
  var saldo = ler().saldo;
  saldoEl.textContent = saldo;
  var mats = Object.keys(FATORES).filter(function (m) { return PRODUTOS.some(function (p) { return p.material === m; }); });
  filtros.innerHTML = '<button data-mat="" class="' + (!filtro ? "ativo" : "") + '">Todos</button>' +
    mats.map(function (m) { return '<button data-mat="' + esc(m) + '" class="' + (filtro === m ? "ativo" : "") + '">' + ICONES[m] + " " + esc(m) + "</button>"; }).join("");
  grade.innerHTML = PRODUTOS.filter(function (p) { return !filtro || p.material === filtro; }).map(function (p) {
    var imp = impacto(p), pts = precoEmPontos(p.preco), pode = saldo >= pts;
    var assunto = encodeURIComponent("Pedido Semsus: " + p.nome);
    var corpo = encodeURIComponent("Olá! Quero comprar o produto " + p.nome + " (" + p.id + ") por R$ " + p.preco.toFixed(2).replace(".", ",") + ".");
    return '<article class="produto"><div class="produto-img mat-' + Object.keys(FATORES).indexOf(p.material) + '"><span aria-hidden="true">' + ICONES[p.material] + "</span>" +
      '<em class="selo-semsus">selo semsus</em></div><div class="produto-info"><h3>' + esc(p.nome) + "</h3>" +
      '<p class="produto-origem">por <b>' + esc(p.artesao) + "</b><br>origem: " + esc(p.origem) + " · " + esc(p.material) + "</p>" +
      '<p class="produto-impacto">' + imp.co2 + " kg CO₂ evitado · " + imp.agua + " L de água</p>" +
      '<div class="produto-preco"><b>R$ ' + p.preco.toFixed(2).replace(".", ",") + "</b><span>ou " + pts + " eco-pontos</span></div>" +
      '<div class="produto-acoes"><a class="btn" href="mailto:' + EMAIL + "?subject=" + assunto + "&body=" + corpo + '">Comprar</a>' +
      '<button class="btn btn-contorno' + (pode ? "" : " apagado") + '" data-trocar="' + p.id + '">Trocar por ' + pts + " pts</button></div></div></article>";
  }).join("");
}

document.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.mat != null && b.closest("#filtros")) { filtro = b.dataset.mat; render(); return; }
  if (b.dataset.trocar) {
    var p = PRODUTOS.filter(function (x) { return x.id === b.dataset.trocar; })[0];
    var ok = resgatar(p);
    var faltam = precoEmPontos(p.preco) - ler().saldo;
    aviso.hidden = false;
    aviso.className = "aviso " + (ok ? "ok" : "nok");
    aviso.innerHTML = ok
      ? "Troca feita: <b>" + esc(p.nome) + '</b>. Veja em <a href="/carteira.html">Minha carteira</a>. A equipe Semsus vai combinar a entrega com você.'
      : "Faltam <b>" + faltam + " pontos</b> para trocar por " + esc(p.nome) + '. <a href="/jogos.html">Ganhe pontos jogando</a> ou cumprindo <a href="/desafios.html">desafios</a>.';
    aviso.scrollIntoView({ behavior: "smooth", block: "center" });
    render();
  }
});

aoMudar(render);
render();
