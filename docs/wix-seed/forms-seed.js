async function run() {
  const plan = {
    forms: [
      { name: 'Indústria parceira', submitText: 'Quero destinar meu resíduo',
        thankYou: 'Obrigado! A equipe SEMSUS vai entrar em contato em até 2 dias úteis para agendar o diagnóstico.',
        fields: [
          { label: 'Seu nome', kind: 'firstName', required: true },
          { label: 'Empresa', kind: 'company', required: true },
          { label: 'E-mail', kind: 'email', required: true },
          { label: 'Telefone / WhatsApp', kind: 'phone', country: 'BR' },
          { label: 'Setor', kind: 'select', choices: ['Têxtil / confecção', 'Madeira / moveleiro', 'Papel / gráfica', 'Plástico', 'Metal leve', 'Eventos'], other: 'Outro' },
          { label: 'Resíduos gerados', kind: 'multi', choices: ['Têxtil', 'Madeira', 'Papel/Papelão', 'Plástico', 'Metal leve', 'Vidro/Cerâmica'] },
          { label: 'Volume estimado por mês (kg)', kind: 'number', min: 0 },
          { label: 'Cidade', kind: 'text' },
          { label: 'Conte mais sobre o resíduo', kind: 'textarea', maxLength: 1000 }
        ] },
      { name: 'Quero ser artesão SEMSUS', submitText: 'Enviar cadastro',
        thankYou: 'Cadastro recebido! Nossa curadoria vai analisar seu perfil e falar com você em breve.',
        fields: [
          { label: 'Seu nome', kind: 'firstName', required: true },
          { label: 'E-mail', kind: 'email', required: true },
          { label: 'Telefone / WhatsApp', kind: 'phone', country: 'BR', required: true },
          { label: 'Cidade', kind: 'text', required: true },
          { label: 'Especialidade', kind: 'text', placeholder: 'Ex.: patchwork, marcenaria, biojoias' },
          { label: 'Materiais de interesse', kind: 'multi', choices: ['Têxtil', 'Madeira', 'Papel/Papelão', 'Plástico', 'Metal leve', 'Vidro/Cerâmica'] },
          { label: 'Instagram ou portfólio', kind: 'url' },
          { label: 'Conte sua história', kind: 'textarea', maxLength: 1500 }
        ] },
      { name: 'Contato SEMSUS', submitText: 'Enviar mensagem',
        thankYou: 'Mensagem recebida! Respondemos em até 2 dias úteis.',
        fields: [
          { label: 'Seu nome', kind: 'firstName', required: true },
          { label: 'E-mail', kind: 'email', required: true },
          { label: 'Telefone / WhatsApp', kind: 'phone', country: 'BR' },
          { label: 'Assunto', kind: 'select', choices: ['Sou consumidor', 'Imprensa', 'Investimento / parceria', 'Outro'] },
          { label: 'Mensagem', kind: 'textarea', required: true, maxLength: 1500 }
        ] }
    ]
  };
  const api = async (method, path, body) =>
    (await wix.request({ scope: 'site', method, url: `https://www.wixapis.com${path}`, body })).data;
  const uuid = () => crypto.randomUUID();
  // kind: [inputType, componentType, identifier, format, contact mapping]
  const KINDS = {
    text: ['STRING', 'TEXT_INPUT', 'TEXT_INPUT'],
    textarea: ['STRING', 'TEXT_INPUT', 'TEXT_AREA'],
    email: ['STRING', 'TEXT_INPUT', 'CONTACTS_EMAIL', 'EMAIL', { contactField: 'EMAIL', emailInfo: { tag: 'UNTAGGED' } }],
    phone: ['STRING', 'PHONE_INPUT', 'CONTACTS_PHONE', 'PHONE', { contactField: 'PHONE', phoneInfo: { tag: 'UNTAGGED' } }],
    url: ['STRING', 'TEXT_INPUT', 'URL_INPUT', 'URL'],
    firstName: ['STRING', 'TEXT_INPUT', 'CONTACTS_FIRST_NAME', null, { contactField: 'FIRST_NAME' }],
    lastName: ['STRING', 'TEXT_INPUT', 'CONTACTS_LAST_NAME', null, { contactField: 'LAST_NAME' }],
    company: ['STRING', 'TEXT_INPUT', 'CONTACTS_COMPANY', null, { contactField: 'COMPANY' }],
    date: ['STRING', 'DATE_PICKER', 'DATE_PICKER', 'DATE'],
    time: ['STRING', 'TIME_INPUT', 'TIME_INPUT', 'TIME'],
    datetime: ['STRING', 'DATE_TIME', 'DATE_TIME_INPUT', 'DATE_TIME'],
    number: ['NUMBER', 'NUMBER_INPUT', 'NUMBER_INPUT'],
    rating: ['NUMBER', 'RATING_INPUT', 'RATING_INPUT'],
    select: ['STRING', 'DROPDOWN', 'DROPDOWN'],
    radio: ['STRING', 'RADIO_GROUP', 'RADIO_GROUP'],
    multi: ['ARRAY', 'CHECKBOX_GROUP', 'CHECKBOX_GROUP'],
    tags: ['ARRAY', 'TAGS', 'TAGS'],
    checkbox: ['BOOLEAN', 'CHECKBOX', 'CHECKBOX'],
    file: ['WIX_FILE', 'FILE_UPLOAD', 'FILE_UPLOAD'],
    address: ['ADDRESS', 'MULTILINE_ADDRESS', 'MULTILINE_ADDRESS']
  };
  const INPUT_BLOCK = { STRING: 'stringOptions', NUMBER: 'numberOptions', BOOLEAN: 'booleanOptions',
    ARRAY: 'arrayOptions', ADDRESS: 'addressOptions', WIX_FILE: 'wixFileOptions' };
  const COMPONENT_BLOCK = { TEXT_INPUT: 'textInputOptions', PHONE_INPUT: 'phoneInputOptions',
    NUMBER_INPUT: 'numberInputOptions', RATING_INPUT: 'ratingInputOptions', DATE_PICKER: 'datePickerOptions',
    TIME_INPUT: 'timeInputOptions', DATE_TIME: 'dateTimeOptions', CHECKBOX: 'checkboxOptions',
    CHECKBOX_GROUP: 'checkboxGroupOptions', TAGS: 'tagsOptions', RADIO_GROUP: 'radioGroupOptions',
    DROPDOWN: 'dropdownOptions', MULTILINE_ADDRESS: 'multilineAddressOptions', FILE_UPLOAD: 'fileUploadOptions' };
  const DATE_BLOCK = { date: 'dateOptions', time: 'timeOptions', datetime: 'dateTimeOptions' };
  const OPERATORS = { is: 'EQUAL', isNot: 'NOT_EQUAL', in: 'IN', includes: 'CONTAINS', checked: 'CHECKED',
    isEmpty: 'EMPTY', isNotEmpty: 'NOT_EMPTY' };
  const rich = (text) => ({ nodes: [{ type: 'PARAGRAPH', id: uuid().slice(0, 8), paragraphData: {},
    nodes: [{ type: 'TEXT', id: '', nodes: [], textData: { text: String(text), decorations: [] } }] }],
    metadata: { version: 1 } });

  const buildField = (f) => {
    const [inputType, componentType, identifier, format, contact] = KINDS[f.kind];
    const defaults = [].concat(f.default == null ? [] : f.default).map(String);
    const options = (f.choices || []).map((c) => {
      const value = typeof c === 'string' ? c : c.value;
      return { id: uuid(), label: typeof c === 'string' ? c : c.label || c.value, value,
        ...(defaults.includes(String(value)) ? { default: true } : {}) };
    });
    const values = options.map((o) => o.value);
    const validation = {};
    if (format) validation.format = format;
    if (DATE_BLOCK[f.kind]) {
      if (f.min != null || f.max != null) {
        validation[DATE_BLOCK[f.kind]] = { ...(f.min != null ? { minimum: String(f.min) } : {}),
          ...(f.max != null ? { maximum: String(f.max) } : {}) };
      }
    } else {
      if (f.min != null) validation.minimum = f.min;
      if (f.max != null) validation.maximum = f.max;
    }
    if (f.step != null) validation.multipleOf = f.step;
    if (f.minLength != null) validation.minLength = f.minLength;
    if (f.maxLength != null) validation.maxLength = f.maxLength;
    if (f.pattern) validation.pattern = f.pattern;
    if (f.patternMessage) validation.validationMessages = { pattern: f.patternMessage };
    if (f.minItems != null) validation.minItems = f.minItems;
    if (f.maxItems != null) validation.maxItems = f.maxItems;
    // A choice field names its values twice: in the options and in the validation.
    if (values.length && inputType === 'ARRAY') validation.items = { itemType: 'STRING', stringOptions: f.other ? {} : { enum: values } };
    else if (values.length && !f.other) validation.enum = values;
    if (f.kind === 'phone' && f.countries) validation.phoneOptions = { allowedCountryCodes: f.countries };
    if (f.kind === 'file') {
      validation.fileLimit = f.fileLimit || 1;
      if (f.formats) validation.uploadFileFormats = f.formats;
    }
    if (f.kind === 'checkbox' && f.required) validation.enum = [true];
    if (f.kind === 'address') {
      if (f.countries) validation.allowedCountries = f.countries;
      validation.fields = Object.fromEntries(['country', 'addressLine', 'addressLine2', 'city', 'subdivision', 'postalCode']
        .map((part) => [part, { required: f.parts?.[part] ?? (!!f.required && !['addressLine2', 'subdivision'].includes(part)) }]));
    }
    const component = { label: f.kind === 'checkbox' ? rich(f.label) : f.label, showLabel: true };
    if (f.placeholder) component.placeholder = f.placeholder;
    if (f.description) component.description = rich(f.description);
    if (options.length) component.options = options;
    if (f.other) component.customOption = { label: typeof f.other === 'string' ? f.other : 'Other' };
    if (f.default != null && !options.length) {
      if (f.kind === 'checkbox') component.checked = !!f.default;
      else if (f.kind === 'rating') component.defaultValue = Number(f.default);
      else if (f.kind === 'number') component.default = Number(f.default);
      else component.default = String(f.default);
    }
    if (f.kind === 'phone' && f.country) component.defaultCountryCode = f.country;
    if (f.kind === 'file' && f.buttonText) component.buttonText = f.buttonText;
    return { id: uuid(), identifier, fieldType: 'INPUT', hidden: !!f.hidden,
      inputOptions: {
        target: f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/^(?=\d)/, 'f_').slice(0, 40)
          + '_' + Math.random().toString(36).slice(2, 8),
        inputType, required: !!f.required,
        ...(contact ? { pii: true, contactMapping: contact } : {}),
        [INPUT_BLOCK[inputType]]: { validation, componentType, [COMPONENT_BLOCK[componentType]]: component }
      } };
  };

  const buildForm = (form) => {
    const fields = form.fields.map(buildField);
    const byLabel = (label) => {
      const i = form.fields.findIndex((f) => f.label === label);
      if (i < 0) throw new Error(`form "${form.name}": no field with the label "${label}"`);
      return fields[i];
    };
    const submit = { id: uuid(), identifier: 'SUBMIT_BUTTON', fieldType: 'DISPLAY',
      displayOptions: { displayFieldType: 'PAGE_NAVIGATION', pageNavigationOptions: {
        submitText: form.submitText || 'Submit',
        ...(form.nextText ? { nextPageText: form.nextText } : {}),
        ...(form.previousText ? { previousPageText: form.previousText } : {}) } } };
    // Every field sits on a step, the submit button on the last one.
    const planSteps = form.steps || [{ fields: form.fields.map((f) => f.label) }];
    const stepFields = planSteps.map((s) => s.fields.map(byLabel));
    const placed = new Set(stepFields.flat().map((f) => f.id));
    stepFields[stepFields.length - 1].push(...fields.filter((f) => !placed.has(f.id)), submit);
    const steps = planSteps.map((s, i) => {
      const items = stepFields[i].map((f, row) => ({ fieldId: f.id, row, column: 0, width: 12 }));
      return { id: uuid(), ...(s.name ? { name: s.name } : {}), layout: { large: { items }, medium: { items }, small: { items } } };
    });
    const formRules = (form.rules || []).map((r) => {
      const test = Object.keys(OPERATORS).find((k) => k in r.when);
      const value = ['checked', 'isEmpty', 'isNotEmpty'].includes(test) ? true : r.when[test];
      const change = (label, propertyType, options) => ({ entityType: 'FIELD',
        fieldOptions: { fieldId: byLabel(label).id, propertyType, ...options } });
      for (const label of r.show || []) byLabel(label).hidden = true;   // a field that a rule shows starts hidden
      return { id: uuid(), name: `${r.when.field} ${test}`.slice(0, 100),
        expression: { and: { conditions: [{ condition: { target: byLabel(r.when.field).inputOptions.target, operator: OPERATORS[test], value } }] } },
        overrides: [
          ...(r.show || []).map((l) => change(l, 'HIDDEN', { hiddenOptions: { hidden: false } })),
          ...(r.hide || []).map((l) => change(l, 'HIDDEN', { hiddenOptions: { hidden: true } })),
          ...(r.require || []).map((l) => change(l, 'REQUIRED', { requiredOptions: { required: true } }))
        ] };
    });
    const limitationRule = {
      ...(form.deadline ? { dateTimeDeadline: new Date(form.deadline).toISOString() } : {}),
      ...(form.maxSubmissions != null ? { maxAllowedSubmissions: form.maxSubmissions } : {}),
      ...(form.perVisitor != null ? { submissionLimitPerUser: form.perVisitor } : {}) };
    return { name: form.name, namespace: 'wix.form_app.form', formFields: [...fields, submit], steps,
      ...(formRules.length ? { formRules } : {}),
      ...(form.redirect ? { submitSettings: { submitSuccessAction: 'REDIRECT', redirectOptions: { redirectUrl: form.redirect, target: 'SELF' } } }
        : form.thankYou ? { submitSettings: { submitSuccessAction: 'THANK_YOU_MESSAGE', thankYouMessageOptions: { richContent: rich(form.thankYou) } } } : {}),
      ...(Object.keys(limitationRule).length ? { limitationRule } : {}) };
  };

  await api('POST', '/apps-installer-service/v1/app-instance/install',
    { tenant: { tenantType: 'SITE', id: siteId }, appInstance: { appDefId: '225dd912-7dea-4738-8688-4b8c6955ffc2', enabled: true } });
  let have;
  for (let i = 0; i < 10 && !have; i++) {                      // a new install finishes in the background
    try {
      have = (await api('GET', '/form-schema-service/v4/forms?namespace=wix.form_app.form')).forms || [];
    } catch (e) {
      if (i === 9) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  const out = [];
  for (const form of plan.forms) {
    const existing = have.find((x) => x.name === form.name);     // a form with the same name is kept as it is
    if (existing) { out.push({ name: form.name, formId: existing.id, created: false }); continue; }
    const body = buildForm(form);
    const created = (await api('POST', '/form-schema-service/v4/forms', { form: body })).form;
    // Read it back: a field that Wix stored as another component is listed in `changed`.
    const live = (await api('GET', `/form-schema-service/v4/forms/${created.id}`)).form;
    const stored = Object.fromEntries((live.formFields || []).filter((f) => f.fieldType === 'INPUT')
      .map((f) => [f.inputOptions.target, f.inputOptions[INPUT_BLOCK[f.inputOptions.inputType]]?.componentType]));
    const changed = body.formFields.filter((f) => f.fieldType === 'INPUT')
      .filter((f) => stored[f.inputOptions.target] !== f.inputOptions[INPUT_BLOCK[f.inputOptions.inputType]].componentType)
      .map((f) => f.inputOptions.target);
    out.push({ name: form.name, formId: created.id, created: true, fields: Object.keys(stored).length,
      steps: (live.steps || []).length, rules: (live.formRules || []).length, changed });
  }
  return { forms: out };
}
