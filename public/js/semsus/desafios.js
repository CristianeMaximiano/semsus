// Desafios (autodeclarados no protótipo) e ações de voluntariado (pontos após confirmação).
import { esc } from "/js/semsus/layout.js";
import { ler, ganhar, atualizar, PONTOS } from "/js/semsus/carteira.js";

var DESAFIOS = [
  { id: "d1", icone: "🛍️", titulo: "Semana da ecobag", desc: "Use sacola reutilizável em todas as compras por 7 dias.", dica: "Deixe uma ecobag na bolsa ou no carro." },
  { id: "d2", icone: "♻️", titulo: "Lixo separado", desc: "Separe recicláveis e orgânicos em casa durante uma semana.", dica: "Lave e seque as embalagens." },
  { id: "d3", icone: "🧵", titulo: "Conserte antes de trocar", desc: "Conserte uma roupa ou objeto em vez de comprar outro.", dica: "Costureiras e marceneiros do bairro ajudam." },
  { id: "d4", icone: "📣", titulo: "Espalhe a ideia", desc: "Apresente a Semsus para uma empresa que gera resíduos.", dica: "Mande o link do site para o setor de compras ou sustentabilidade." },
  { id: "d5", icone: "🥤", titulo: "Um mês sem descartáveis", desc: "Troque copos e talheres descartáveis por reutilizáveis por 30 dias.", dica: "Leve sua caneca para o trabalho." },
  { id: "d6", icone: "🎁", titulo: "Presente circular", desc: "Dê de presente um produto feito com material reaproveitado.", dica: "O marketplace Semsus tem opções com selo." }
];

var ACOES = [
  { id: "v1", titulo: "Mutirão de triagem de retalhos", desc: "Ajude a separar e pesar retalhos doados pelas confecções parceiras.", quando: "Sábados pela manhã" },
  { id: "v2", titulo: "Oficina de upcycling", desc: "Apoie artesãos em uma oficina aberta de reaproveitamento.", quando: "Uma vez por mês" },
  { id: "v3", titulo: "Coleta em evento", desc: "Organize a coleta seletiva em um evento da comunidade.", quando: "Conforme a agenda de eventos" }
];

var boxD = document.getElementById("lista-desafios");
var boxV = document.getElementById("lista-voluntariado");

function render() {
  var c = ler();
  boxD.innerHTML = DESAFIOS.map(function (d) {
    var feito = c.desafios.indexOf(d.id) >= 0;
    return '<article class="card-desafio' + (feito ? " feito" : "") + '"><div class="desafio-icone" aria-hidden="true">' + d.icone + "</div>" +
      '<span class="' + (feito ? "selo-ok" : "selo-pts") + '">' + (feito ? "concluído" : "+" + PONTOS.desafio + " pts") + "</span>" +
      "<h3>" + esc(d.titulo) + "</h3><p>" + esc(d.desc) + '</p><p class="dica">Dica: ' + esc(d.dica) + "</p>" +
      (feito ? "" : '<button class="btn btn-contorno" data-desafio="' + d.id + '">Marcar como concluído</button>') + "</article>";
  }).join("");
  boxV.innerHTML = ACOES.map(function (v) {
    var st = c.voluntariado[v.id];
    var selo = st === "confirmado" ? '<span class="selo-ok">presença confirmada</span>' : st === "inscrito" ? '<span class="selo-pts">inscrito · aguardando confirmação</span>' : '<span class="selo-pts">+' + PONTOS.voluntariado + " pts</span>";
    var acao = !st ? '<button class="btn" data-inscrever="' + v.id + '">Quero participar</button>'
      : st === "inscrito" ? '<button class="btn btn-contorno" data-confirmar="' + v.id + '">Confirmar presença (organizador)</button>' : "";
    return '<article class="card-voluntariado">' + selo + "<h3>" + esc(v.titulo) + "</h3><p>" + esc(v.desc) + '</p><p class="dica">' + esc(v.quando) + "</p>" + acao + "</article>";
  }).join("");
}

document.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  var c = ler();
  if (b.dataset.desafio && c.desafios.indexOf(b.dataset.desafio) < 0) {
    var d = DESAFIOS.filter(function (x) { return x.id === b.dataset.desafio; })[0];
    ganhar(PONTOS.desafio, "Desafio: " + d.titulo, { desafios: c.desafios.concat([d.id]) });
  } else if (b.dataset.inscrever) {
    var vi = Object.assign({}, c.voluntariado); vi[b.dataset.inscrever] = "inscrito";
    atualizar({ voluntariado: vi });
  } else if (b.dataset.confirmar && c.voluntariado[b.dataset.confirmar] === "inscrito") {
    var a = ACOES.filter(function (x) { return x.id === b.dataset.confirmar; })[0];
    var vc = Object.assign({}, c.voluntariado); vc[a.id] = "confirmado";
    ganhar(PONTOS.voluntariado, "Voluntariado: " + a.titulo, { voluntariado: vc });
  } else return;
  render();
});

render();
