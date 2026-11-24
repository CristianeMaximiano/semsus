// Página "Minha carteira": saldo, nível, extrato e trocas.
import { esc } from "/js/semsus/layout.js";
import { ler, nivel, zerar, aoMudar, NIVEIS } from "/js/semsus/carteira.js";

var root = document.getElementById("carteira");

function render() {
  var c = ler(), n = nivel(c.total);
  var prog = n.proximo ? Math.round((c.total - n.atual.min) / (n.proximo.min - n.atual.min) * 100) : 100;
  var h = '<div class="carteira-resumo">' +
    '<div class="cart-card destaque"><b>' + c.saldo + "</b><span>eco-pontos disponíveis</span></div>" +
    '<div class="cart-card"><b>' + c.total + "</b><span>pontos ganhos no total</span></div>" +
    '<div class="cart-card nivel"><b>Nível ' + esc(n.atual.nome) + '</b><div class="barra"><i style="width:' + prog + '%"></i></div><span>' +
    (n.proximo ? "Faltam " + (n.proximo.min - c.total) + " pts para " + esc(n.proximo.nome) : "Nível máximo alcançado") + "</span></div></div>";
  h += '<div class="niveis-trilha">' + NIVEIS.map(function (x) {
    return '<span class="' + (c.total >= x.min ? "alcancado" : "") + '">' + esc(x.nome) + "<small>" + x.min + " pts</small></span>";
  }).join("") + "</div>";
  h += '<div class="acoes-linha"><a class="btn" href="/jogos.html">Ganhar mais pontos</a><a class="btn btn-contorno" href="/marketplace.html">Trocar no marketplace</a></div>';
  h += '<div class="duas-colunas"><section><h2>Minhas trocas</h2>' + (c.resgates.length ? '<ul class="extrato">' + c.resgates.map(function (r) {
    return "<li><span>" + esc(r.nome) + "<small>" + esc(r.data) + "</small></span><b>" + r.pts + " pts</b></li>";
  }).join("") + "</ul>" : '<p class="vazio">Nenhuma troca ainda.</p>') + "</section>";
  h += "<section><h2>Extrato</h2>" + (c.historico.length ? '<ul class="extrato">' + c.historico.map(function (x) {
    return "<li><span>" + esc(x.desc) + "<small>" + esc(x.data) + '</small></span><b class="' + (x.pts < 0 ? "neg" : "pos") + '">' + (x.pts > 0 ? "+" : "") + x.pts + "</b></li>";
  }).join("") + "</ul>" : '<p class="vazio">Seu extrato aparece aqui quando você ganhar os primeiros pontos.</p>') + "</section></div>";
  h += '<p class="nota">Protótipo: a carteira fica salva neste navegador. <button class="link" data-zerar>Zerar carteira de teste</button></p>';
  root.innerHTML = h;
}

root.addEventListener("click", function (e) {
  if (e.target.closest("[data-zerar]") && window.confirm("Zerar a carteira de teste?")) zerar();
});
aoMudar(render);
render();
