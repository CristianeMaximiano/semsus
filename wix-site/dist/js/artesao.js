import { createItemStore } from "/js/wix/item-store.js";
import { imgSrc } from "/js/wix/media.js";
import { initials } from "/js/artisan-card.js";
import { esc, fmt } from "/js/site.js";

var root = document.getElementById("profile");
var slug = new URLSearchParams(location.search).get("slug") || "";
var store = createItemStore({ collectionId: "Artesaos", ref: { by: { field: "slug", value: slug } } });

function render(s) {
  if (s.notFound || !slug) { root.innerHTML = '<div class="state">Este perfil não existe. <a href="/artesaos.html">Ver todos os artesãos</a></div>'; return; }
  if (!s.item) { root.innerHTML = '<div class="state">' + esc(s.error || "Carregando perfil…") + "</div>"; return; }
  var a = s.item;
  document.title = (a.nome || "Artesão") + " · SEMSUS";
  var desc = document.querySelector('meta[name="description"]');
  if (desc && a.bio) desc.setAttribute("content", String(a.bio).slice(0, 155));
  var photo = a.foto
    ? '<img src="' + esc(imgSrc(a.foto, 900, 900)) + '" alt="' + esc(a.nome) + '">'
    : '<span aria-hidden="true">' + esc(initials(a.nome)) + "</span>";
  var pills = (a.materiais || []).map(function (m) { return '<span class="pill">' + esc(m) + "</span>"; }).join("");
  var html = '<div class="profile"><div class="photo">' + photo + "</div><div>";
  html += '<p class="eyebrow">' + esc(a.especialidade || "Artesão SEMSUS") + "</p>";
  html += "<h1>" + esc(a.nome) + "</h1>";
  if (a.cidade) html += '<p class="muted">' + esc(a.cidade) + "</p>";
  html += '<div class="pills">' + pills + "</div>";
  html += '<div class="stats-row">';
  if (a.nivel) html += '<div class="fact"><strong>' + esc(a.nivel) + "</strong><span>nível na rede</span></div>";
  if (a.kgTransformados) html += '<div class="fact"><strong>' + fmt(a.kgTransformados, 0) + " kg</strong><span>de resíduo transformado</span></div>";
  html += "</div>";
  if (a.bio) html += '<p class="lead">' + esc(a.bio) + "</p>";
  if (a.instagram) html += '<p><a class="btn btn-ghost" href="' + esc(a.instagram) + '" target="_blank" rel="noopener">Ver trabalhos</a></p>';
  html += "</div></div>";
  root.innerHTML = html;
}

store.subscribe(render);
render(store.getState());
store.start();
