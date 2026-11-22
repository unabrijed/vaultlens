export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({status:'ok',service:'vaultlens-api'},{headers:{'Cache-Control':'no-store'}});
}
