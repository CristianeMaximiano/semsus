// Cria as coleções do CMS do site SEMSUS (rodar com ExecuteWixAPI, siteId = site novo).
// Fonte: wix-headless-templates/cms/api-run.md
async function run() {
  const plan = {
    collections: [
      {
        id: 'FatoresImpacto',
        displayName: 'Fatores de Impacto',
        fields: [
          { key: 'material', type: 'TEXT' },
          { key: 'co2PorKg', type: 'NUMBER' },
          { key: 'aguaPorKg', type: 'NUMBER' },
          { key: 'ordem', type: 'NUMBER' },
          { key: 'exemplos', type: 'TEXT' }
        ],
        items: [
          { material: 'Têxtil', co2PorKg: 0.5, aguaPorKg: 2700, ordem: 1, exemplos: 'Retalhos de confecção viram bolsas, patchwork e acessórios.' },
          { material: 'Madeira', co2PorKg: 0.3, aguaPorKg: 50, ordem: 2, exemplos: 'Sobras de marcenaria viram objetos de decoração e utilitários.' },
          { material: 'Papel/Papelão', co2PorKg: 0.9, aguaPorKg: 30, ordem: 3, exemplos: 'Aparas de gráfica viram cadernos, embalagens e papelaria.' },
          { material: 'Plástico', co2PorKg: 1.6, aguaPorKg: 100, ordem: 4, exemplos: 'Plástico técnico vira peças, organizadores e biojoias.' },
          { material: 'Metal leve', co2PorKg: 2.0, aguaPorKg: 10, ordem: 5, exemplos: 'Sobras de metal leve viram luminárias e peças decorativas.' },
          { material: 'Vidro/Cerâmica', co2PorKg: 0.3, aguaPorKg: 5, ordem: 6, exemplos: 'Cacos e sobras viram mosaicos e peças de arte.' }
        ]
      },
      {
        id: 'Artesaos',
        displayName: 'Artesãos',
        fields: [
          { key: 'nome', type: 'TEXT' },
          { key: 'slug', type: 'TEXT' },
          { key: 'especialidade', type: 'TEXT' },
          { key: 'materiais', type: 'ARRAY_STRING' },
          { key: 'cidade', type: 'TEXT' },
          { key: 'bio', type: 'TEXT' },
          { key: 'nivel', type: 'TEXT' },
          { key: 'kgTransformados', type: 'NUMBER' },
          { key: 'instagram', type: 'URL' },
          { key: 'foto', type: 'IMAGE' },
          { key: 'exemplo', type: 'BOOLEAN' }
        ],
        items: [
          { nome: 'Perfil de exemplo — Costura', slug: 'exemplo-costura', especialidade: 'Patchwork e bolsas', materiais: ['Têxtil'], cidade: 'Santo André, SP', bio: 'Perfil ilustrativo. Substitua pela história de uma artesã real da rede SEMSUS: como começou, o que cria e qual resíduo transforma.', nivel: 'Artesão Circular', kgTransformados: 0, exemplo: true },
          { nome: 'Perfil de exemplo — Marcenaria', slug: 'exemplo-marcenaria', especialidade: 'Decoração em madeira', materiais: ['Madeira'], cidade: 'São Bernardo do Campo, SP', bio: 'Perfil ilustrativo. Substitua por um artesão real que transforma sobras de marcenaria em objetos de decoração.', nivel: 'Iniciante', kgTransformados: 0, exemplo: true },
          { nome: 'Perfil de exemplo — Papelaria', slug: 'exemplo-papelaria', especialidade: 'Cadernos e encadernação artesanal', materiais: ['Papel/Papelão'], cidade: 'Diadema, SP', bio: 'Perfil ilustrativo. Substitua por uma artesã real que cria papelaria a partir de aparas de gráfica.', nivel: 'Iniciante', kgTransformados: 0, exemplo: true }
        ]
      }
    ]
  };

  const api = async (method, path, body) => (await wix.request({ scope: 'site', method, url: `https://www.wixapis.com${path}`, body })).data;
  await api('POST', '/apps-installer-service/v1/app-instance/install', { tenant: { tenantType: 'SITE', id: siteId }, appInstance: { appDefId: 'e593b0bd-b783-45b8-97c2-873d42aacaf4', enabled: true } });

  const out = [];
  for (const col of plan.collections) {
    let created = true;
    try {
      const collection = {
        id: col.id,
        displayName: col.displayName,
        fields: col.fields.map((f) => ({ key: f.key, displayName: f.key, type: f.type })),
        permissions: { insert: 'ADMIN', update: 'ADMIN', remove: 'ADMIN', read: 'ANYONE' }
      };
      await api('POST', '/wix-data/v2/collections', { collection });
    } catch (e) {
      if (!String(e.message).includes('WDE0104')) throw e;
      created = false;
    }
    const dataItems = col.items.map((item) => ({ data: item }));
    const inserted = await api('POST', '/wix-data/v2/bulk/items/insert', { dataCollectionId: col.id, dataItems, returnEntity: true });
    out.push({ id: col.id, created, inserted: (inserted.results || []).length, failures: inserted.bulkActionMetadata.totalFailures });
  }
  return out;
}
