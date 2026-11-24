import { useState, useEffect, useMemo } from "react";

// ---------------------------------------------------------------------------
// Gamificação Semsus — eco-pontos do participante
// ---------------------------------------------------------------------------
// O participante ganha eco-pontos lendo o blog, respondendo quizzes, jogando,
// cumprindo desafios e fazendo voluntariado, e troca os pontos por produtos
// do marketplace. No protótipo a carteira fica salva no navegador
// (localStorage). Em produção ela deve ficar no banco, ligada à conta do membro.
// ---------------------------------------------------------------------------

export const PONTOS = {
  blog: 20,
  quizAcerto: 10,
  jogoAcerto: 5,
  desafio: 50,
  voluntariado: 150,
};

// R$ 1,00 = 10 eco-pontos na troca
export const PONTOS_POR_REAL = 10;
export function precoEmPontos(preco) {
  return Math.round(preco * PONTOS_POR_REAL);
}

const NIVEIS_PARTICIPANTE = [
  { nome: "Semente", min: 0 },
  { nome: "Broto", min: 200 },
  { nome: "Árvore", min: 600 },
  { nome: "Floresta", min: 1500 },
];

export function nivelParticipante(total) {
  let atual = NIVEIS_PARTICIPANTE[0];
  let proximo = null;
  for (const n of NIVEIS_PARTICIPANTE) {
    if (total >= n.min) atual = n;
    else if (!proximo) proximo = n;
  }
  return { atual, proximo };
}

const CHAVE = "semsus-carteira-v1";
const CARTEIRA_VAZIA = {
  saldo: 0,
  total: 0,
  blog: [],
  quiz: {},
  jogoDia: "",
  desafios: [],
  voluntariado: {},
  historico: [],
  resgates: [],
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function carregar() {
  try {
    const raw = window.localStorage.getItem(CHAVE);
    return raw ? { ...CARTEIRA_VAZIA, ...JSON.parse(raw) } : CARTEIRA_VAZIA;
  } catch {
    return CARTEIRA_VAZIA;
  }
}

export function useCarteira() {
  const [c, setC] = useState(carregar);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(c));
    } catch {
      // navegador sem armazenamento: a carteira vale só nesta visita
    }
  }, [c]);

  function ganhar(pts, desc, mudanca = {}) {
    setC((atual) => ({
      ...atual,
      ...mudanca,
      saldo: atual.saldo + pts,
      total: atual.total + pts,
      historico: [{ data: hoje(), desc, pts }, ...atual.historico].slice(0, 50),
    }));
  }

  function resgatar(produto) {
    const custo = precoEmPontos(produto.preco);
    if (c.saldo < custo) return false;
    setC((atual) => ({
      ...atual,
      saldo: atual.saldo - custo,
      resgates: [{ id: produto.id, nome: produto.nome, pts: custo, data: hoje() }, ...atual.resgates],
      historico: [{ data: hoje(), desc: `Troca: ${produto.nome}`, pts: -custo }, ...atual.historico].slice(0, 50),
    }));
    return true;
  }

  function zerar() {
    setC(CARTEIRA_VAZIA);
  }

  return { c, setC, ganhar, resgatar, zerar };
}

// ---------------------------------------------------------------------------
// Conteúdo
// ---------------------------------------------------------------------------

const POSTS = [
  {
    id: "b1",
    titulo: "O que é economia circular?",
    resumo: "Por que “extrair, produzir e descartar” não fecha a conta.",
    texto: [
      "Na economia linear, extraímos recursos, fabricamos produtos e jogamos fora o que sobra. A economia circular propõe outro caminho: manter materiais em uso pelo maior tempo possível.",
      "Isso acontece com reparo, reúso, remanufatura e reciclagem. Na prática, o resíduo de uma empresa vira matéria-prima de outra pessoa.",
      "É exatamente o que a Semsus faz: liga sobras da indústria a artesãos que as transformam em produtos novos, com origem rastreada.",
    ],
  },
  {
    id: "b2",
    titulo: "Retalho têxtil: do descarte ao patchwork",
    resumo: "O setor têxtil gera muitas sobras. Elas podem virar renda.",
    texto: [
      "Confecções descartam retalhos todos os dias. Muitas vezes são pedaços pequenos demais para a produção, mas perfeitos para patchwork, bolsas, chaveiros e acessórios.",
      "Cada quilo de tecido reaproveitado evita o consumo de recursos para produzir tecido novo, principalmente água.",
      "No banco de materiais da Semsus, confecções cadastram esses retalhos como lotes e artesãos da rede podem reservá-los.",
    ],
  },
  {
    id: "b3",
    titulo: "Como ler o selo Semsus",
    resumo: "Cada produto mostra de onde veio e quanto impacto evitou.",
    texto: [
      "O selo Semsus liga o produto ao lote de origem: qual empresa gerou o resíduo, qual material foi usado e quantos quilos.",
      "A partir disso estimamos o CO₂ evitado e a água poupada. Os fatores usados no protótipo são simplificados e serão substituídos por fatores oficiais.",
      "Assim, quem compra sabe exatamente o que está apoiando.",
    ],
  },
  {
    id: "b4",
    titulo: "Separação de resíduos começa em casa",
    resumo: "Pequenos hábitos que fazem diferença no destino do lixo.",
    texto: [
      "Separar recicláveis de orgânicos é o primeiro passo. Embalagens limpas e secas têm muito mais chance de serem reaproveitadas.",
      "Vidro quebrado deve ser embrulhado em papel ou jornal para proteger quem faz a coleta.",
      "Treine no jogo “Separa Aí!” aqui na plataforma e ganhe eco-pontos enquanto aprende.",
    ],
  },
];

