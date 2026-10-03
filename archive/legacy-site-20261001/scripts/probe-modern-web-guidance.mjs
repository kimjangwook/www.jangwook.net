import { execFileSync } from 'node:child_process';
const V='0.0.180';
const sets = {
  a11y: ["color contrast ratio for text","skip to main content link","associate a label with a form input",
         "visible focus indicator styling","reflow at 400% zoom without horizontal scroll",
         "minimum target size for touch controls","announce dynamic content to screen readers",
         "accessible data table with headers","keyboard trap in a modal dialog","alt text for decorative images"],
  search: ["add JSON-LD structured data for local business","canonical link tag for duplicate pages",
           "render meta description and title tags","make content crawlable without JavaScript",
           "sitemap and robots.txt for a static site","get cited by AI search answers"],
  ui: ["animate a dialog modal backdrop","sticky table header with position sticky",
       "container query based card layout","view transition between pages",
       "custom styled select dropdown","scroll driven reveal animation"],
};
const out={};
for (const [k, qs] of Object.entries(sets)) {
  out[k]=[];
  for (const q of qs) {
    let r=[];
    try { r = JSON.parse(execFileSync('npx',['-y',`modern-web-guidance@${V}`,'search',q],{encoding:'utf8',maxBuffer:1e8})); } catch(e){ r=[]; }
    out[k].push({q, results: r.map(x=>({id:x.id,cat:x.category,sim:x.similarity,tok:x.tokenCount}))});
  }
}
console.log(JSON.stringify(out,null,1));
