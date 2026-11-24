# Recriar o site SEMSUS na conta Wix da SEMSUS

Contexto: a primeira versão foi criada por engano na conta Wix da CKC
(site `8396ae8d-7e25-4c53-b90b-bbec1dab5477`). A decisão da Cristiane é
recriar o site **na conta Wix da SEMSUS** (que tem plano Premium).
O código das páginas é o mesmo; só os IDs mudam.

## Pré-requisito
A conexão Wix do Claude precisa estar logada na conta da SEMSUS
(claude.ai/customize/connectors → Wix → desconectar e conectar de novo com a conta SEMSUS),
e a sessão precisa ser nova (conectores são lidos ao iniciar a sessão).
Confirme com `ListWixSites`: NÃO deve aparecer o site "My Site" (ckctransportes.com.br).

## Passos (fluxo headless, ver StartHeadlessBuild)
1. **Criar o site**: provision headless com `metaSiteName: 'SEMSUS'`, sem `seedOptions`.
   Anotar `metaSiteId` e `appId`.
   - Se a conta SEMSUS já tiver um site com o plano Premium, perguntar à Cristiane se
     o plano deve ir para o site novo (o plano é por site).
2. **CMS**: rodar `docs/wix-seed/cms-seed.js` com ExecuteWixAPI (siteId novo).
3. **Formulários**: rodar `docs/wix-seed/forms-seed.js` com ExecuteWixAPI. Anotar os 3 `formId`.
4. **Atualizar os formIds** nas páginas `wix-site/pages/industrias.html`,
   `artesaos.html` e `contato.html` (atributo `data-form-id`), rodar
   `python3 wix-site/build.py`.
   - IDs antigos (conta CKC): indústria `e3adf79b-…`, artesão `c61d1aa9-…`, contato `637b7c27-…`.
5. **Upload**: `UploadHeadlessWebsiteFiles` com `index.html` + `styles.css` primeiro,
   depois `js/*.js`, depois as demais páginas (os servidores Wix não acessam GitHub;
   o envio é pelo parâmetro `files`). Truque usado: ExecuteWixAPI lê o `index.html`
   publicado e monta as outras páginas a partir de `wix-site/pages/*.html` (cabeçalho e rodapé reaproveitados).
6. **Módulos**: `wix.headless.modules.install({ siteId, clientId: <appId>, solutions: ['cms', 'forms'] })`.
7. **Verificação de visitante**: token anônimo com o appId, consultar `Artesaos`,
   `FatoresImpacto` e os 3 formulários (ver cms/forms `api-run.md`).
8. **Site antigo na conta CKC**: perguntar à Cristiane se pode apagar.
   Não apagar sem confirmação.
