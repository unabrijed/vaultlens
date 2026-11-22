import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateReview} from '../lib/review.ts';
const report='Assets are locked for seven days. No loss is confirmed.';
const answer={category:'Liquidity',severity:'Medium',evidence:['Assets are locked for seven days.'],uncertainties:['Reserve amount is not supplied.'],nextChecks:['Inspect withdrawal queue size.']};
test('validates exact quotes without declaring semantic correctness',()=>{
 const result=validateReview(JSON.stringify(answer),report);
 assert.deepEqual(result.warnings,[]);assert.deepEqual(result.evidenceMatches,[true]);
});
test('preserves unsupported labels and invented quotes and flags both',()=>{
 const result=validateReview(JSON.stringify({...answer,category:'Systemic collapse',evidence:['Assets are locked for ten days.']}),report);
 assert.equal(result.review.category,'Systemic collapse');assert.equal(result.review.evidence[0],'Assets are locked for ten days.');
 assert.equal(result.warnings.length,2);assert.deepEqual(result.evidenceMatches,[false]);
});
test('rejects malformed shape and extracts legacy labels without relabeling',()=>{
 assert.equal(validateReview('{"category":"Oracle"}',report).review,null);
 const result=validateReview('**Category:** Liquidity Risk\n\n**Provisional Severity:** High',report);
 assert.equal(result.category,'Liquidity Risk');assert.equal(result.severity,'High');assert.equal(result.review,null);assert.ok(result.warnings.length);
});
test('empty evidence and excess next checks are flagged',()=>{
 const result=validateReview(JSON.stringify({...answer,evidence:[],nextChecks:['a','b','c','d']}),report);
 assert.equal(result.warnings.length,2);
});
test('reads five-section Markdown and verifies quotes without altering labels',()=>{
 const text='**Category:** Liquidity\n\n**Provisional Severity:** Medium\n\n**Evidence:** "Assets are locked for seven days."\n\n**Uncertainties:** Reserve amount is not supplied.\n\n**Next Checks:**\n1. Inspect the queue.\n2. Verify the unlock schedule.';
 const result=validateReview(text,report);assert.equal(result.review.category,'Liquidity');assert.deepEqual(result.evidenceMatches,[true]);assert.equal(result.review.nextChecks.length,2);assert.deepEqual(result.warnings,[]);
});
