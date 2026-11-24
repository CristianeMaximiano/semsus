// Formulário do Wix Forms numa página estática. Os campos vêm do formulário cadastrado no
// painel do Wix (id em data-form-id): mudou lá, muda aqui, sem mexer no código.
import { createFormStore, FORM_ERROR, otherValue, otherText } from "/js/wix/form-store.js";
import { esc } from "/js/semsus/layout.js";

// As mensagens de validação do Wix vêm em inglês; aqui viram português.
var MSG = {
  "This field is required.": "Campo obrigatório.",
  "Enter a first name.": "Informe o nome.",
  "Enter a last name.": "Informe o sobrenome.",
  "Enter an email address like example@mysite.com.": "Informe um e-mail válido, como nome@exemplo.com.",
  "Enter a phone number.": "Informe um telefone.",
  "Enter a valid phone number.": "Informe um telefone válido com DDD, como (11) 98765-4321.",
  "Enter a web URL like https://www.example.com.": "Informe um link válido, como https://instagram.com/seuperfil.",
  "Enter a number.": "Informe um número.",
  "Choose an option.": "Escolha uma opção.",
  "Check the box to continue.": "Marque a caixa para continuar.",
  "Enter an answer.": "Preencha este campo.",
  "Enter a valid answer.": "Resposta inválida.",
  "The chosen value is not allowed.": "Opção não permitida.",
  "This answer isn't accepted here.": "Esta resposta não é aceita.",
  "Choose a date.": "Escolha uma data.",
  "Enter a city.": "Informe a cidade.",
  "The spam check did not pass. Please try again.": "A verificação anti-spam falhou. Tente de novo.",
  "This form no longer exists.": "Este formulário não existe mais.",
  "The form could not be loaded. Please try again.": "Não foi possível carregar o formulário. Tente de novo.",
  "This form is no longer accepting submissions.": "Este formulário não está mais recebendo inscrições."
};
var MSG_RE = [
  [/^Enter a number from (\S+) to (\S+)\.$/, "Informe um número de $1 a $2."],
  [/^Enter a number that is (\S+) or less\.$/, "Informe um número até $1."],
  [/^Enter a number that is (\S+) or more\.$/, "Informe um número a partir de $1."],
  [/^Enter less than (\d+) characters?\.$/, "Use menos de $1 caracteres."],
  [/^Enter at least (\d+) characters?\.$/, "Use pelo menos $1 caracteres."],
  [/^Enter between (\d+) and (\d+) characters\.$/, "Use entre $1 e $2 caracteres."],
  [/^Choose at least (\d+) options?\.$/, "Escolha pelo menos $1 opção(ões)."],
  [/^Choose up to (\d+) options?\.$/, "Escolha até $1 opção(ões)."],
  [/^Please check (.+)\.$/, "Confira o campo $1."]
];
function traduzir(m) {
  if (!m) return "";
  if (MSG[m]) return MSG[m];
  for (var i = 0; i < MSG_RE.length; i++) if (MSG_RE[i][0].test(m)) return m.replace(MSG_RE[i][0], MSG_RE[i][1]);
  return m;
}

// O Wix exige telefone no formato internacional (+5511987654321). Aceita o jeito brasileiro de digitar.
function telefoneE164(txt) {
  var t = String(txt || "").trim();
  if (!t) return "";
  var d = t.replace(/\D/g, "");
  if (t.charAt(0) === "+") return "+" + d;
  if (d.length >= 10 && d.length <= 11) return "+55" + d;
  if (d.length >= 12 && d.indexOf("55") === 0) return "+" + d;
  return t;
}
function telefoneBR(v) {
  var d = String(v || "").replace(/\D/g, "");
  if (d.indexOf("55") === 0 && d.length >= 12) d = d.slice(2); else return v || "";
  return "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
}

var root = document.querySelector("[data-form-id]");
var store = createFormStore({ formId: root.getAttribute("data-form-id") });
var OUTRO = "__outro__";
var passoDesenhado = -1;

function tipoInput(c) {
  return { email: "email", url: "url", phone: "tel", number: "number", date: "date", time: "time", datetime: "datetime-local" }[c] || "text";
}

