// Fonction serverless Netlify (v2) — appelle l'IA Anthropic avec ta cle.
// La cle reste cote serveur (variable d'environnement ANTHROPIC_API_KEY) — jamais dans le code public.
export default async (req) => {
  // Test dans le navigateur (GET) : message de sante
  if (req.method === 'GET') {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    return new Response(JSON.stringify({ ok: true, keyConfigured: hasKey, msg: hasKey ? 'Fonction prete, cle detectee.' : 'Fonction en ligne mais ANTHROPIC_API_KEY manquante.' }), { headers: { 'content-type': 'application/json' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { prompt } = await req.json();
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY manquante dans les reglages Netlify' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1500,
        messages: [{ role: 'user', content: String(prompt || '') }]
      })
    });
    const data = await resp.json();
    if (data && data.error) {
      return new Response(JSON.stringify({ error: (data.error.message || 'Erreur API Anthropic') }), { status: 502, headers: { 'content-type': 'application/json' } });
    }
    const text = (data && data.content && data.content[0] && data.content[0].text) || '';
    return new Response(JSON.stringify({ text }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
