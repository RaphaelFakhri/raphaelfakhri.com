// Build-stamped version marker. The homepage polls this and reloads itself when the
// id changes, so a fresh deploy shows up without a manual refresh. In CI the id is the
// commit SHA (unique per deploy); locally it falls back to 'dev'.
export const prerender = true;

export function GET() {
  const id = process.env.GITHUB_SHA || 'dev';
  return new Response(JSON.stringify({ id }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
