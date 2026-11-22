import {readFile} from 'node:fs/promises';
import {validateReview} from '../lib/review.ts';
import {readCompletion} from '../lib/nugen.ts';
const cases = JSON.parse(await readFile(new URL('../data/evaluation/holdout.json',import.meta.url),'utf8'));
const model = process.env.NUGEN_MODEL_ID;
const key = process.env.NUGEN_API_KEY;
if (!model || !key) throw new Error('Set NUGEN_MODEL_ID and NUGEN_API_KEY before evaluation.');
const prompts=JSON.parse(await readFile(new URL('../data/evaluation/prompts.json',import.meta.url),'utf8'));
const variant=process.argv[process.argv.indexOf('--variant')+1];
if(!process.argv.includes('--variant') || !Object.hasOwn(prompts,variant)) throw new Error('Choose --variant baseline, revised, revised-v2, or revised-v3. Each run makes eight paid requests.');
// Eight sequential calls, maximum 500 output tokens each; no retries.
for (const [name,prompt] of [[variant,prompts[variant]]]) {
 for (const item of cases) {
  const record={id:item.id,variant:name,model,startedAt:new Date().toISOString(),expected:{category:item.category,severity:item.severity}};
  try {
   const response=await fetch('https://api.nugen.in/api/v3/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json',accept:'application/json'},body:JSON.stringify({model,max_tokens:500,temperature:0.1,stream:true,messages:[{role:'system',content:prompt},{role:'user',content:item.text}]}),signal:AbortSignal.timeout(45000)});
   if(!response.ok) {await response.body?.cancel();throw new Error(`Provider HTTP ${response.status}`);}
   record.text=await readCompletion(response);
   record.validation=validateReview(record.text,item.text);
   record.categoryCorrect=record.validation.category===item.category;
   record.severityCorrect=record.validation.severity===item.severity;
  }catch(error){record.error=error.message;record.categoryCorrect=false;record.severityCorrect=false;}
  console.log(JSON.stringify(record));
 }
}
