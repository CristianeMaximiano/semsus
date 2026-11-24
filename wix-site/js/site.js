// Shared header behaviour and helpers for every SEMSUS page.
export function esc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fmt(n, digits) {
  return Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: digits == null ? 1 : digits });
}

var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}
var here = location.pathname.replace(/^\//, "") || "index.html";
document.querySelectorAll(".nav a").forEach(function (a) {
  if (a.getAttribute("href").replace(/^\//, "") === here) a.setAttribute("aria-current", "page");
});