const QUIZ = [
  {
    p: "Qual é a ideia central da economia circular?",
    o: ["Produzir mais rápido", "Manter materiais em uso pelo maior tempo possível", "Reciclar só no fim do ano", "Usar apenas materiais novos"],
    c: 1,
    e: "A economia circular busca manter produtos e materiais circulando, evitando o descarte.",
  },
  {
    p: "Uma confecção tem sobras de tecido. Qual destino a Semsus propõe?",
    o: ["Aterro sanitário", "Incineração", "Virar lote para artesãos", "Guardar no estoque para sempre"],
    c: 2,
    e: "O resíduo vira um lote rastreável no banco de materiais e pode ser reservado por artesãos.",
  },
  {
    p: "O que o selo Semsus informa?",
    o: ["Apenas o preço", "A origem do material e o impacto evitado", "O nome da loja", "A data de validade"],
    c: 1,
    e: "O selo mostra o lote de origem e estima CO₂ evitado e água poupada.",
  },
  {
    p: "Como descartar vidro quebrado com segurança?",
    o: ["Solto no saco de lixo", "Embrulhado em papel ou jornal", "No vaso sanitário", "Junto com orgânicos"],
    c: 1,
    e: "Embrulhar protege quem faz a coleta.",
  },
  {
    p: "Qual ODS trata de consumo e produção responsáveis?",
    o: ["ODS 3", "ODS 7", "ODS 12", "ODS 16"],
    c: 2,
    e: "O ODS 12 trata de consumo e produção responsáveis.",
  },
];

const ITENS_JOGO = [
  { nome: "Camiseta velha", tipo: "Têxtil" },
  { nome: "Retalho de jeans", tipo: "Têxtil" },
  { nome: "Caixa de papelão", tipo: "Papel/Papelão" },
  { nome: "Jornal", tipo: "Papel/Papelão" },
  { nome: "Garrafa PET", tipo: "Plástico" },
  { nome: "Tampinha plástica", tipo: "Plástico" },
  { nome: "Lata de alumínio", tipo: "Metal leve" },
  { nome: "Pote de vidro", tipo: "Vidro/Cerâmica" },
  { nome: "Prato quebrado", tipo: "Vidro/Cerâmica" },
  { nome: "Sobra de MDF", tipo: "Madeira" },
  { nome: "Serragem", tipo: "Madeira" },
];
const LIXEIRAS = ["Têxtil", "Madeira", "Papel/Papelão", "Plástico", "Metal leve", "Vidro/Cerâmica"];

const DESAFIOS = [
  { id: "d1", titulo: "Semana da ecobag", desc: "Use sacola reutilizável em todas as compras por 7 dias." },
  { id: "d2", titulo: "Lixo separado", desc: "Separe recicláveis e orgânicos em casa durante uma semana." },
  { id: "d3", titulo: "Conserte antes de trocar", desc: "Conserte uma roupa ou objeto em vez de comprar outro." },
  { id: "d4", titulo: "Espalhe a ideia", desc: "Apresente a Semsus para uma empresa que gera resíduos." },
];

const VOLUNTARIADO = [
  { id: "v1", titulo: "Mutirão de triagem de retalhos", desc: "Ajude a separar e pesar retalhos doados pelas confecções parceiras." },
  { id: "v2", titulo: "Oficina de upcycling", desc: "Apoie artesãos em uma oficina aberta de reaproveitamento." },
  { id: "v3", titulo: "Coleta em evento", desc: "Organize a coleta seletiva em um evento da comunidade." },
];

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------------------

