// Quizzes e o jogo "Separa Aí!". Pontos: quiz só na primeira tentativa; jogo uma vez por dia.
import { esc } from "/js/semsus/layout.js";
import { ler, ganhar, hoje, PONTOS } from "/js/semsus/carteira.js";

var QUIZZES = {
  q1: { titulo: "Economia circular", perguntas: [
    { p: "Qual é a ideia central da economia circular?", o: ["Produzir mais rápido", "Manter materiais em uso pelo maior tempo possível", "Reciclar só no fim do ano", "Usar apenas materiais novos"], c: 1, e: "A economia circular busca manter produtos e materiais circulando, evitando o descarte." },
    { p: "Uma confecção tem sobras de tecido. Qual destino a Semsus propõe?", o: ["Aterro sanitário", "Incineração", "Virar lote para artesãos", "Guardar no estoque para sempre"], c: 2, e: "O resíduo vira um lote rastreável no banco de materiais e pode ser reservado por artesãos." },
    { p: "O que o selo Semsus informa?", o: ["Apenas o preço", "A origem do material e o impacto evitado", "O nome da loja", "A data de validade"], c: 1, e: "O selo mostra o lote de origem e estima CO₂ evitado e água poupada." },
    { p: "Como descartar vidro quebrado com segurança?", o: ["Solto no saco de lixo", "Embrulhado em papel ou jornal", "No vaso sanitário", "Junto com orgânicos"], c: 1, e: "Embrulhar protege quem faz a coleta." },
    { p: "Qual ODS trata de consumo e produção responsáveis?", o: ["ODS 3", "ODS 7", "ODS 12", "ODS 16"], c: 2, e: "O ODS 12 trata de consumo e produção responsáveis." }
  ] },
  q2: { titulo: "Resíduos no dia a dia", perguntas: [
    { p: "Antes de descartar uma embalagem reciclável, o ideal é:", o: ["Amassar com resto de comida", "Lavar e secar", "Queimar", "Enterrar no quintal"], c: 1, e: "Embalagens limpas e secas têm muito mais chance de serem recicladas." },
    { p: "Onde devem ir pilhas e baterias usadas?", o: ["Lixo comum", "Lixo orgânico", "Pontos de coleta específicos", "Rede de esgoto"], c: 2, e: "Pilhas têm metais pesados e precisam de coleta especial." },
    { p: "Uma camiseta rasgada que não serve para doação pode:", o: ["Virar retalho para artesanato", "Ir para a lixeira de vidro", "Ser queimada", "Ir para o esgoto"], c: 0, e: "Tecido gasto vira retalho, estopa ou matéria-prima para artesãos." },
    { p: "O que significa \"reduzir\" na lógica dos 3 Rs?", o: ["Comprar mais barato", "Gerar menos resíduo desde o início", "Diminuir o tamanho da lixeira", "Reciclar menos"], c: 1, e: "Reduzir é evitar o resíduo antes que ele exista." },
    { p: "Caixas de papelão devem ser descartadas:", o: ["Molhadas", "Desmontadas e secas", "Com fita e isopor dentro", "Junto com o orgânico"], c: 1, e: "Desmontadas ocupam menos espaço e secas mantêm o valor para reciclagem." }
  ] }
};

var ITENS = [
  ["Camiseta velha", "Têxtil"], ["Retalho de jeans", "Têxtil"], ["Caixa de papelão", "Papel/Papelão"],
  ["Jornal", "Papel/Papelão"], ["Garrafa PET", "Plástico"], ["Tampinha plástica", "Plástico"],
  ["Lata de alumínio", "Metal leve"], ["Pote de vidro", "Vidro/Cerâmica"], ["Prato quebrado", "Vidro/Cerâmica"],
  ["Sobra de MDF", "Madeira"], ["Serragem", "Madeira"], ["Revista antiga", "Papel/Papelão"]
];
var LIXEIRAS = ["Têxtil", "Madeira", "Papel/Papelão", "Plástico", "Metal leve", "Vidro/Cerâmica"];

