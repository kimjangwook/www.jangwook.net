#!/usr/bin/env node
// Cache validator audit.
//
// Answers one question: do this host's ETag / Last-Modified values identify the
// *content* of a URL, or merely the *deploy* that shipped it? Validators that
// reset on every deploy make conditional requests (If-None-Match /
// If-Modified-Since) impossible to satisfy, so every revisit re-sends the body.
//
//   node scripts/audit-cache-validators.mjs                       # 12 URLs off the live site
//   node scripts/audit-cache-validators.mjs --base=https://x.dev --n=30
//
// Reference: Google Search Central, "Crawling December: HTTP caching"
// https://developers.google.com/search/blog/2024/12/crawling-december-caching

import { readdir } from "node:fs/promises";
import path from "node:path";

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = (arg("base", "https://jangwook.net")).replace(/\/$/, "");
const SAMPLE = Number(arg("n", 12));
const DIST = arg("dist", "dist");

/** Walk dist/ for built pages so the sample reflects real URLs, not guesses. */
async function samplePaths() {
  const found = [];
  const walk = async (dir) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name === "index.html") found.push(full);
    }
  };
  await walk(DIST);
  if (found.length === 0) return ["/", "/robots.txt"];
  const step = Math.max(1, Math.floor(found.length / SAMPLE));
  return found
    .filter((_, i) => i % step === 0)
    .slice(0, SAMPLE)
    .map((f) => "/" + path.relative(DIST, f).replace(/index\.html$/, ""));
}

const rows = [];
for (const p of await samplePaths()) {
  const url = BASE + p;
  const head = await fetch(url, { method: "HEAD", redirect: "follow" });
  const etag = head.headers.get("etag");
  const lastModified = head.headers.get("last-modified");
  if (!etag && !lastModified) {
    rows.push({ p, etag: null, lastModified: null, revalidated: false });
    continue;
  }
  const conditional = await fetch(url, {
    headers: etag
      ? { "If-None-Match": etag }
      : { "If-Modified-Since": lastModified },
    redirect: "follow",
  });
  rows.push({
    p,
    etag,
    lastModified,
    cacheControl: head.headers.get("cache-control"),
    revalidated: conditional.status === 304,
  });
}

const withValidator = rows.filter((r) => r.etag || r.lastModified);
const stamps = new Set(withValidator.map((r) => r.lastModified));
// GitHub Pages, Apache and nginx all default to "<hex mtime>-<hex size>".
// A gzip-negotiated response arrives with the weak marker W/ in front.
const mtimeShaped = withValidator.filter((r) =>
  /^(W\/)?"[0-9a-f]+-[0-9a-f]+"$/.test(r.etag ?? "")
).length;

console.log(`base                 ${BASE}`);
console.log(`urls sampled         ${rows.length}`);
console.log(`sends a validator    ${withValidator.length}/${rows.length}`);
console.log(
  `304 on revalidate    ${withValidator.filter((r) => r.revalidated).length}/${withValidator.length}`
);
console.log(`cache-control        ${withValidator[0]?.cacheControl ?? "(none)"}`);
console.log(
  `distinct Last-Modified values across the sample: ${stamps.size}` +
    (stamps.size <= 1 && withValidator.length > 1
      ? "  <-- one shared timestamp: this is a deploy stamp, not a content date"
      : "")
);
console.log(
  `ETags shaped "<hex>-<hex>" (mtime+size): ${mtimeShaped}/${withValidator.length}` +
    (mtimeShaped === withValidator.length && withValidator.length > 0
      ? "  <-- validators will reset on the next deploy"
      : "")
);

for (const r of rows) {
  console.log(
    `  ${r.revalidated ? "304" : "200"}  ${(r.etag ?? "-").padEnd(22)}  ${r.lastModified ?? "-"}  ${r.p}`
  );
}
