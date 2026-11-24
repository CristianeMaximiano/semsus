// Um artigo do Wix Blog. Concluir a leitura vale eco-pontos (uma vez por artigo).
import { createPostStore } from "/js/wix/post-store.js";
import { esc } from "/js/semsus/layout.js";
import { ler, ganhar, PONTOS } from "/js/semsus/carteira.js";

var slug = new URLSearchParams(location.search).get("slug") || "";
var root = document.getElementById("artigo");
var store = createPostStore({ slug: slug });

function blocoPontos(post) {
  var lido = ler().blog.indexOf(post.slug) >= 0;
  return '<div class="leitura-pontos" id="leitura">' + (lido
    ? '<span class="selo-ok">Leitura concluída · você já ganhou ' + PONTOS.blog + " eco-pontos com este artigo</span>"
    : "<p>Terminou de ler? Marque a leitura e ganhe <b>" + PONTOS.blog + ' eco-pontos</b>.</p><button class="btn" data-ler>Concluí a leitura (+' + PONTOS.blog + " pts)</button>") +
    "</div>";
}

function render(s) {
  if (s.notFound) {
    root.innerHTML = '<div class="container estreito"><h1>Artigo não encontrado</h1><p>Ele pode ter sido removido.</p><a class="btn" href="/blog.html">Ver todos os artigos</a></div>';
    return;
  }
  if (!s.post) { root.innerHTML = '<div class="container estreito"><p class="carregando">' + esc(s.error || "Carregando artigo…") + "</p></div>"; return; }
  var p = s.post;
  document.title = (p.seoTitle || p.title) + " | Blog Semsus";
  var meta = document.querySelector('meta[name="description"]');
  if (meta && p.seoDescription) meta.setAttribute("content", p.seoDescription);
  var h = '<header class="page-hero artigo-hero"><div class="container estreito">' +
    '<a class="voltar" href="/blog.html">← Blog</a>' +
    (s.categories.length ? '<div class="post-cats">' + s.categories.map(function (c) { return "<span>" + esc(c.label) + "</span>"; }).join("") + "</div>" : "") +
    "<h1>" + esc(p.title) + "</h1>" +
    '<div class="post-meta">' + (p.authorName ? "Por " + esc(p.authorName) + " · " : "") +
    (p.dateLabel ? '<time datetime="' + esc(p.dateISO) + '">' + esc(p.dateLabel) + "</time>" : "") +
    (p.minutesToRead ? " · " + p.minutesToRead + " min de leitura" : "") + "</div></div></header>";
  h += '<div class="container estreito artigo-corpo">';
  if (p.coverUrl) h += '<img class="artigo-capa" src="' + esc(p.coverUrl) + '" alt="' + esc(p.coverAlt || "") + '">';
  h += '<div class="artigo-texto">' + (p.bodyHtml || (p.paragraphs || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("")) + "</div>";
  if (s.tags.length) h += '<div class="post-tags">' + s.tags.map(function (t) { return "<span>#" + esc(t.label) + "</span>"; }).join("") + "</div>";
  h += blocoPontos(p);
  h += '<div class="curtir"><button class="btn-curtir" data-like aria-pressed="' + s.isLiked + '"' + (s.liking ? " disabled" : "") + ">" +
    (s.isLiked ? "♥ Curtido" : "♡ Curtir") + (s.likeCountLoaded && s.likeCount !== undefined ? " · " + s.likeCount : "") + "</button></div>";
  if (s.related && s.related.length) {
    h += '<h2 class="relacionados-titulo">Leia também</h2><div class="relacionados">' + s.related.map(function (r) {
      return '<a class="rel" href="/artigo.html?slug=' + encodeURIComponent(r.slug) + '">' +
        (r.coverUrl ? '<img src="' + esc(r.coverUrl) + '" alt="" loading="lazy">' : "") + "<span>" + esc(r.title) + "</span></a>";
    }).join("") + "</div>";
  }
  h += "</div>";
  root.innerHTML = h;
}

root.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.hasAttribute("data-like")) store.toggleLike().catch(function () {});
  if (b.hasAttribute("data-ler")) {
    var post = store.getState().post;
    var c = ler();
    if (post && c.blog.indexOf(post.slug) < 0) {
      ganhar(PONTOS.blog, "Leitura: " + post.title, { blog: c.blog.concat([post.slug]) });
      document.getElementById("leitura").outerHTML = blocoPontos(post);
    }
  }
});

if (!slug) { location.replace("/blog.html"); }
else {
  store.subscribe(render);
  render(store.getState());
  store.start();
}
