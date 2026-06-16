exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, keyConfigured: !!process.env.ANTHROPIC_API_KEY }) };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!process.env.ANTHROPIC_API_KEY) {
      return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY manquante' }) };
    }
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-5-haiku-latest', max_tokens: 1500, messages: [{ role: 'user', content: String(prompt || '') }] })
    });
    const data = await resp.json();
    if (data && data.error) {
      return { statusCode: 502, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: data.error.message || 'Erreur API Anthropic' }) };
    }
    const text = (data && data.content && data.content[0] && data.content[0].text) || '';
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: String(e) }) };
  }
};
