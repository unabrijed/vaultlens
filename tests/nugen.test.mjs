import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCompletion, triage} from '../lib/nugen.ts';

function stream(text) {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({start(controller) {
    for (let i = 0; i < bytes.length; i++) controller.enqueue(bytes.slice(i,i+1));
    controller.close();
  }}));
}
test('reads SSE across byte boundaries and preserves Unicode', async () => {
  assert.equal(await readCompletion(stream('data: {"choices":[{"delta":{"content":"India 🇮🇳"}}]}\r\n\r\ndata: [DONE]\r\n\r\n')), 'India 🇮🇳');
});
test('rejects truncated streams, empty output and provider errors', async () => {
  for (const data of ['data: {"choices":[{"delta":{"content":"partial"}}]}\n\n', 'data: [DONE]\n\n', 'data: {"error":"private provider details"}\n\n']) await assert.rejects(readCompletion(stream(data)));
});
test('validates input before calling provider', async () => {
  for (const body of ['invalid', '{}', '{"text":" "}', JSON.stringify({text:'x'.repeat(8001)})]) {
    const response = await triage(new Request('http://localhost/api/triage', {method:'POST',body}));
    assert.equal(response.status,400);
  }
});
test('request uses server key and specified model; provider errors stay private', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.NUGEN_API_KEY;
  process.env.NUGEN_API_KEY = 'test-secret';
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url,'https://api.nugen.in/api/v3/inference/chat/completions');
      assert.equal(init.headers.Authorization,'Bearer test-secret');
      const payload = JSON.parse(init.body);
      assert.equal(payload.stream,true);
      assert.equal(payload.messages[1].content,'Synthetic report');
      return stream('data: {"choices":[{"delta":{"content":"Review"},"finish_reason":"stop"}]}\n\n');
    };
    const request = () => new Request('http://localhost/api/triage',{method:'POST',body:JSON.stringify({text:'Synthetic report'})});
    assert.equal((await (await triage(request())).json()).text,'Review');
    globalThis.fetch = async () => new Response('test-secret',{status:401});
    const response = await triage(request());
    assert.equal(response.status,502);
    assert.ok(!(await response.text()).includes('test-secret'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.NUGEN_API_KEY; else process.env.NUGEN_API_KEY = originalKey;
  }
});
test('production requires an explicit model before making a paid request', async () => {
  const previous = {env:process.env.NODE_ENV,key:process.env.NUGEN_API_KEY,model:process.env.NUGEN_MODEL_ID};
  try {
    process.env.NODE_ENV='production'; process.env.NUGEN_API_KEY='test-secret'; delete process.env.NUGEN_MODEL_ID;
    const response=await triage(new Request('http://localhost/api/triage',{method:'POST',body:JSON.stringify({text:'Synthetic report'})}));
    assert.equal(response.status,503);
    assert.match((await response.json()).error,/NUGEN_MODEL_ID/);
  } finally {
    for(const [name,value] of Object.entries({NODE_ENV:previous.env,NUGEN_API_KEY:previous.key,NUGEN_MODEL_ID:previous.model})) {
      if(value===undefined) delete process.env[name]; else process.env[name]=value;
    }
  }
});
