// Renders every Wix form on the page: <div data-form-id="..."></div>.
// The fields come from the form's schema (edited in the Wix dashboard), never from this file.
import { createFormStore, FORM_ERROR, otherText, otherValue } from "/js/wix/form-store.js";
import { esc } from "/js/site.js";

var OTHER = "__other__";

function inputType(control) {
  switch (control) {
    case "email": return "email";
    case "url": return "url";
    case "phone": return "tel";
    case "number": return "number";
    default: return "text";
  }
}

function fieldHtml(f, s) {
  var v = s.values[f.target];
  var id = "f-" + f.target;
  var req = f.required ? ' <span class="req" aria-hidden="true">*</span>' : "";
  var label = f.showLabel === false ? '<span class="visually-hidden">' + esc(f.label) + "</span>" : esc(f.label) + req;
  var html = '<div class="field" data-field="' + esc(f.target) + '">';
  if (f.control === "checkboxGroup" || f.control === "tags") {
    var arr = Array.isArray(v) ? v : [];
    html += '<fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;font-size:.95rem;margin-bottom:8px">' + label + '</legend><div class="check-group">';
    (f.choices || []).forEach(function (c) {
      html += '<label><input type="checkbox" name="' + esc(f.target) + '" value="' + esc(c.value) + '"' + (arr.indexOf(c.value) >= 0 ? " checked" : "") + "> " + esc(c.label) + "</label>";
    });
    html += "</div></fieldset>";
  } else {
    html += '<label for="' + id + '">' + label + "</label>";
    if (f.control === "textarea") {
      html += '<textarea id="' + id + '" name="' + esc(f.target) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + (f.validation && f.validation.maxLength ? ' maxlength="' + f.validation.maxLength + '"' : "") + ">" + esc(v || "") + "</textarea>";
    } else if (f.control === "select" || f.control === "radio") {
      var custom = f.otherOption ? otherText(f, v) : null;
      html += '<select id="' + id + '" name="' + esc(f.target) + '" data-select="1"><option value="">Selecione…</option>';
      (f.choices || []).forEach(function (c) {
        html += '<option value="' + esc(c.value) + '"' + (v === c.value ? " selected" : "") + ">" + esc(c.label) + "</option>";
      });
      if (f.otherOption) html += '<option value="' + OTHER + '"' + (custom != null ? " selected" : "") + ">" + esc(f.otherOption.label || "Outro") + "</option>";
      html += "</select>";
      if (f.otherOption) {
        html += '<input type="text" data-other-for="' + esc(f.target) + '" placeholder="Qual?" style="margin-top:8px"' + (custom != null ? "" : " hidden") + ' value="' + esc(custom || "") + '">';
      }
    } else if (f.control === "text" || f.control === "email" || f.control === "phone" || f.control === "url" || f.control === "number") {
      var extra = "";
      if (f.control === "number" && f.validation) {
        if (f.validation.minimum != null) extra += ' min="' + f.validation.minimum + '"';
        if (f.validation.maximum != null) extra += ' max="' + f.validation.maximum + '"';
      }
      html += '<input id="' + id + '" name="' + esc(f.target) + '" type="' + inputType(f.control) + '"' + extra + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + ' value="' + esc(v == null ? "" : v) + '"' + (f.readOnly ? " disabled" : "") + ">";
    } else {
      html += '<p class="help">Este campo não pode ser preenchido por aqui. Fale com a gente pelo contato.</p>';
    }
  }
  if (f.description) html += '<p class="help">' + esc(f.description) + "</p>";
  html += '<p class="err" role="alert" hidden></p></div>';
  return html;
}

