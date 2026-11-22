import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url);
const source=await readFile(new URL('../app/components/review-output.tsx',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll('"react/jsx-runtime"',JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href));
const {default:ReviewOutput,SafeMarkdown}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('renders Markdown emphasis and lists while escaping model HTML',()=>{
 const html=renderToStaticMarkup(React.createElement(SafeMarkdown,{text:'**Category:** Oracle\n\n1. Inspect feed\n2. <script>alert(1)</script>'}));
 assert.ok(html.includes('<strong>Category:</strong>'));assert.ok(html.includes('<ol>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
});
test('shows unmatched evidence warning and retains original response',()=>{
 const html=renderToStaticMarkup(React.createElement(ReviewOutput,{text:'original answer',model:'model-test',validation:{review:{category:'Oracle',severity:'High',evidence:['invented quote'],uncertainties:[],nextChecks:['Inspect feed']},warnings:['Some evidence excerpts do not exactly match the report.'],evidenceMatches:[false]}}));
 assert.ok(html.includes('Review needs attention'));assert.ok(html.includes('Not an exact text match'));assert.ok(html.includes('original answer'));assert.ok(html.includes('model-test'));
});
