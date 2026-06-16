export default async (req) => {
  if (req.method === 'GET') {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    return new Response(JSON.stringify({ ok: true, keyConfigured: hasKey }), { headers: { 'content-type': 'application/json' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { prompt } = await req.json();
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'cle manquante' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-5-haiku-latest', max_tokens: 1500, messages: [{ role: 'user', content: String(prompt || '') }] })
    });
    const data = await resp.json();
    if (data && data.error) return new Response(JSON.stringify({ error: data.error.message || 'erreur API' }), { status: 502, headers: { 'content-type': 'application/json' } });
    const text = (data && data.content && data.content[0] && data.content[0].text) || '';
    return new Response(JSON.stringify({ text }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