function campo(f, s) {
  var v = s.values[f.target];
  var id = "f-" + f.target;
  var marca = f.required ? ' <span class="obrig" aria-hidden="true">*</span>' : "";
  var h = '<div class="campo campo-' + f.control + '" data-target="' + esc(f.target) + '">';
  var rotulo = esc(f.label) + marca;

  if (f.control === "checkbox") {
    h += '<label class="check"><input type="checkbox" id="' + id + '" name="' + esc(f.target) + '"' + (v === true ? " checked" : "") + "> <span>" + rotulo + "</span></label>";
  } else if (f.control === "radio" || f.control === "checkboxGroup" || f.control === "tags") {
    var multiplo = f.control !== "radio";
    var lista = multiplo ? (Array.isArray(v) ? v : []) : [v];
    var outroTexto = null;
    lista.forEach(function (x) { var t = otherText(f, x); if (t !== null) outroTexto = t; });
    h += '<fieldset><legend>' + rotulo + '</legend><div class="opcoes-grid">';
    f.choices.forEach(function (c) {
      h += '<label class="check"><input type="' + (multiplo ? "checkbox" : "radio") + '" name="' + esc(f.target) + '" value="' + esc(c.value) + '"' +
        (lista.indexOf(c.value) >= 0 ? " checked" : "") + "> <span>" + esc(c.label) + "</span></label>";
    });
    if (f.otherOption) {
      h += '<label class="check"><input type="' + (multiplo ? "checkbox" : "radio") + '" name="' + esc(f.target) + '" value="' + OUTRO + '"' +
        (outroTexto !== null ? " checked" : "") + "> <span>" + esc(f.otherOption.label) + "</span></label>";
    }
    h += "</div>";
    if (f.otherOption) {
      h += '<input type="text" class="outro-texto" data-outro="1" placeholder="Qual?" value="' + esc(outroTexto || "") + '"' + (outroTexto === null ? " hidden" : "") + ">";
    }
    h += "</fieldset>";
  } else if (f.control === "select") {
    var ot = otherText(f, v);
    h += '<label for="' + id + '">' + rotulo + "</label><select id=\"" + id + '" name="' + esc(f.target) + '"><option value="">Selecione…</option>';
    f.choices.forEach(function (c) { h += '<option value="' + esc(c.value) + '"' + (v === c.value ? " selected" : "") + ">" + esc(c.label) + "</option>"; });
    if (f.otherOption) h += '<option value="' + OUTRO + '"' + (ot !== null ? " selected" : "") + ">" + esc(f.otherOption.label) + "</option>";
    h += "</select>";
    if (f.otherOption) h += '<input type="text" class="outro-texto" data-outro="1" placeholder="Qual?" value="' + esc(ot || "") + '"' + (ot === null ? " hidden" : "") + ">";
  } else if (f.control === "textarea") {
    h += '<label for="' + id + '">' + rotulo + '</label><textarea id="' + id + '" name="' + esc(f.target) + '" rows="5"' +
      (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + ">" + esc(v || "") + "</textarea>";
  } else if (["payment", "appointment", "unknown", "file", "signature", "address"].indexOf(f.control) >= 0) {
    h += "<p>" + esc(f.label) + ": este campo só pode ser preenchido no site do Wix.</p>";
  } else {
    var val = f.validation || {};
    var mostrar = f.control === "phone" ? telefoneBR(v) : (v == null ? "" : v);
    var dica = f.placeholder || (f.control === "phone" ? "(11) 98765-4321" : f.control === "email" ? "nome@exemplo.com" : "");
    h += '<label for="' + id + '">' + rotulo + '</label><input id="' + id + '" name="' + esc(f.target) + '" type="' + tipoInput(f.control) + '" value="' + esc(mostrar) + '"' +
      (dica ? ' placeholder="' + esc(dica) + '"' : "") +
      (f.control === "number" && val.minimum != null ? ' min="' + val.minimum + '"' : "") +
      (f.control === "number" && val.maximum != null ? ' max="' + val.maximum + '"' : "") +
      (f.control === "email" ? ' autocomplete="email"' : f.control === "phone" ? ' autocomplete="tel"' : "") + ">";
  }
  if (f.description) h += '<p class="ajuda">' + esc(f.description) + "</p>";
  h += '<p class="erro" role="alert"></p></div>';
  return h;
}

function lerValor(f, box) {
  var outroTxt = box.querySelector("[data-outro]");
  if (f.control === "checkbox") return box.querySelector("input").checked;
  if (f.control === "radio" || f.control === "checkboxGroup" || f.control === "tags") {
    var marcados = Array.prototype.slice.call(box.querySelectorAll('input[name]:checked')).map(function (i) { return i.value; });
    if (outroTxt) outroTxt.hidden = marcados.indexOf(OUTRO) < 0;
    var vals = marcados.map(function (x) { return x === OUTRO ? otherValue(f, outroTxt.value.trim()) : x; });
    return f.control === "radio" ? (vals[0] || "") : vals;
  }
  if (f.control === "select") {
    var sel = box.querySelector("select").value;
    if (outroTxt) outroTxt.hidden = sel !== OUTRO;
    return sel === OUTRO ? otherValue(f, outroTxt.value.trim()) : sel;
  }
  var el = box.querySelector("input, textarea");
  if (f.control === "number") return el.value === "" ? "" : Number(el.value);
  if (f.control === "phone") return telefoneE164(el.value);
  if (f.control === "url" && el.value && !/^https?:\/\//i.test(el.value.trim())) return "https://" + el.value.trim();
  return el.value;
}

function render(s) {
  if (s.outcome) {
    if (s.outcome.url) { if (s.outcome.newTab) window.open(s.outcome.url, "_blank"); else location.href = s.outcome.url; return; }
    var msg = s.outcome.message || "Recebemos suas informações. Obrigado!";
    root.innerHTML = '<div class="form-sucesso"><div class="sucesso-icone">✓</div>' +
      msg.split("\n").map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") +
      '<a class="btn" href="/">Voltar ao início</a></div>';
    return;
  }
  if (!s.form) {
    root.innerHTML = '<p class="carregando">' + esc(traduzir(s.errors[FORM_ERROR]) || "Carregando formulário…") + "</p>";
    passoDesenhado = -1;
    return;
  }
  if (s.closed) {
    root.innerHTML = "<p>" + esc(s.form.disabledMessage || "Este formulário não está recebendo inscrições no momento.") + "</p>";
    return;
  }
  var passos = s.form.steps;
  var passo = passos[s.step] || passos[0];
  if (passoDesenhado !== s.step) {
    var h = "";
    if (passos.length > 1) {
      h += '<ol class="form-passos">' + passos.map(function (p, i) {
        return '<li class="' + (i === s.step ? "ativo" : i < s.step ? "feito" : "") + '"><span>' + (i + 1) + "</span> " + esc(p.name || "Etapa " + (i + 1)) + "</li>";
      }).join("") + "</ol>";
    }
    h += '<form novalidate class="form-wix"><div class="campos">';
    s.form.fields.filter(function (f) { return f.stepId === passo.id; }).forEach(function (f) { h += campo(f, s); });
    h += '</div><p class="erro erro-form" role="alert"></p><div class="form-acoes">';
    if (s.step > 0) h += '<button type="button" class="btn btn-voltar" data-voltar>' + esc(s.form.previousText || "Voltar") + "</button>";
    var ultimo = s.step >= passos.length - 1;
    h += '<button type="submit" class="btn">' + esc(ultimo ? (s.form.submitText || "Enviar") : (s.form.nextText || "Continuar")) + "</button></div></form>";
    root.innerHTML = h;
    passoDesenhado = s.step;
    ligar();
  }
  root.querySelectorAll(".campo").forEach(function (box) {
    var t = box.getAttribute("data-target");
    var e = traduzir(s.errors[t] || "");
    box.querySelector(".erro").textContent = e;
    box.classList.toggle("invalido", !!e);
    box.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (e) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    });
  });
  var ef = root.querySelector(".erro-form");
  if (ef) ef.textContent = traduzir(s.errors[FORM_ERROR] || "");
  var b = root.querySelector('button[type="submit"]');
  if (b) { b.disabled = s.loading; b.setAttribute("aria-busy", s.loading ? "true" : "false"); }
}

