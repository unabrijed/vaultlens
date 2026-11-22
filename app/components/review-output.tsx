import type {Validation} from '../../lib/review';

// A deliberately small Markdown subset. React escapes all model text; no raw HTML or links execute.
function Inline({text}:{text:string}) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>part.startsWith('**')&&part.endsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part)}</>;
}
export function SafeMarkdown({text}:{text:string}) {
  return <div className="model-markdown">{text.split(/\n\s*\n/).map((block,i)=>{
    const lines=block.split('\n');
    if(lines.every(line=>/^\s*\d+[.)]\s+/.test(line))) return <ol key={i}>{lines.map((line,j)=><li key={j}><Inline text={line.replace(/^\s*\d+[.)]\s+/,'')}/></li>)}</ol>;
    if(lines.every(line=>/^\s*[-*]\s+/.test(line))) return <ul key={i}>{lines.map((line,j)=><li key={j}><Inline text={line.replace(/^\s*[-*]\s+/,'')}/></li>)}</ul>;
    if(/^#{1,6}\s+/.test(block)) return <h4 key={i}><Inline text={block.replace(/^#{1,6}\s+/,'')}/></h4>;
    return <p key={i}><Inline text={block}/></p>;
  })}</div>;
}
export default function ReviewOutput({text,model,validation}:{text:string;model:string;validation?:Validation}) {
 const review=validation?.review;
 return <div className="findings">
  <p className="field-note">Live aligned-model response · Human review required</p>
  {validation?.warnings.length ? <div className="review-warning" role="status"><strong>Review needs attention</strong><ul>{validation.warnings.map(w=><li key={w}>{w}</li>)}</ul></div> : null}
  {review ? <>
   <div className="badges"><span className="mode-badge">{review.category}</span><span className="severity">{review.severity} severity</span></div>
   <h4>Evidence from the report</h4>
   {review.evidence.map((quote,i)=><div className="evidence-item" key={i}><blockquote>{quote}</blockquote><span className="field-note">{validation?.evidenceMatches[i]?'Exact text match':'Not an exact text match'}</span></div>)}
   <h4>Uncertainties</h4>{review.uncertainties.length?<ul>{review.uncertainties.map((s,i)=><li key={i}>{s}</li>)}</ul>:<p>No uncertainties supplied by the model.</p>}
   <h4>What to check next</h4><ol>{review.nextChecks.map((s,i)=><li key={i}>{s}</li>)}</ol>
   <p className="field-note">Text matches verify quotations only. Classification and reasoning can still be wrong.</p>
  </> : <SafeMarkdown text={text}/>}
  <details className="raw-response"><summary>Original model response and model ID</summary><p className="field-note">{model}</p><pre>{text}</pre></details>
 </div>;
}