const SUBTABS = [
  { key: "blog", label: "Blog" },
  { key: "quiz", label: "Quiz" },
  { key: "jogo", label: "Jogo" },
  { key: "desafios", label: "Desafios" },
  { key: "voluntariado", label: "Voluntariado" },
];

export function GanhePontos({ carteira, s }) {
  const [sub, setSub] = useState("blog");
  return (
    <section>
      <h2 style={s.h2}>Ganhe eco-pontos</h2>
      <p style={s.lead}>
        Aprenda, jogue e participe. Seus pontos podem ser trocados por produtos no marketplace
        (R$ 1,00 = {PONTOS_POR_REAL} pontos).
      </p>
      <div style={s.subTabs}>
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            style={{ ...s.subTab, ...(sub === t.key ? s.subTabActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === "blog" && <Blog carteira={carteira} s={s} />}
      {sub === "quiz" && <Quiz carteira={carteira} s={s} />}
      {sub === "jogo" && <Jogo carteira={carteira} s={s} />}
      {sub === "desafios" && <Desafios carteira={carteira} s={s} />}
      {sub === "voluntariado" && <Voluntariado carteira={carteira} s={s} />}
    </section>
  );
}

function Blog({ carteira, s }) {
  const { c, ganhar } = carteira;
  const [aberto, setAberto] = useState(null);
  const post = POSTS.find((p) => p.id === aberto);

  if (post) {
    const lido = c.blog.includes(post.id);
    return (
      <article style={s.card}>
        <button onClick={() => setAberto(null)} style={s.linkBtn}>← voltar ao blog</button>
        <h3 style={{ ...s.cardTitle, fontSize: 18, marginTop: 8 }}>{post.titulo}</h3>
        {post.texto.map((t, i) => (
          <p key={i} style={s.texto}>{t}</p>
        ))}
        {lido ? (
          <span style={s.sealTag}>leitura concluída</span>
        ) : (
          <button
            style={s.buttonPrimary}
            onClick={() => ganhar(PONTOS.blog, `Leitura: ${post.titulo}`, { blog: [...c.blog, post.id] })}
          >
            Concluí a leitura (+{PONTOS.blog} pts)
          </button>
        )}
      </article>
    );
  }

  return (
    <div style={s.grid}>
      {POSTS.map((p) => (
        <div key={p.id} style={s.card}>
          <div style={s.cardTop}>
            <span style={s.idTag}>artigo</span>
            {c.blog.includes(p.id) ? <span style={s.sealTag}>lido</span> : <span style={s.badge}>+{PONTOS.blog} pts</span>}
          </div>
          <div style={s.cardTitle}>{p.titulo}</div>
          <div style={s.cardMeta}>{p.resumo}</div>
          <button style={s.buttonSecondary} onClick={() => setAberto(p.id)}>Ler artigo</button>
        </div>
      ))}
    </div>
  );
}

function Quiz({ carteira, s }) {
  const { c, ganhar } = carteira;
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);
  const jaFeito = c.quiz.q1 != null;

  function responder(idx) {
    if (escolha != null) return;
    setEscolha(idx);
    if (idx === QUIZ[i].c) setAcertos((a) => a + 1);
  }

  function proxima() {
    if (i + 1 < QUIZ.length) {
      setI(i + 1);
      setEscolha(null);
      return;
    }
    setFim(true);
    if (!jaFeito) {
      ganhar(acertos * PONTOS.quizAcerto, `Quiz economia circular (${acertos}/${QUIZ.length})`, {
        quiz: { ...c.quiz, q1: acertos },
      });
    }
  }

  function reiniciar() {
    setI(0);
    setEscolha(null);
    setAcertos(0);
    setFim(false);
  }

  if (fim) {
    return (
      <div style={s.card}>
        <div style={s.cardTitle}>Você acertou {acertos} de {QUIZ.length}!</div>
        <p style={s.texto}>
          {jaFeito && c.quiz.q1 !== acertos
            ? "Os pontos do quiz são creditados só na primeira tentativa."
            : `Você ganhou ${acertos * PONTOS.quizAcerto} eco-pontos.`}
        </p>
        <button style={s.buttonSecondary} onClick={reiniciar}>Jogar de novo</button>
      </div>
    );
  }

  const q = QUIZ[i];
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <span style={s.idTag}>pergunta {i + 1} de {QUIZ.length}</span>
        <span style={s.badge}>{jaFeito ? "treino" : `+${PONTOS.quizAcerto} pts por acerto`}</span>
      </div>
      <div style={{ ...s.cardTitle, fontSize: 17 }}>{q.p}</div>
      <div style={s.opcoes}>
        {q.o.map((op, idx) => {
          let extra = {};
          if (escolha != null && idx === q.c) extra = s.opcaoCerta;
          else if (escolha === idx) extra = s.opcaoErrada;
          return (
            <button key={idx} style={{ ...s.opcao, ...extra }} onClick={() => responder(idx)}>
              {op}
            </button>
          );
        })}
      </div>
      {escolha != null && (
        <>
          <p style={s.texto}>{escolha === q.c ? "Certo! " : "Quase. "}{q.e}</p>
          <button style={s.buttonPrimary} onClick={proxima}>
            {i + 1 < QUIZ.length ? "Próxima pergunta" : "Ver resultado"}
          </button>
        </>
      )}
    </div>
  );
}