function embaralhar(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

// ---------- Quiz ----------
var quizBox = document.getElementById("quiz");
var quiz = null;

function quizMenu() {
  var c = ler();
  quizBox.innerHTML = '<div class="grade-cards">' + Object.keys(QUIZZES).map(function (k) {
    var q = QUIZZES[k], feito = c.quiz[k] != null;
    return '<div class="card-jogo"><span class="' + (feito ? "selo-ok" : "selo-pts") + '">' +
      (feito ? "feito · " + c.quiz[k] + "/" + q.perguntas.length + " acertos" : "+" + PONTOS.quizAcerto + " pts por acerto") + "</span>" +
      "<h3>" + esc(q.titulo) + "</h3><p>" + q.perguntas.length + " perguntas</p>" +
      '<button class="btn" data-quiz="' + k + '">' + (feito ? "Jogar de novo (treino)" : "Começar") + "</button></div>";
  }).join("") + "</div>";
}

function quizRender() {
  var q = QUIZZES[quiz.id], per = q.perguntas[quiz.i];
  if (quiz.fim) {
    quizBox.innerHTML = '<div class="painel-jogo"><h3>Você acertou ' + quiz.acertos + " de " + q.perguntas.length + "!</h3><p>" +
      (quiz.ganhou != null ? "Você ganhou <b>" + quiz.ganhou + " eco-pontos</b>." : "Os pontos deste quiz já foram creditados na primeira tentativa.") +
      '</p><button class="btn" data-menu>Ver quizzes</button></div>';
    return;
  }
  var h = '<div class="painel-jogo"><div class="jogo-topo"><span>' + esc(q.titulo) + " · pergunta " + (quiz.i + 1) + " de " + q.perguntas.length + "</span>" +
    '<div class="barra"><i style="width:' + (quiz.i / q.perguntas.length * 100) + '%"></i></div></div><h3>' + esc(per.p) + '</h3><div class="alternativas">';
  per.o.forEach(function (op, i) {
    var cls = quiz.escolha == null ? "" : i === per.c ? " certa" : i === quiz.escolha ? " errada" : "";
    h += '<button class="alt' + cls + '" data-alt="' + i + '"' + (quiz.escolha != null ? " disabled" : "") + ">" + esc(op) + "</button>";
  });
  h += "</div>";
  if (quiz.escolha != null) {
    h += '<p class="explica">' + (quiz.escolha === per.c ? "<b>Certo!</b> " : "<b>Quase.</b> ") + esc(per.e) + "</p>" +
      '<button class="btn" data-prox>' + (quiz.i + 1 < q.perguntas.length ? "Próxima pergunta" : "Ver resultado") + "</button>";
  }
  quizBox.innerHTML = h + "</div>";
}

quizBox.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.quiz) { quiz = { id: b.dataset.quiz, i: 0, escolha: null, acertos: 0, fim: false }; quizRender(); return; }
  if (b.hasAttribute("data-menu")) { quiz = null; quizMenu(); return; }
  if (b.dataset.alt != null && quiz.escolha == null) {
    quiz.escolha = +b.dataset.alt;
    if (quiz.escolha === QUIZZES[quiz.id].perguntas[quiz.i].c) quiz.acertos++;
    quizRender(); return;
  }
  if (b.hasAttribute("data-prox")) {
    var total = QUIZZES[quiz.id].perguntas.length;
    if (quiz.i + 1 < total) { quiz.i++; quiz.escolha = null; }
    else {
      quiz.fim = true;
      var c = ler();
      if (c.quiz[quiz.id] == null) {
        quiz.ganhou = quiz.acertos * PONTOS.quizAcerto;
        var qz = Object.assign({}, c.quiz); qz[quiz.id] = quiz.acertos;
        ganhar(quiz.ganhou, "Quiz " + QUIZZES[quiz.id].titulo + " (" + quiz.acertos + "/" + total + ")", { quiz: qz });
      } else quiz.ganhou = null;
    }
    quizRender();
  }
});

