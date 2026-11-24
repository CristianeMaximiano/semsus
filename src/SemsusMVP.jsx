import React, { useState, useMemo, useEffect } from "react";
import { useCarteira, GanhePontos, MinhaCarteira, precoEmPontos } from "./Gamificacao";

// ---------------------------------------------------------------------------
// SEMSUS — Protótipo de MVP (front-end)
// ---------------------------------------------------------------------------
// Este componente é um protótipo funcional, em memória (sem backend), que
// materializa o modelo de dados central do Semsus:
//
//   Indústria → Lote de resíduo → Artesão → Produto → Selo de Impacto
//
// Ele serve para você (1) validar a experiência com usuários reais mostrando
// a tela, e (2) já nascer com a estrutura de dados certa para depois plugar
// em um banco real (ex.: Supabase) sem precisar redesenhar nada.
//
// Fatores de conversão de impacto são estimativas simplificadas para fins de
// protótipo — substitua pelos fatores reais (IPCC / ABRELPE) antes de usar
// em produção.
// ---------------------------------------------------------------------------

const FATORES_IMPACTO = {
  "Têxtil": { co2PorKg: 0.5, aguaPorKg: 2700 },
  "Madeira": { co2PorKg: 0.3, aguaPorKg: 50 },
  "Papel/Papelão": { co2PorKg: 0.9, aguaPorKg: 30 },
  "Plástico": { co2PorKg: 1.6, aguaPorKg: 100 },
  "Metal leve": { co2PorKg: 2.0, aguaPorKg: 10 },
  "Vidro/Cerâmica": { co2PorKg: 0.3, aguaPorKg: 5 },
};

const TIPOS_RESIDUO = Object.keys(FATORES_IMPACTO);

const NIVEIS_ARTESAO = [
  { nome: "Iniciante", min: 0 },
  { nome: "Artesão Circular", min: 50 },
  { nome: "Mestre Circular", min: 200 },
  { nome: "Embaixador Semsus", min: 500 },
];

function nivelPorPontos(pontos) {
  let atual = NIVEIS_ARTESAO[0];
  for (const n of NIVEIS_ARTESAO) {
    if (pontos >= n.min) atual = n;
  }
  return atual.nome;
}

function calcularImpacto(tipo, kg) {
  const f = FATORES_IMPACTO[tipo] || { co2PorKg: 0, aguaPorKg: 0 };
  return {
    co2: +(kg * f.co2PorKg).toFixed(1),
    agua: Math.round(kg * f.aguaPorKg),
  };
}

// eco-pontos: 1 ponto por kg de resíduo + 5 pontos por kg de CO2 evitado
function calcularPontos(kg, co2) {
  return Math.round(kg * 1 + co2 * 5);
}

const SEED_LOTES = [
  { id: "L001", empresa: "Têxtil Bom Retalho", tipo: "Têxtil", kg: 80, status: "disponível" },
  { id: "L002", empresa: "Marcenaria União", tipo: "Madeira", kg: 120, status: "disponível" },
  { id: "L003", empresa: "Gráfica Cores ABC", tipo: "Papel/Papelão", kg: 60, status: "reservado" },
];

const SEED_ARTESAOS = [
  { id: "A001", nome: "Marisa Costuras", especialidade: "Patchwork", pontos: 0 },
  { id: "A002", nome: "Edu Marcenaria Criativa", especialidade: "Decoração em madeira", pontos: 0 },
];

const SEED_PRODUTOS = [
  { id: "P001", artesaoId: "A001", loteId: "L001", nome: "Bolsa patchwork retalhos", kgUsado: 4, preco: 89 },
  { id: "P002", artesaoId: "A001", loteId: "L001", nome: "Chaveiro de retalho", kgUsado: 0.2, preco: 15 },
  { id: "P003", artesaoId: "A002", loteId: "L002", nome: "Porta-copos de madeira (4 un.)", kgUsado: 0.8, preco: 35 },
];

const tabs = [
  { key: "materiais", label: "Banco de materiais" },
  { key: "artesaos", label: "Artesãos" },
  { key: "marketplace", label: "Marketplace" },
  { key: "ganhe", label: "Ganhe pontos" },
  { key: "carteira", label: "Minha carteira" },
  { key: "impacto", label: "Impacto" },
];