function Jogo({ carteira, s }) {
  const { c, ganhar } = carteira;
  const [rodada, setRodada] = useState(() => embaralhar(ITENS_JOGO).slice(0, 8));
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [fim, setFim] = useState(false);
  const [ganhoRodada, setGanhoRodada] = useState(null);
  const jogouHoje = c.jogoDia === hoje();

  function escolher(lixeira) {
    if (feedback) return;
    const item = rodada[i];
    const certo = item.tipo === lixeira;
    const novosAcertos = acertos + (certo ? 1 : 0);
    setAcertos(novosAcertos);
    setFeedback(certo ? "certo" : `errado — ${item.nome} vai em ${item.tipo}`);
    setTimeout(() => {
      setFeedback(null);
      if (i + 1 < rodada.length) setI(i + 1);
      else {
        setFim(true);
        if (!jogouHoje) {
          setGanhoRodada(novosAcertos * PONTOS.jogoAcerto);
          ganhar(novosAcertos * PONTOS.jogoAcerto, `Jogo Separa Aí! (${novosAcertos}/${rodada.length})`, { jogoDia: hoje() });
        } else {
          setGanhoRodada(null);
        }
      }
    }, 900);
  }

  function novaRodada() {
    setRodada(embaralhar(ITENS_JOGO).slice(0, 8));
    setI(0);
    setAcertos(0);
    setFim(false);
  }

  if (fim) {
    return (
      <div style={s.card}>
        <div style={s.cardTitle}>Fim de jogo: {acertos} de {rodada.length} no lugar certo</div>
        <p style={s.texto}>
          {ganhoRodada == null
            ? "Você já pontuou no jogo hoje. Volte amanhã para ganhar mais."
            : `Você ganhou ${ganhoRodada} eco-pontos. Volte amanhã para jogar valendo pontos de novo.`}
        </p>
        <button style={s.buttonSecondary} onClick={novaRodada}>Nova rodada</button>
      </div>
    );
  }

  const item = rodada[i];
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <span style={s.idTag}>Separa Aí! · item {i + 1} de {rodada.length}</span>
        <span style={s.badge}>{jogouHoje ? "treino (já pontuou hoje)" : `+${PONTOS.jogoAcerto} pts por acerto`}</span>
      </div>
      <p style={s.texto}>Em qual lixeira vai este resíduo?</p>
      <div style={s.itemJogo}>{item.nome}</div>
      <div style={s.lixeiras}>
        {LIXEIRAS.map((l) => (
          <button key={l} style={s.lixeira} onClick={() => escolher(l)}>{l}</button>
        ))}
      </div>
      {feedback && (
        <p style={{ ...s.texto, fontWeight: 700, color: feedback === "certo" ? "#2E7D32" : "#B3261E" }}>
          {feedback === "certo" ? "Isso! Lixeira certa." : `Ops: ${feedback.replace("errado — ", "")}.`}
        </p>
      )}
    </div>
  );
}

