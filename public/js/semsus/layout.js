// Cabeçalho, rodapé e menu compartilhados por todas as páginas.
import { ler, aoMudar } from "/js/semsus/carteira.js";

var LOGO = "https://static.wixstatic.com/media/d7dcb2_d3448ea3744544cd97d8905dfbe01c9d~mv2.png/v1/fit/w_120,h_124/logo-semsus.png";
var EMAIL = "semsus.semearsutentabilidade@gmail.com";
var LINKS = [
  ["/", "Início"],
  ["/blog.html", "Blog"],
  ["/jogos.html", "Jogos"],
  ["/desafios.html", "Desafios"],
  ["/marketplace.html", "Marketplace"],
  ["/plataforma.html", "Plataforma"]
];

var pagina = location.pathname === "/index.html" ? "/" : location.pathname;
if (pagina === "/artigo.html") pagina = "/blog.html";

function logo(classe) {
  return '<a href="/" class="logo ' + classe + '"><img src="' + LOGO + '" alt="Logo Semsus" width="48" height="50" />' +
    "<span><b>SEMSUS</b><small>Semeando Sustentabilidade</small></span></a>";
}

var topo = document.getElementById("topo");
if (topo) {
  topo.innerHTML =
    '<div class="topbar"><div class="container topbar-in"><span>Projeto Semsus · Semear Sustentabilidade</span>' +
    '<a href="mailto:' + EMAIL + '">' + EMAIL + "</a></div></div>" +
    '<header class="header"><div class="container header-in">' + logo("") +
    '<button class="menu-btn" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '<nav class="nav">' +
    LINKS.map(function (l) { return '<a href="' + l[0] + '"' + (pagina === l[0] ? ' aria-current="page"' : "") + ">" + l[1] + "</a>"; }).join("") +
    '<a href="/carteira.html" class="chip-pontos" title="Minha carteira"><b id="saldo-topo">0</b> pts</a>' +
    '<a href="/cadastro.html" class="btn btn-sm">Cadastre-se</a>' +
    "</nav></div></header>";

  var btn = topo.querySelector(".menu-btn");
  var nav = topo.querySelector(".nav");
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  var header = topo.querySelector(".header");
  window.addEventListener("scroll", function () { header.classList.toggle("scrolled", window.scrollY > 40); });

  var saldo = document.getElementById("saldo-topo");
  saldo.textContent = ler().saldo;
  aoMudar(function (c) { saldo.textContent = c.saldo; });
}

var rodape = document.getElementById("rodape");
if (rodape) {
  rodape.innerHTML =
    '<footer class="footer"><div class="container footer-in"><div>' + logo("logo-light") +
    "<p>Economia circular que conecta indústria, artesanato e consumo consciente.</p></div>" +
    "<div><h4>Navegação</h4>" + LINKS.slice(1).map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") +
    '</div><div><h4>Participe</h4><a href="/cadastro-artesao.html">Sou artesão</a><a href="/cadastro.html">Quero participar</a>' +
    '<a href="/carteira.html">Minha carteira</a><a href="mailto:' + EMAIL + '">' + EMAIL + "</a></div></div>" +
    '<div class="container copy">© ' + new Date().getFullYear() + " Semsus · Semeando Sustentabilidade</div></footer>";
}

// números animados (página inicial)
var nums = document.querySelectorAll("[data-count]");
function contar(el) {
  var fim = +el.getAttribute("data-count"), t0 = null;
  function passo(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(fim * p); if (p < 1) requestAnimationFrame(passo); }
  requestAnimationFrame(passo);
}
if (nums.length && "IntersectionObserver" in window) {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { contar(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.5 });
  nums.forEach(function (n) { io.observe(n); });
} else {
  nums.forEach(function (n) { n.textContent = n.getAttribute("data-count"); });
}

export function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