function campoDe(box) {
  var t = box.getAttribute("data-target");
  return store.getState().form.fields.filter(function (f) { return f.target === t; })[0];
}

function ligar() {
  var formEl = root.querySelector("form");
  function mudar(e) {
    var box = e.target.closest(".campo");
    if (!box) return;
    var f = campoDe(box);
    if (!f) return;
    store.setValue(f.target, lerValor(f, box));
    // Campo com erro: revalida já, para a mensagem sumir enquanto a pessoa corrige
    // (e não no clique do botão, o que mudaria o layout e faria o clique se perder).
    if (store.getState().errors[f.target]) store.validate(f.target);
  }
  formEl.addEventListener("input", mudar);
  formEl.addEventListener("change", mudar);
  formEl.addEventListener("focusout", function (e) {
    var box = e.target.closest(".campo");
    if (box && !box.contains(e.relatedTarget)) store.validate(box.getAttribute("data-target"));
  });
  formEl.addEventListener("submit", function (e) {
    var s = store.getState();
    if (s.form && s.step < s.form.steps.length - 1) {
      if (store.next(e)) window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    } else {
      store.submit(e);
    }
  });
  var voltar = formEl.querySelector("[data-voltar]");
  if (voltar) voltar.addEventListener("click", function () { store.previous(); });
}

store.subscribe(render);
render(store.getState());
store.start();