function Desafios({ carteira, s }) {
  const { c, ganhar } = carteira;
  return (
    <>
      <p style={s.nota}>No protótipo os desafios são autodeclarados. Na versão final, cada um pede uma foto ou comprovação.</p>
      <div style={s.grid}>
        {DESAFIOS.map((d) => {
          const feito = c.desafios.includes(d.id);
          return (
            <div key={d.id} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.idTag}>desafio</span>
                {feito ? <span style={s.sealTag}>concluído</span> : <span style={s.badge}>+{PONTOS.desafio} pts</span>}
              </div>
              <div style={s.cardTitle}>{d.titulo}</div>
              <div style={s.cardMeta}>{d.desc}</div>
              {!feito && (
                <button
                  style={s.buttonSecondary}
                  onClick={() => ganhar(PONTOS.desafio, `Desafio: ${d.titulo}`, { desafios: [...c.desafios, d.id] })}
                >
                  Marcar como concluído
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Voluntariado({ carteira, s }) {
  const { c, setC, ganhar } = carteira;
  return (
    <>
      <p style={s.nota}>Os pontos de voluntariado entram quando o organizador confirma sua presença. No protótipo você pode simular essa confirmação.</p>
      <div style={s.grid}>
        {VOLUNTARIADO.map((v) => {
          const st = c.voluntariado[v.id];
          return (
            <div key={v.id} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.idTag}>voluntariado</span>
                {st === "confirmado" ? (
                  <span style={s.sealTag}>presença confirmada</span>
                ) : st === "inscrito" ? (
                  <span style={s.badge}>inscrito</span>
                ) : (
                  <span style={s.badge}>+{PONTOS.voluntariado} pts</span>
                )}
              </div>
              <div style={s.cardTitle}>{v.titulo}</div>
              <div style={s.cardMeta}>{v.desc}</div>
              {!st && (
                <button
                  style={s.buttonSecondary}
                  onClick={() => setC((a) => ({ ...a, voluntariado: { ...a.voluntariado, [v.id]: "inscrito" } }))}
                >
                  Quero participar
                </button>
              )}
              {st === "inscrito" && (
                <button
                  style={s.buttonPrimary}
                  onClick={() =>
                    ganhar(PONTOS.voluntariado, `Voluntariado: ${v.titulo}`, {
                      voluntariado: { ...c.voluntariado, [v.id]: "confirmado" },
                    })
                  }
                >
                  Confirmar presença (organizador)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function MinhaCarteira({ carteira, s, irPara }) {
  const { c, zerar } = carteira;
  const { atual, proximo } = useMemo(() => nivelParticipante(c.total), [c.total]);
  const progresso = proximo ? Math.round(((c.total - atual.min) / (proximo.min - atual.min)) * 100) : 100;

  return (
    <section>
      <h2 style={s.h2}>Minha carteira</h2>
      <div style={s.impactGrid}>
        <div style={{ ...s.statCard, ...s.statCardBig }}>
          <div style={{ ...s.statValue, fontSize: 28, color: "#2E7D32" }}>{c.saldo}</div>
          <div style={s.statLabel}>eco-pontos disponíveis</div>
        </div>
        <div style={{ ...s.statCard, ...s.statCardBig }}>
          <div style={{ ...s.statValue, fontSize: 28 }}>{c.total}</div>
          <div style={s.statLabel}>pontos ganhos no total</div>
        </div>
        <div style={{ ...s.statCard, ...s.statCardBig, flex: "1 1 240px" }}>
          <div style={{ ...s.statValue, fontSize: 22 }}>Nível {atual.nome}</div>
          <div style={s.barra}><div style={{ ...s.barraFill, width: progresso + "%" }} /></div>
          <div style={{ ...s.statLabel, textTransform: "none" }}>
            {proximo ?`faltam ${proximo.min - c.total} pts para ${proximo.nome}` : "nível máximo alcançado"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={s.buttonPrimary} onClick={() => irPara("ganhe")}>Ganhar mais pontos</button>
        <button style={s.buttonSecondary} onClick={() => irPara("marketplace")}>Trocar no marketplace</button>
      </div>

      <h3 style={s.h3}>Meus resgates</h3>
      {c.resgates.length === 0 ? (
        <p style={s.cardMeta}>Nenhuma troca ainda.</p>
      ) : (
        <div style={s.rankList}>
          {c.resgates.map((r, idx) => (
            <div key={idx} style={s.rankRow}>
              <span style={s.rankName}>{r.nome}</span>
              <span style={s.idTag}>{r.data}</span>
              <span style={s.rankPoints}>{r.pts} pts</span>
            </div>
          ))}
        </div>
      )}

      <h3 style={s.h3}>Extrato</h3>
      {c.historico.length === 0 ? (
        <p style={s.cardMeta}>Seu extrato aparece aqui quando você ganhar os primeiros pontos.</p>
      ) : (
        <div style={s.rankList}>
          {c.historico.map((h, idx) => (
            <div key={idx} style={s.rankRow}>
              <span style={s.rankName}>{h.desc}</span>
              <span style={s.idTag}>{h.data}</span>
              <span style={{ ...s.rankPoints, color: h.pts < 0 ? "#B3261E" : "#2E7D32" }}>
                {h.pts > 0 ? "+" : ""}{h.pts}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        style={{ ...s.linkBtn, marginTop: 20 }}
        onClick={() => {
          if (window.confirm("Zerar a carteira de teste?")) zerar();
        }}
      >
        Zerar carteira de teste
      </button>
    </section>
  );
}
