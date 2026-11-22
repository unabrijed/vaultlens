import {readFile,writeFile} from 'node:fs/promises';
import {validateReview} from '../lib/review.ts';
const root=new URL('../data/evaluation/',import.meta.url);
const cases=JSON.parse(await readFile(new URL('holdout.json',root),'utf8'));
const records=(await Promise.all(['prompt-comparison-initial.json','prompt-comparison-v2.json','prompt-comparison-v3.json'].map(async file=>JSON.parse(await readFile(new URL(file,root),'utf8'))))).flat();
const groups=['baseline','revised','revised-v2','revised-v3'].map(variant=>{
 const rows=records.filter(r=>r.variant===variant);
 if(rows.length!==cases.length||new Set(rows.map(r=>r.id)).size!==cases.length)throw new Error('Incomplete or duplicate evaluation records');
 let category=0,severity=0,joint=0,quotes=0,structure=0,failures=0;
 for(const row of rows){const truth=cases.find(c=>c.id===row.id);if(!truth)throw Error('Unknown case');const v=validateReview(row.text||'',truth.text);const c=v.category===truth.category,s=v.severity===truth.severity;category+=Number(c);severity+=Number(s);joint+=Number(c&&s);structure+=Number(!!v.review);quotes+=Number(v.evidenceMatches.length>0&&v.evidenceMatches.every(Boolean));failures+=Number(!!row.error);}
 return {variant,count:cases.length,categoryCorrect:category,severityCorrect:severity,jointCorrect:joint,structured:structure,exactEvidence:quotes,requestFailures:failures};
});
const summary={model:records[0].model,date:'2026-11-23',productionPrompt:'baseline',totalRequests:records.length,maxTokens:500,temperature:0.1,groups,limitations:'Eight synthetic cases used for prompt development, not an independent final benchmark. Exact label matching; explanatory suffixes count as label failures. Missing and malformed answers remain in the denominator. Quote matches check text only, not reasoning. One response per case per prompt. No automatic score for factual correctness.'};
await writeFile(new URL('summary.json',root),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
