import { createCollectionStore } from "/js/wix/collection-store.js";
import { artisanCard } from "/js/artisan-card.js";
import { esc } from "/js/site.js";

var MATERIAIS = ["Têxtil", "Madeira", "Papel/Papelão", "Plástico", "Metal leve", "Vidro/Cerâmica"];
var grid = document.getElementById("artisans");
var chips = document.getElementById("chips");
var more = document.getElementById("more");
var current = null;

var store = createCollectionStore({ collectionId: "Artesaos", limit: 12 });

function renderChips() {
  var html = '<button type="button" data-m="" aria-pressed="' + (current ? "false" : "true") + '">Todos</button>';
  MATERIAIS.forEach(function (m) {
    html += '<button type="button" data-m="' + esc(m) + '" aria-pressed="' + (current === m ? "true" : "false") + '">' + esc(m) + "</button>";
  });
  chips.innerHTML = html;
}

chips.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  current = b.getAttribute("data-m") || null;
  renderChips();
  store.setQuery({ filters: current ? [{ field: "materiais", op: "hasSome", value: [current] }] : [] });
});
more.addEventListener("click", function () { store.loadMore(); });

function render(s) {
  more.hidden = !s.hasNext;
  more.disabled = s.loadingMore;
  grid.classList.toggle("fetching", !!s.fetching);
  if (s.error) { grid.innerHTML = '<div class="state">Não foi possível carregar os artesãos. <button class="btn btn-ghost" type="button" id="retry">Tentar de novo</button></div>'; document.getElementById("retry").onclick = function () { store.retry(); }; return; }
  if (s.items === null) { grid.innerHTML = '<div class="state">Carregando artesãos…</div>'; return; }
  if (!s.items.length) { grid.innerHTML = '<div class="state">Nenhum artesão com esse material ainda. <a href="#cadastro">Seja o primeiro!</a></div>'; return; }
  grid.innerHTML = s.items.map(artisanCard).join("");
}

renderChips();
store.subscribe(render);
render(store.getState());
store.start();
