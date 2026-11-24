# Semsus — Semeando Sustentabilidade

Site da Semsus: economia circular que conecta indústrias que geram resíduos a artesãos
que os transformam em produtos com selo de origem. Publicado no Wix (site headless
"Semsus - Semeando Sustentabilidade").

## Páginas

| Página | Arquivo | Dados |
|---|---|---|
| Início | `index.html` | últimos artigos lidos do **Wix Blog** |
| Blog / artigo | `public/blog.html`, `public/artigo.html` | **Wix Blog** (artigos editáveis no painel) |
| Jogos (quizzes + Separa Aí!) | `public/jogos.html` | conteúdo no código |
| Desafios e voluntariado | `public/desafios.html` | conteúdo no código |
| Marketplace | `public/marketplace.html` | produtos de demonstração |
| Minha carteira | `public/carteira.html` | eco-pontos no navegador |
| Cadastro de participante | `public/cadastro.html` | **Wix Forms** |
| Cadastro de artesão | `public/cadastro-artesao.html` | **Wix Forms** |
| Plataforma (painel React) | `plataforma.html` + `src/` | protótipo em memória |

Os scripts das páginas ficam em `public/js/semsus/`, os estilos em `public/css/`.
Os módulos do Wix (`/js/wix/`) são instalados no site pelo Wix e não fazem parte do repositório.

## Eco-pontos

Blog +20 por artigo · quiz +10 por acerto (1ª tentativa) · jogo +5 por acerto (1x/dia) ·
desafio +50 · voluntariado +150 (após confirmação). Troca no marketplace: R$ 1,00 = 10 pontos.
No protótipo a carteira fica no `localStorage` (chave `semsus-carteira-v1`), compartilhada
entre as páginas e o painel.

## Desenvolvimento

```bash
npm install
npm run dev     # servidor local
npm run build   # gera dist/ (index, plataforma e as páginas de public/)
```

No Wix, o painel é publicado com Preact no lugar do React (mesma API, pacote ~5x menor).
