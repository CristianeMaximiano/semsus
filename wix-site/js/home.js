import { queryItems } from "/js/wix/items.js";
import { artisanCard } from "/js/artisan-card.js";
import { fmt } from "/js/site.js";

var list = document.getElementById("home-artisans");
queryItems("Artesaos", { limit: 3 }).then(function (page) {
  list.innerHTML = page.items.length
    ? page.items.map(artisanCard).join("")
    : '<div class="state">Em breve, os primeiros artesãos da rede.</div>';
}).catch(function () {
  list.innerHTML = '<div class="state">Não foi possível carregar os artesãos agora.</div>';
});

var co2El = document.querySelector("[data-home-co2]");
queryItems("FatoresImpacto", { filters: [{ field: "material", op: "eq", value: "Têxtil" }], limit: 1 }).then(function (page) {
  var f = page.items[0];
  co2El.textContent = f ? fmt(100 * f.co2PorKg, 1) : "—";
}).catch(function () { co2El.textContent = "—"; });
