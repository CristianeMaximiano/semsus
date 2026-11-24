// Calculadora de impacto: os fatores vêm da coleção "FatoresImpacto" no CMS do Wix,
// então a equipe atualiza os números no painel, sem mexer no código.
import { queryItems } from "/js/wix/items.js";
import { esc, fmt } from "/js/site.js";

var factors = [];
var selected = null;
var mode = "unico";

var mats = document.getElementById("materials");
var hint = document.getElementById("material-hint");
var kgInput = document.getElementById("kg");
var kgLabel = document.getElementById("kg-label");

function compute() {
  var f = factors.filter(function (x) { return x._id === selected; })[0];
  var kg = Math.max(0, Number(kgInput.value) || 0);
  var mult = mode === "mensal" ? 12 : 1;
  var sufixo = mode === "mensal" ? " por ano" : "";
  document.getElementById("result-title").textContent = mode === "mensal" ? "Impacto estimado em 12 meses" : "Impacto estimado";
  document.getElementById("r-kg").textContent = fmt(kg * mult, 0);
  document.getElementById("r-co2").textContent = f ? fmt(kg * mult * (f.co2PorKg || 0), 1) : "—";
  document.getElementById("r-agua").textContent = f ? fmt(kg * mult * (f.aguaPorKg || 0), 0) : "—";
  document.getElementById("r-kg-lbl").textContent = "kg de resíduo desviados do aterro" + sufixo;
  document.getElementById("r-co2-lbl").textContent = "kg de CO₂ evitados" + sufixo;
  document.getElementById("r-agua-lbl").textContent = "litros de água poupados" + sufixo;
  hint.textContent = f && f.exemplos ? f.exemplos : "";
  kgLabel.textContent = mode === "mensal" ? "2. Quantidade gerada por mês (kg)" : "2. Quantidade (kg)";
}

function renderMaterials() {
  mats.innerHTML = factors.map(function (f) {
    return '<button type="button" data-id="' + esc(f._id) + '" aria-pressed="' + (f._id === selected ? "true" : "false") + '">' + esc(f.material) + "</button>";
  }).join("");
}

function renderTable() {
  var html = '<table style="width:100%;border-collapse:collapse;background:var(--surface);border:1px solid var(--line);border-radius:12px;min-width:480px">';
  html += '<thead><tr style="text-align:left"><th style="padding:12px 16px">Material</th><th style="padding:12px 16px">kg CO₂ evitado por kg</th><th style="padding:12px 16px">Litros de água por kg</th></tr></thead><tbody>';
  factors.forEach(function (f) {
    html += '<tr style="border-top:1px solid var(--line)"><td style="padding:12px 16px">' + esc(f.material) + '</td><td style="padding:12px 16px">' + fmt(f.co2PorKg, 2) + '</td><td style="padding:12px 16px">' + fmt(f.aguaPorKg, 0) + "</td></tr>";
  });
  html += "</tbody></table>";
  document.getElementById("factors").innerHTML = html;
}

mats.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  selected = b.getAttribute("data-id");
  renderMaterials();
  compute();
});
kgInput.addEventListener("input", compute);
document.querySelectorAll("[data-mode]").forEach(function (b) {
  b.addEventListener("click", function () {
    mode = b.getAttribute("data-mode");
    document.querySelectorAll("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    compute();
  });
});

queryItems("FatoresImpacto", { sort: [{ field: "ordem", direction: "asc" }], limit: 50 }).then(function (page) {
  factors = page.items;
  if (!factors.length) { mats.innerHTML = '<div class="state" style="grid-column:1/-1">Nenhum material cadastrado ainda.</div>'; return; }
  selected = factors[0]._id;
  renderMaterials();
  renderTable();
  compute();
}).catch(function () {
  mats.innerHTML = '<div class="state" style="grid-column:1/-1">Não foi possível carregar os materiais agora. Recarregue a página.</div>';
});
