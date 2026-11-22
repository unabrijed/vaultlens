import {REVIEW_PROMPT, validateReview} from './review.ts';
export const DEFAULT_MODEL = 'Qwen/Qwen2.5-0.5B-Instruct';

// Consume SSE frames across arbitrary network chunk boundaries.
export async function readCompletion(response: Response): Promise<string> {
  if (!response.body) throw new Error('Missing response body');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', output = '', bytes = 0, finished = false;
  function frame(value: string) {
    const data = value.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!data) return;
    if (data.trim() === '[DONE]') { finished = true; return; }
    const event = JSON.parse(data);
    if (event.error) throw new Error('Provider stream error');
    const choice = event.choices?.[0];
    const content = choice?.delta?.content;
    if (typeof content === 'string') output += content;
    if (choice?.finish_reason) finished = true;
  }
  try {
    while (!finished) {
      const {value, done} = await reader.read();
      if (done) { buffer += decoder.decode(); break; }
      bytes += value.byteLength;
      if (bytes > 1_000_000) throw new Error('Response too large');
      buffer += decoder.decode(value, {stream: true});
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        frame(buffer.slice(0, boundary.index).replace(/\r\n/g, '\n'));
        buffer = buffer.slice(boundary.index + boundary[0].length);
        if (finished) break;
      }
    }
    if (!finished && buffer.trim()) frame(buffer.replace(/\r\n/g, '\n'));
    if (!finished || !output.trim()) throw new Error('Incomplete or empty response');
    return output.trim();
  } finally { await reader.cancel().catch(() => {}); }
}

export async function triage(request: Request): Promise<Response> {
  const reply = (body: object, status = 200) => Response.json(body, {status, headers: {'Cache-Control': 'no-store'}});
  // The application is a local hiring demo, not an unauthenticated public inference service.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply({error: 'Cross-origin requests are not allowed.'}, 403);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return reply({error: 'Report is too long.'}, 413);
    input = JSON.parse(raw);
  } catch { return reply({error: 'Expected a JSON incident report.'}, 400); }
  if (typeof input?.text !== 'string' || !input.text.trim() || input.text.length > 8000) {
    return reply({error: 'Enter an incident report of 1–8,000 characters.'}, 400);
  }
  const key = process.env.NUGEN_API_KEY || process.env.NUGEN_APIKEY;
  if (!key) return reply({error: 'Set NUGEN_API_KEY on the server to enable live inference.'}, 503);
  if (process.env.NODE_ENV === 'production' && !process.env.NUGEN_MODEL_ID) return reply({error: 'Configure NUGEN_MODEL_ID on the server before using live review.'}, 503);
  const model = process.env.NUGEN_MODEL_ID || DEFAULT_MODEL;
  try {
    const response = await fetch('https://api.nugen.in/api/v3/inference/chat/completions', {
      method: 'POST',
      headers: {accept: 'application/json', Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({model, max_tokens: 500, temperature: 0.1, stream: true, messages: [
        {role: 'system', content: REVIEW_PROMPT},
        {role: 'user', content: input.text.trim()}
      ]}),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(45000)]),
      cache: 'no-store'
    });
    if (!response.ok) {
      await response.body?.cancel();
      return reply({error: response.status === 401 || response.status === 403 ? 'Nugen rejected the server credentials or model access.' : response.status === 429 ? 'Nugen rate limit reached. Try again later.' : 'Nugen could not complete this request.', providerStatus: response.status}, 502);
    }
    const text = await readCompletion(response);
    return reply({text, model, source: 'nugen', validation: validateReview(text, input.text.trim())});
  } catch {
    return reply({error: 'Live inference failed or timed out. No demo answer was substituted.'}, 502);
  }
}
