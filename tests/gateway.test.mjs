import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleTriage} from '../lib/triage-gateway.ts';
test('Railway refuses calls without the private token', async () => {
 const oldRole=process.env.VAULTLENS_ROLE, oldToken=process.env.VAULTLENS_BACKEND_TOKEN;
 try {
  process.env.VAULTLENS_ROLE='backend';process.env.VAULTLENS_BACKEND_TOKEN='secret';
  const request=()=>new Request('https://backend.test/api/triage',{method:'POST',body:'{}'});
  assert.equal((await handleTriage(request())).status,401);
  delete process.env.VAULTLENS_BACKEND_TOKEN;
  assert.equal((await handleTriage(request())).status,503);
 } finally {
  for(const [key,value] of Object.entries({VAULTLENS_ROLE:oldRole,VAULTLENS_BACKEND_TOKEN:oldToken})) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
 }
});
test('Vercel proxy forwards server token and returns provider response', async () => {
 const names=['VAULTLENS_ROLE','VAULTLENS_BACKEND_TOKEN','VAULTLENS_BACKEND_URL'];
 const old=Object.fromEntries(names.map(k=>[k,process.env[k]]));const oldFetch=globalThis.fetch;
 try {
  delete process.env.VAULTLENS_ROLE;process.env.VAULTLENS_BACKEND_TOKEN='secret';process.env.VAULTLENS_BACKEND_URL='https://backend.test';
  globalThis.fetch=async(url,init)=>{
   assert.equal(String(url),'https://backend.test/api/triage');assert.equal(init.headers['x-vaultlens-token'],'secret');assert.equal(init.headers.origin,undefined);
   return Response.json({text:'review',source:'nugen'});
  };
  const request=origin=>new Request('https://frontend.test/api/triage',{method:'POST',headers:{origin},body:JSON.stringify({text:'report'})});
  assert.equal((await (await handleTriage(request('https://frontend.test'))).json()).text,'review');
  assert.equal((await handleTriage(request('https://other.test'))).status,403);
  globalThis.fetch=async()=>{throw new Error('secret');};
  const response=await handleTriage(request('https://frontend.test'));
  assert.equal(response.status,502);assert.ok(!(await response.text()).includes('secret'));
 }finally{globalThis.fetch=oldFetch;for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
