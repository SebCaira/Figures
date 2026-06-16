const MODELS = [
  'claude-haiku-4-5',
  'claude-sonnet-4-6',
  'claude-opus-4-8'
];

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    const wantTest = event.queryStringParameters && event.queryStringParameters.test;
    if (!wantTest || !hasKey) return json(200, { ok: true, keyConfigured: hasKey });
    try {
      const { data, model } = await callAnthropic('Reponds juste par le mot: OK');
      if (data && data.error) return json(200, { test: 'ERREUR', type: data.error.type, message: data.error.message });
      const text = (data && data.content && data.content[0] && data.content[0].text) || '';
      return json(200, { test: 'SUCCES', modele: model, reponseIA: text });
    } catch (e) {
      return json(200, { test: 'EXCEPTION', message: String(e) });
    }
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: 'ANTHROPIC_API_KEY manquante' });
    const { data } = await callAnthropic(String(prompt || ''));
    if (data && data.error) return json(502, { error: data.error.message || 'Erreur API Anthropic' });
    const text = (data && data.content && data.content[0] && data.content[0].text) || '';
    return json(200, { text });
  } catch (e) {
    return json(500, { error: String(e) });
  }
};

async function callAnthropic(prompt) {
  let last = null;
  for (const model of MODELS) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: model, max_tokens: 1200, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await r.json();
    if (data && data.error && data.error.type === 'not_found_error') { last = { data, model }; continue; }
    return { data, model };
  }
  return last || { data: { error: { message: 'Aucun modele disponible sur ce compte' } }, model: null };
}

function json(statusCode, obj) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj) };
}
