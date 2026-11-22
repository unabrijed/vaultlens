import {timingSafeEqual} from 'node:crypto';
import {triage} from './nugen.ts';

function authorized(request: Request, expected: string) {
  const provided = request.headers.get('x-vaultlens-token') || '';
  const a = Buffer.from(provided), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a,b);
}

export async function handleTriage(request: Request): Promise<Response> {
  const token = process.env.VAULTLENS_BACKEND_TOKEN;
  if (process.env.VAULTLENS_ROLE === 'backend') {
    if (!token) return Response.json({error:'Backend access is not configured.'},{status:503});
    if (!authorized(request,token)) return Response.json({error:'Unauthorized.'},{status:401});
    return triage(request);
  }
  const backend = process.env.VAULTLENS_BACKEND_URL;
  if (!backend) return triage(request);
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin) return Response.json({error:'Cross-origin requests are not allowed.'},{status:403});
  if (!token) return Response.json({error:'Backend access is not configured.'},{status:503});
  const body=await request.text();
  if(body.length>12000) return Response.json({error:'Report is too long.'},{status:413});
  try {
    const url = new URL('/api/triage',backend);
    if(url.protocol!=='https:') throw new Error('HTTPS required');
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-vaultlens-token':token},body,redirect:'error',cache:'no-store',signal:AbortSignal.any([request.signal,AbortSignal.timeout(55000)])});
    return new Response(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  } catch {
    return Response.json({error:'The review backend is unavailable. Please try again later.'},{status:502});
  }
}