function mount(root) {
  var store = createFormStore({ formId: root.getAttribute("data-form-id") });
  var shapeKey = "";
  var formEl = null;

  function fieldsOnStep(s) {
    var step = s.form.steps[s.step];
    return s.form.fields.filter(function (f) { return !step || !f.stepId || f.stepId === step.id; });
  }

  function build(s, fields) {
    var last = s.step >= s.form.steps.length - 1;
    var html = '<form class="form-card" novalidate>';
    if (s.form.steps.length > 1) html += '<p class="small muted">Etapa ' + (s.step + 1) + " de " + s.form.steps.length + "</p>";
    html += '<div class="form-error" data-form-error hidden></div>';
    fields.forEach(function (f) { html += fieldHtml(f, s); });
    html += '<div class="btn-row" style="margin-top:8px">';
    if (s.step > 0) html += '<button type="button" class="btn btn-ghost" data-prev>' + esc(s.form.previousText || "Voltar") + "</button>";
    html += '<button type="submit" class="btn" data-go>' + esc(last ? (s.form.submitText || "Enviar") : (s.form.nextText || "Continuar")) + "</button>";
    html += "</div></form>";
    root.innerHTML = html;
    formEl = root.querySelector("form");
    wire();
  }

  function update(s) {
    if (!formEl) return;
    root.querySelectorAll("[data-field]").forEach(function (el) {
      var t = el.getAttribute("data-field");
      var err = s.errors[t];
      var p = el.querySelector(".err");
      p.hidden = !err;
      p.textContent = err || "";
      el.querySelectorAll("input, select, textarea").forEach(function (c) {
        if (err) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid");
      });
    });
    var fe = root.querySelector("[data-form-error]");
    fe.hidden = !s.errors[FORM_ERROR];
    fe.textContent = s.errors[FORM_ERROR] || "";
    var go = root.querySelector("[data-go]");
    go.disabled = !!s.loading;
    go.setAttribute("aria-busy", s.loading ? "true" : "false");
  }

  function fieldByTarget(t) {
    var s = store.getState();
    return s.form && s.form.fields.filter(function (f) { return f.target === t; })[0];
  }

  function wire() {
    formEl.addEventListener("input", function (e) {
      var el = e.target;
      if (el.hasAttribute("data-other-for")) {
        var f = fieldByTarget(el.getAttribute("data-other-for"));
        store.setValue(f.target, otherValue(f, el.value));
        return;
      }
      if (!el.name) return;
      if (el.type === "checkbox") {
        var checked = Array.prototype.slice.call(formEl.querySelectorAll('input[type="checkbox"][name="' + CSS.escape(el.name) + '"]:checked')).map(function (c) { return c.value; });
        store.setValue(el.name, checked);
      } else if (el.hasAttribute("data-select")) {
        var other = formEl.querySelector('[data-other-for="' + CSS.escape(el.name) + '"]');
        if (el.value === OTHER) {
          if (other) { other.hidden = false; other.focus(); }
          var ff = fieldByTarget(el.name);
          store.setValue(el.name, otherValue(ff, other ? other.value : ""));
        } else {
          if (other) other.hidden = true;
          store.setValue(el.name, el.value);
        }
      } else {
        store.setValue(el.name, el.value);
      }
    });
    formEl.addEventListener("focusout", function (e) {
      if (e.target.name) store.validate(e.target.name);
    });
    formEl.addEventListener("submit", function (e) {
      var s = store.getState();
      if (s.form && s.step < s.form.steps.length - 1) store.next(e); else store.submit(e);
    });
    var prev = formEl.querySelector("[data-prev]");
    if (prev) prev.addEventListener("click", function () { store.previous(); });
  }

  function render(s) {
    if (s.outcome) {
      if (s.outcome.url) {
        if (s.outcome.newTab) window.open(s.outcome.url, "_blank", "noopener"); else location.href = s.outcome.url;
        return;
      }
      var msg = s.outcome.message || "Recebemos sua mensagem. Obrigado!";
      root.innerHTML = '<div class="form-card thanks" role="status"><h3>Enviado!</h3>' + msg.split("\n").map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") + "</div>";
      formEl = null;
      shapeKey = "";
      return;
    }
    if (!s.form) {
      root.innerHTML = '<div class="state">' + esc(s.errors[FORM_ERROR] || "Carregando formulário…") + "</div>";
      formEl = null;
      return;
    }
    if (s.closed) {
      root.innerHTML = '<div class="state">' + esc(s.form.disabledMessage || "Este formulário não está recebendo respostas no momento.") + "</div>";
      formEl = null;
      return;
    }
    var fields = fieldsOnStep(s);
    var key = s.step + "|" + fields.map(function (f) { return f.target + ":" + f.required + ":" + (f.choices || []).length; }).join(",");
    if (key !== shapeKey || !formEl) {
      shapeKey = key;
      build(s, fields);
    }
    update(s);
  }

  store.subscribe(render);
  render(store.getState());
  store.start();
}

document.querySelectorAll("[data-form-id]").forEach(mount);
