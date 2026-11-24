// Página inicial: os 3 artigos mais recentes do Wix Blog.
import { fetchPosts } from "/js/wix/posts.js";
import { esc } from "/js/semsus/layout.js";

var box = document.getElementById("ultimos-posts");
fetchPosts({ limit: 3 }).then(function (r) {
  var posts = (r.posts || []).slice(0, 3);
  if (!posts.length) { box.closest("section").hidden = true; return; }
  box.innerHTML = posts.map(function (p) {
    return '<article class="post-card"><a href="/artigo.html?slug=' + encodeURIComponent(p.slug) + '">' +
      (p.coverUrl ? '<img src="' + esc(p.coverUrl) + '" alt="' + esc(p.coverAlt || "") + '" loading="lazy">' : '<div class="post-sem-capa"></div>') +
      '<div class="post-info"><div class="post-meta">' + esc(p.dateLabel || "") + "</div><h3>" + esc(p.title) + "</h3>" +
      (p.excerpt ? "<p>" + esc(p.excerpt) + "</p>" : "") + "</div></a></article>";
  }).join("");
}).catch(function () { box.closest("section").hidden = true; });
