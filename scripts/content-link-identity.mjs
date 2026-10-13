// Match the same teaching destination across the site's four language editions.
// External source URLs, queries and fragments remain exact.
export function contentLinkIdentity(value) {
  const url = new URL(value);
  if (url.origin !== 'https://jangwook.net') return value;
  url.pathname = url.pathname
    .replace(/^\/(?:en|ja|zh)(\/series\/)/, '$1')
    .replace(/^(\/labs\/accessibility\/media-alternatives-1-2-3\/)(?:en|ja|zh)(\/)/, '$1ko$2');
  return url.href;
}