// ---------- Separa Aí! ----------
var jogoBox = document.getElementById("jogo");
var jogo = null;

function jogoInicio() {
  var jogou = ler().jogoDia === hoje();
  jogoBox.innerHTML = '<div class="painel-jogo jogo-capa"><h3>Separa Aí!</h3><p>Coloque cada resíduo na lixeira certa. São 8 itens por rodada.</p>' +
    '<p class="' + (jogou ? "selo-ok" : "selo-pts") + '">' + (jogou ? "Você já pontuou hoje. Jogue para treinar e volte amanhã." : "+" + PONTOS.jogoAcerto + " eco-pontos por acerto (1 rodada por dia vale pontos)") + "</p>" +
    '<button class="btn" data-jogar>Jogar</button></div>';
}

function jogoRender() {
  if (jogo.fim) {
    jogoBox.innerHTML = '<div class="painel-jogo"><h3>Fim de jogo: ' + jogo.acertos + " de " + jogo.itens.length + " no lugar certo</h3><p>" +
      (jogo.ganhou != null ? "Você ganhou <b>" + jogo.ganhou + " eco-pontos</b>. Volte amanhã para jogar valendo pontos de novo." : "Rodada de treino: os pontos de hoje já foram creditados.") +
      '</p><button class="btn" data-jogar>Nova rodada</button></div>';
    return;
  }
  var item = jogo.itens[jogo.i];
  var h = '<div class="painel-jogo"><div class="jogo-topo"><span>Item ' + (jogo.i + 1) + " de " + jogo.itens.length + " · " + jogo.acertos + " acertos</span>" +
    '<div class="barra"><i style="width:' + (jogo.i / jogo.itens.length * 100) + '%"></i></div></div>' +
    '<p>Em qual lixeira vai este resíduo?</p><div class="item-jogo">' + esc(item[0]) + '</div><div class="lixeiras">' +
    LIXEIRAS.map(function (l) { return '<button class="lixeira" data-lixeira="' + esc(l) + '"' + (jogo.feedback ? " disabled" : "") + ">" + esc(l) + "</button>"; }).join("") + "</div>";
  if (jogo.feedback) h += '<p class="explica ' + (jogo.feedback.ok ? "ok" : "nok") + '">' + esc(jogo.feedback.msg) + "</p>";
  jogoBox.innerHTML = h + "</div>";
}

jogoBox.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.hasAttribute("data-jogar")) {
    jogo = { itens: embaralhar(ITENS).slice(0, 8), i: 0, acertos: 0, fim: false, feedback: null, valePontos: ler().jogoDia !== hoje() };
    jogoRender(); return;
  }
  if (b.dataset.lixeira && !jogo.feedback) {
    var item = jogo.itens[jogo.i], ok = item[1] === b.dataset.lixeira;
    if (ok) jogo.acertos++;
    jogo.feedback = { ok: ok, msg: ok ? "Isso! Lixeira certa." : "Ops: " + item[0] + " vai em " + item[1] + "." };
    jogoRender();
    setTimeout(function () {
      jogo.feedback = null;
      if (jogo.i + 1 < jogo.itens.length) jogo.i++;
      else {
        jogo.fim = true;
        if (jogo.valePontos && ler().jogoDia !== hoje()) {
          jogo.ganhou = jogo.acertos * PONTOS.jogoAcerto;
          ganhar(jogo.ganhou, "Jogo Separa Aí! (" + jogo.acertos + "/" + jogo.itens.length + ")", { jogoDia: hoje() });
        } else jogo.ganhou = null;
      }
      jogoRender();
    }, 900);
  }
});

quizMenu();
jogoInicio();