export default function SemsusMVP() {
  const [lotes, setLotes] = useState(SEED_LOTES);
  const [artesaos, setArtesaos] = useState(SEED_ARTESAOS);
  const [produtos, setProdutos] = useState(SEED_PRODUTOS);
  const [tab, setTab] = useState("materiais");
  const carteira = useCarteira();
  const [aviso, setAviso] = useState("");

  // links da página (ex.: "Começar a ganhar pontos") podem abrir uma aba
  useEffect(() => {
    function abrir(e) {
      if (tabs.some((t) => t.key === e.detail)) setTab(e.detail);
    }
    window.addEventListener("semsus:tab", abrir);
    return () => window.removeEventListener("semsus:tab", abrir);
  }, []);

  function trocar(produto) {
    const ok = carteira.resgatar(produto);
    setAviso(
      ok
        ? `Troca feita: ${produto.nome}. Veja em Minha carteira.`
        : `Faltam ${precoEmPontos(produto.preco) - carteira.c.saldo} pontos para trocar por ${produto.nome}.`
    );
  }

  // form: novo lote
  const [novoLote, setNovoLote] = useState({ empresa: "", tipo: TIPOS_RESIDUO[0], kg: "" });
  // form: novo artesão
  const [novoArtesao, setNovoArtesao] = useState({ nome: "", especialidade: "" });
  // form: novo produto
  const [novoProduto, setNovoProduto] = useState({
    artesaoId: artesaos[0]?.id || "",
    loteId: lotes[0]?.id || "",
    nome: "",
    kgUsado: "",
    preco: "",
  });

  function addLote(e) {
    e.preventDefault();
    if (!novoLote.empresa || !novoLote.kg) return;
    const id = "L" + String(lotes.length + 1).padStart(3, "0");
    setLotes([...lotes, { id, empresa: novoLote.empresa, tipo: novoLote.tipo, kg: +novoLote.kg, status: "disponível" }]);
    setNovoLote({ empresa: "", tipo: TIPOS_RESIDUO[0], kg: "" });
  }

  function addArtesao(e) {
    e.preventDefault();
    if (!novoArtesao.nome) return;
    const id = "A" + String(artesaos.length + 1).padStart(3, "0");
    setArtesaos([...artesaos, { id, nome: novoArtesao.nome, especialidade: novoArtesao.especialidade, pontos: 0 }]);
    setNovoArtesao({ nome: "", especialidade: "" });
  }

  function addProduto(e) {
    e.preventDefault();
    const { artesaoId, loteId, nome, kgUsado, preco } = novoProduto;
    if (!artesaoId || !loteId || !nome || !kgUsado || !preco) return;
    const lote = lotes.find((l) => l.id === loteId);
    if (!lote) return;
    const kg = +kgUsado;
    const { co2, agua } = calcularImpacto(lote.tipo, kg);
    const pontosGanhos = calcularPontos(kg, co2);
    const id = "P" + String(produtos.length + 1).padStart(3, "0");

    setProdutos([
      ...produtos,
      { id, artesaoId, loteId, nome, kgUsado: kg, preco: +preco, co2, agua, pontosGanhos },
    ]);
    setArtesaos(
      artesaos.map((a) => (a.id === artesaoId ? { ...a, pontos: a.pontos + pontosGanhos } : a))
    );
    setNovoProduto({ artesaoId: artesaos[0]?.id || "", loteId: lotes[0]?.id || "", nome: "", kgUsado: "", preco: "" });
  }

  const impactoTotal = useMemo(() => {
    return produtos.reduce(
      (acc, p) => {
        const lote = lotes.find((l) => l.id === p.loteId);
        const imp = lote ? calcularImpacto(lote.tipo, p.kgUsado) : { co2: 0, agua: 0 };
        return {
          co2: +(acc.co2 + imp.co2).toFixed(1),
          agua: acc.agua + imp.agua,
          kg: acc.kg + p.kgUsado,
        };
      },
      { co2: 0, agua: 0, kg: 0 }
    );
  }, [produtos, lotes]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>SEMSUS</div>
          <div style={styles.subtitle}>plataforma (protótipo) — indústria → lote → artesão → produto → selo</div>
        </div>
        <div style={styles.statRow}>
          <Stat label="lotes cadastrados" value={lotes.length} />
          <Stat label="artesãos" value={artesaos.length} />
          <Stat label="co₂ evitado (kg)" value={impactoTotal.co2} accent />
          <button style={styles.walletChip} onClick={() => setTab("carteira")} title="Minha carteira">
            <b>{carteira.c.saldo}</b> eco-pontos
          </button>
        </div>
      </header>

      <nav style={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setAviso(""); }}
            style={{ ...styles.tabButton, ...(tab === t.key ? styles.tabButtonActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {tab === "materiais" && (
          <section>
            <h2 style={styles.h2}>Lotes de resíduo cadastrados</h2>
            <div style={styles.grid}>
              {lotes.map((l) => (
                <div key={l.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <span style={styles.idTag}>{l.id}</span>
                    <span style={{ ...styles.statusTag, ...(l.status === "disponível" ? styles.statusOk : styles.statusBusy) }}>
                      {l.status}
                    </span>
                  </div>
                  <div style={styles.cardTitle}>{l.empresa}</div>
                  <div style={styles.cardMeta}>{l.tipo} · {l.kg} kg</div>
                  <div style={styles.cardImpact}>
                    impacto potencial do lote: {calcularImpacto(l.tipo, l.kg).co2} kg CO₂ evitado
                  </div>
                </div>
              ))}
            </div>

            <h3 style={styles.h3}>Registrar novo lote (indústria)</h3>
            <form onSubmit={addLote} style={styles.form}>
              <input
                placeholder="Nome da empresa"
                value={novoLote.empresa}
                onChange={(e) => setNovoLote({ ...novoLote, empresa: e.target.value })}
                style={styles.input}
              />
              <select
                value={novoLote.tipo}
                onChange={(e) => setNovoLote({ ...novoLote, tipo: e.target.value })}
                style={styles.input}
              >
                {TIPOS_RESIDUO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                placeholder="Volume (kg)"
                type="number"
                value={novoLote.kg}
                onChange={(e) => setNovoLote({ ...novoLote, kg: e.target.value })}
                style={styles.input}
              />
              <button type="submit" style={styles.buttonPrimary}>Cadastrar lote</button>
            </form>
          </section>
        )}

        {tab === "artesaos" && (
          <section>
            <h2 style={styles.h2}>Rede de artesãos</h2>
            <div style={styles.grid}>
              {artesaos.map((a) => (
                <div key={a.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <span style={styles.idTag}>{a.id}</span>
                    <span style={styles.badge}>{nivelPorPontos(a.pontos)}</span>
                  </div>
                  <div style={styles.cardTitle}>{a.nome}</div>
                  <div style={styles.cardMeta}>{a.especialidade || "—"}</div>
                  <div style={styles.cardImpact}>{a.pontos} eco-pontos</div>
                </div>
              ))}
            </div>

            <h3 style={styles.h3}>Aprovar novo artesão</h3>
            <form onSubmit={addArtesao} style={styles.form}>
              <input
                placeholder="Nome do artesão"
                value={novoArtesao.nome}
                onChange={(e) => setNovoArtesao({ ...novoArtesao, nome: e.target.value })}
                style={styles.input}
              />
              <input
                placeholder="Especialidade (ex.: patchwork)"
                value={novoArtesao.especialidade}
                onChange={(e) => setNovoArtesao({ ...novoArtesao, especialidade: e.target.value })}
                style={styles.input}
              />
              <button type="submit" style={styles.buttonPrimary}>Cadastrar artesão</button>
            </form>
          </section>
        )}

        {tab === "marketplace" && (
          <section>
            <h2 style={styles.h2}>Produtos com selo de rastreabilidade</h2>
            <p style={styles.lead}>
              Compre ou troque por eco-pontos. Você tem <b>{carteira.c.saldo} pontos</b>.{" "}
              <button style={styles.linkBtn} onClick={() => setTab("ganhe")}>Ganhar mais pontos</button>
            </p>
            {aviso && <div style={styles.aviso}>{aviso}</div>}
            <div style={styles.grid}>
              {produtos.map((p) => {
                const lote = lotes.find((l) => l.id === p.loteId);
                const artesao = artesaos.find((a) => a.id === p.artesaoId);
                const imp = lote ? calcularImpacto(lote.tipo, p.kgUsado) : { co2: 0, agua: 0 };
                return (
                  <div key={p.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <span style={styles.idTag}>{p.id}</span>
                      <span style={styles.sealTag}>selo semsus</span>
                    </div>
                    <div style={styles.cardTitle}>{p.nome}</div>
                    <div style={styles.cardMeta}>
                      por {artesao?.nome || "—"} · origem: {lote?.empresa || "—"} ({lote?.tipo})
                    </div>
                    <div style={styles.priceRow}>
                      <span style={styles.price}>R$ {p.preco.toFixed(2)}</span>
                      <span style={styles.cardImpact}>{imp.co2} kg CO₂ · {imp.agua} L água</span>
                    </div>
                    <button
                      style={{
                        ...styles.buttonSecondary,
                        width: "100%",
                        marginTop: 12,
                        ...(carteira.c.saldo < precoEmPontos(p.preco) ? styles.buttonMuted : {}),
                      }}
                      onClick={() => trocar(p)}
                    >
                      Trocar por {precoEmPontos(p.preco)} eco-pontos
                    </button>
                  </div>
                );
              })}
            </div>

            <h3 style={styles.h3}>Vincular novo produto a um lote</h3>
            <form onSubmit={addProduto} style={styles.form}>
              <select
                value={novoProduto.artesaoId}
                onChange={(e) => setNovoProduto({ ...novoProduto, artesaoId: e.target.value })}
                style={styles.input}
              >
                {artesaos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
              <select
                value={novoProduto.loteId}
                onChange={(e) => setNovoProduto({ ...novoProduto, loteId: e.target.value })}
                style={styles.input}
              >
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>{l.id} — {l.empresa} ({l.tipo})</option>
                ))}
              </select>
              <input
                placeholder="Nome do produto"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                style={styles.input}
              />
              <input
                placeholder="Kg de material usado"
                type="number"
                value={novoProduto.kgUsado}
                onChange={(e) => setNovoProduto({ ...novoProduto, kgUsado: e.target.value })}
                style={styles.input}
              />
              <input
                placeholder="Preço (R$)"
                type="number"
                value={novoProduto.preco}
                onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                style={styles.input}
              />
              <button type="submit" style={styles.buttonPrimary}>Publicar produto</button>
            </form>
          </section>
        )}

        {tab === "ganhe" && <GanhePontos carteira={carteira} s={styles} />}

        {tab === "carteira" && <MinhaCarteira carteira={carteira} s={styles} irPara={setTab} />}

        {tab === "impacto" && (
          <section>
            <h2 style={styles.h2}>Painel de impacto da comunidade</h2>
            <div style={styles.impactGrid}>
              <Stat big label="resíduo desviado de aterro" value={`${impactoTotal.kg} kg`} />
              <Stat big label="co₂ evitado" value={`${impactoTotal.co2} kg`} accent />
              <Stat big label="água poupada" value={`${impactoTotal.agua} L`} />
            </div>

            <h3 style={styles.h3}>Ranking de eco-pontos</h3>
            <div style={styles.rankList}>
              {[...artesaos]
                .sort((a, b) => b.pontos - a.pontos)
                .map((a, i) => (
                  <div key={a.id} style={styles.rankRow}>
                    <span style={styles.rankPos}>{i + 1}º</span>
                    <span style={styles.rankName}>{a.nome}</span>
                    <span style={styles.badge}>{nivelPorPontos(a.pontos)}</span>
                    <span style={styles.rankPoints}>{a.pontos} pts</span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        protótipo — lotes, artesãos e produtos não persistem ao recarregar; sua carteira de eco-pontos fica salva neste navegador.
      </footer>
    </div>
  );
}

function Stat({ label, value, accent, big }) {
  return (
    <div style={{ ...styles.statCard, ...(big ? styles.statCardBig : {}) }}>
      <div style={{ ...styles.statValue, ...(accent ? { color: "#2E7D32" } : {}), ...(big ? { fontSize: 28 } : {}) }}>
        {value}
      </div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "Inter, Arial, sans-serif", color: "#1F1B16", background: "#F6F2E9", padding: "0 0 32px", textAlign: "left" },
  walletChip: { background: "#0F3D2E", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 12, cursor: "pointer", minWidth: 110, textAlign: "left", lineHeight: 1.3 },
  lead: { fontSize: 14, color: "#5A5346", margin: "0 0 16px", lineHeight: 1.5 },
  aviso: { background: "#E5F2E5", border: "1px solid #B9DBBA", color: "#1B5E20", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 },
  linkBtn: { background: "none", border: "none", color: "#2E7D32", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline" },
  buttonSecondary: { background: "#fff", color: "#2E7D32", border: "1.5px solid #2E7D32", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  buttonMuted: { color: "#9C9587", borderColor: "#DCD5C2" },
  subTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  subTab: { background: "#fff", border: "1px solid #E2DCC8", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", color: "#1F1B16", fontWeight: 600 },
  subTabActive: { background: "#0F3D2E", borderColor: "#0F3D2E", color: "#fff" },
  texto: { fontSize: 14, lineHeight: 1.6, color: "#3D372E", margin: "8px 0 12px" },
  nota: { fontSize: 12, color: "#7A7468", margin: "0 0 12px" },
  opcoes: { display: "grid", gap: 8, margin: "12px 0" },
  opcao: { textAlign: "left", background: "#FBF9F4", border: "1px solid #E2DCC8", borderRadius: 8, padding: "10px 14px", fontSize: 14, cursor: "pointer", color: "#1F1B16" },
  opcaoCerta: { background: "#E5F2E5", borderColor: "#2E7D32", color: "#1B5E20", fontWeight: 700 },
  opcaoErrada: { background: "#FBE9E7", borderColor: "#B3261E", color: "#B3261E" },
  itemJogo: { fontSize: 22, fontWeight: 800, textAlign: "center", padding: "18px 12px", background: "#FBF9F4", border: "2px dashed #DCD5C2", borderRadius: 12, margin: "8px 0 14px" },
  lixeiras: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 },
  lixeira: { background: "#0F3D2E", color: "#fff", border: "none", borderRadius: 10, padding: "12px 8px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  barra: { height: 8, background: "#EDE7D8", borderRadius: 999, margin: "8px 0 6px", overflow: "hidden" },
  barraFill: { height: "100%", background: "#2E7D32", borderRadius: 999 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, padding: "28px 32px 16px", borderBottom: "1px solid #E2DCC8" },
  brand: { fontWeight: 800, fontSize: 26, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: "#7A7468", marginTop: 4 },
  statRow: { display: "flex", gap: 12 },
  statCard: { background: "#fff", border: "1px solid #E2DCC8", borderRadius: 10, padding: "10px 16px", minWidth: 110 },
  statCardBig: { minWidth: 160, padding: "16px 20px" },
  statValue: { fontSize: 20, fontWeight: 700 },
  statLabel: { fontSize: 11, color: "#7A7468", marginTop: 2, textTransform: "lowercase" },
  tabs: { display: "flex", gap: 8, padding: "16px 32px 0", flexWrap: "wrap" },
  tabButton: { background: "transparent", border: "1px solid #E2DCC8", borderRadius: 999, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#1F1B16" },
  tabButtonActive: { background: "#2E7D32", borderColor: "#2E7D32", color: "#fff" },
  main: { padding: "24px 32px" },
  h2: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  h3: { fontSize: 15, fontWeight: 700, marginTop: 28, marginBottom: 12, color: "#5A5346" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
  card: { background: "#fff", border: "1px solid #E2DCC8", borderRadius: 12, padding: 16 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  idTag: { fontSize: 11, color: "#9C9587", fontFamily: "monospace" },
  statusTag: { fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 600 },
  statusOk: { background: "#E5F2E5", color: "#2E7D32" },
  statusBusy: { background: "#F4E9D8", color: "#B07A2C" },
  cardTitle: { fontWeight: 700, fontSize: 15, marginBottom: 4 },
  cardMeta: { fontSize: 13, color: "#7A7468", marginBottom: 8 },
  cardImpact: { fontSize: 12, color: "#2E7D32", fontWeight: 600 },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#F4E9D8", color: "#B07A2C", fontWeight: 700 },
  sealTag: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#E5F2E5", color: "#2E7D32", fontWeight: 700 },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  price: { fontWeight: 700, fontSize: 15 },
  form: { display: "flex", gap: 8, flexWrap: "wrap", background: "#fff", border: "1px solid #E2DCC8", borderRadius: 12, padding: 16 },
  input: { flex: "1 1 160px", border: "1px solid #DCD5C2", borderRadius: 8, padding: "8px 10px", fontSize: 13 },
  buttonPrimary: { background: "#2E7D32", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  impactGrid: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 },
  rankList: { display: "flex", flexDirection: "column", gap: 8 },
  rankRow: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #E2DCC8", borderRadius: 10, padding: "10px 14px" },
  rankPos: { fontWeight: 700, width: 28 },
  rankName: { flex: 1, fontWeight: 600 },
  rankPoints: { fontWeight: 700, color: "#2E7D32" },
  footer: { textAlign: "center", fontSize: 11, color: "#9C9587", marginTop: 32 },
};
