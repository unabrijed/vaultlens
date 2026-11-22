// Explicit, one-request-at-a-time CLI; no deployment and no automatic retries.
import {readFile, readdir} from 'node:fs/promises';
const [command, ...args] = process.argv.slice(2);
const help = `Run from the repository root with Node 22.18+:
node --env-file=.env scripts/nugen-workflow.mjs models
node --env-file=.env scripts/nugen-workflow.mjs upload
node --env-file=.env scripts/nugen-workflow.mjs document-status DOCUMENT_ID
node --env-file=.env scripts/nugen-workflow.mjs align BASE_MODEL_ID DOCUMENT_ID [DOCUMENT_ID...]
node --env-file=.env scripts/nugen-workflow.mjs alignment-status ALIGNMENT_ID
node --env-file=.env scripts/nugen-workflow.mjs aligned-models
node --env-file=.env scripts/nugen-workflow.mjs model MODEL_ID
node --env-file=.env scripts/nugen-workflow.mjs deployment-status MODEL_ID
Upload and align make changes and may consume credits. Check credit/cost information in the platform first.
Use only READY document IDs for alignment. Deploy the resulting model in the Nugen platform.
On an ambiguous timeout, inspect platform state before repeating a write.`;
const key = process.env.NUGEN_API_KEY || process.env.NUGEN_APIKEY;
const encode = value => encodeURIComponent(value);
async function main() {
  if (!command || command === '--help') { console.log(help); return; }
  let path, body, method = 'GET';
  const headers = {};
  if (command === 'models' && !args.length) path = 'models/base';
  else if (command === 'aligned-models' && !args.length) path = 'models/aligned';
  else if (command === 'document-status' && args.length === 1) path = `documents/${encode(args[0])}/status`;
  else if (command === 'alignment-status' && args.length === 1) path = `alignment-projects/${encode(args[0])}/status`;
  else if (command === 'model' && args.length === 1) path = `models/${encode(args[0])}`;
  else if (command === 'deployment-status' && args.length === 1) path = `models/${encode(args[0])}/deployment/status`;
  else if (command === 'upload' && !args.length) {
    path = 'documents/create'; method = 'POST'; body = new FormData();
    const files = (await readdir('data/training')).filter(x => x.endsWith('.txt')).sort();
    if (!files.length) throw new Error('No training documents');
    for (const file of files) {
      const text = await readFile(`data/training/${file}`, 'utf8');
      if (text.trim().split(/\s+/).length < 500) throw new Error(`Document too short: ${file}`);
      body.append('files', new Blob([text], {type:'text/plain'}), file);
    }
  } else if (command === 'align' && args.length >= 2) {
    path = 'alignment-projects/create'; method = 'POST'; headers['Content-Type'] = 'application/json';
    body = JSON.stringify({alignment_name:'VaultLens DeFi triage v1',base_model_id:args[0],document_ids:args.slice(1),description:'Synthetic educational incident classification, quoted evidence, uncertainty, and read-only next checks.'});
  } else throw new Error(help);
  if (!key) throw new Error('Set NUGEN_API_KEY in .env or the environment.');
  headers.Authorization = `Bearer ${key}`;
  const response = await fetch(`https://api.nugen.in/api/v3/${path}`, {method,headers,body,redirect:'error',signal:AbortSignal.timeout(60000)});
  // Never echo raw errors, which can contain internal provider details.
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Nugen HTTP ${response.status}; inspect the platform for details before retrying.`); }
  const result = JSON.stringify(await response.json(), null, 2);
  console.log(result.replaceAll(key, '<REDACTED>'));
}
main().catch(error => {console.error(error.cause?.code ? `Connection failed: ${error.cause.code}. Check platform state before retrying writes.` : error.message);process.exitCode=1;});
