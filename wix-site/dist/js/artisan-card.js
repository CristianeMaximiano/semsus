import { imgSrc } from "/js/wix/media.js";
import { esc, fmt } from "/js/site.js";

export function initials(name) {
  return String(name || "?").replace(/^Perfil de exemplo — /, "").trim().charAt(0).toUpperCase();
}

export function artisanCard(a) {
  var photo = a.foto
    ? '<img src="' + esc(imgSrc(a.foto, 600, 450)) + '" alt="' + esc(a.nome) + '" loading="lazy">'
    : '<span aria-hidden="true">' + esc(initials(a.nome)) + "</span>";
  var pills = (a.materiais || []).map(function (m) { return '<span class="pill">' + esc(m) + "</span>"; }).join("");
  if (a.nivel) pills += '<span class="pill pill-ochre">' + esc(a.nivel) + "</span>";
  var meta = [a.especialidade, a.cidade].filter(Boolean).map(esc).join(" · ");
  return '<a class="card artisan" href="/artesao.html?slug=' + encodeURIComponent(a.slug || "") + '">' +
    '<div class="photo">' + photo + "</div>" +
    '<div class="body"><h3>' + esc(a.nome) + "</h3>" +
    (meta ? '<p class="meta">' + meta + "</p>" : "") +
    '<div class="pills">' + pills + "</div>" +
    (a.kgTransformados ? '<p class="small muted" style="margin:12px 0 0">' + fmt(a.kgTransformados, 0) + " kg transformados</p>" : "") +
    "</div></a>";
}
