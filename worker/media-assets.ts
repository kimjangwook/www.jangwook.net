// Small, first-party teaching fixtures only. Keep the original asset bytes intact.
export function isMediaAsset(path: string): boolean {
  return /^\/lab-fixtures\/media-1\.2\.1\/(?:teaching\/(?:ko|en|ja|zh)\.mp4|playback\/silent-guide\.mp4|original\/assets\/[a-z0-9-]+\.(?:mp4|wav))$/.test(path);
}

export async function serveMedia(request: Request, assets: {fetch(request: Request): Promise<Response>}): Promise<Response> {
  if (!['GET', 'HEAD'].includes(request.method)) return assets.fetch(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('Range');
  requestHeaders.delete('If-Range');
  const original = await assets.fetch(new Request(request.url, {method: 'GET', headers: requestHeaders}));
  if (original.status !== 200) return request.method === 'HEAD'
    ? new Response(null, {status: original.status, headers: original.headers}) : original;
  const bytes = await original.arrayBuffer();
  const size = bytes.byteLength;
  const headers = new Headers(original.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(size));
  headers.delete('Content-Encoding');
  const range = request.method === 'GET' ? request.headers.get('Range') : null;
  const ifRange = request.headers.get('If-Range');
  // A mismatching validator means serve the complete current representation.
  if (range && (!ifRange || (ifRange === headers.get('ETag') && !ifRange.startsWith('W/')))) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match && (match[1] || match[2])) {
      const suffix = !match[1];
      const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
      const end = suffix || !match[2] ? size - 1 : Math.min(size - 1, Number(match[2]));
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start || size === 0) {
        headers.set('Content-Range', `bytes */${size}`);
        headers.set('Content-Length', '0');
        return new Response(null, {status: 416, headers});
      }
      headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
      headers.set('Content-Length', String(end - start + 1));
      return new Response(bytes.slice(start, end + 1), {status: 206, headers});
    }
    // Unsupported/multiple ranges may legally be ignored; no invented multipart body.
  }
  return new Response(request.method === 'HEAD' ? null : bytes, {status: 200, headers});
}
