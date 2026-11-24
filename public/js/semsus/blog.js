// Lista de artigos do Wix Blog, com filtro por categoria e "carregar mais".
import { createBlogFeedStore } from "/js/wix/blog-feed-store.js";
import { esc } from "/js/semsus/layout.js";
import { ler } from "/js/semsus/carteira.js";

var lista = document.getElementById("posts");
var filtros = document.getElementById("filtros");
var mais = document.getElementById("mais");
var status = document.getElementById("status");
var feed = createBlogFeedStore({ pageSize: 9 });

export function cartao(p, lidos) {
  return '<article class="post-card"><a href="/artigo.html?slug=' + encodeURIComponent(p.slug) + '">' +
    (p.coverUrl ? '<img src="' + esc(p.coverUrl) + '" alt="' + esc(p.coverAlt || "") + '" loading="lazy">' : '<div class="post-sem-capa"></div>') +
    '<div class="post-info">' +
    '<div class="post-meta">' + (p.dateLabel ? '<time datetime="' + esc(p.dateISO) + '">' + esc(p.dateLabel) + "</time>" : "") +
    (p.minutesToRead ? " · " + p.minutesToRead + " min de leitura" : "") + "</div>" +
    "<h3>" + esc(p.title) + "</h3>" +
    (p.excerpt ? "<p>" + esc(p.excerpt) + "</p>" : "") +
    (lidos.indexOf(p.slug) >= 0 ? '<span class="selo-ok">lido · +20 pts</span>' : '<span class="selo-pts">+20 eco-pontos ao ler</span>') +
    "</div></a></article>";
}

function render(s) {
  var lidos = ler().blog;
  filtros.innerHTML = '<button data-cat="" class="' + (!s.activeCategoryId ? "ativo" : "") + '">Todos</button>' +
    s.categories.filter(function (c) { return c.postCount > 0; }).map(function (c) {
      return '<button data-cat="' + esc(c.id) + '" class="' + (s.activeCategoryId === c.id ? "ativo" : "") + '">' + esc(c.label) + "</button>";
    }).join("");
  if (s.posts === null) { lista.innerHTML = '<p class="carregando">Carregando artigos…</p>'; }
  else { lista.innerHTML = s.posts.map(function (p) { return cartao(p, lidos); }).join(""); }
  status.textContent = s.error ? "Não foi possível carregar os artigos: " + s.error : s.posts && !s.posts.length ? "Nenhum artigo publicado ainda." : "";
  mais.hidden = !s.hasMore;
  mais.disabled = s.loadingMore;
}

filtros.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (b) feed.setActiveCategoryId(b.getAttribute("data-cat") || null);
});
mais.addEventListener("click", function () { feed.loadMore().catch(function () {}); });
feed.subscribe(render);
render(feed.getState());
feed.start();
