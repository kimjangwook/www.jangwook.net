import {catalog} from '$lib/server/content';
import {archive} from '$lib/server/archive';
import {publishedVariants} from '$lib/server/series-feed';
import {localizedPath,type Language} from '$lib/series/i18n';
const esc=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export const GET=()=>{
 const pages=['/ko/','/en/','/ja/','/zh/','/series','/series/accessibility','/prompts','/about','/archive','/updates',...(['en','ja','zh'] as Language[]).flatMap(l=>['/series','/series/accessibility','/prompts'].map(p=>localizedPath(p,l)))];
 const old=archive.filter(p=>!p.noindex);
 const nodes=pages.map(p=>'<url><loc>https://jangwook.net'+p+'</loc>'+(/^\/(ko|en|ja|zh)\/$/.test(p)?['ko','en','ja','zh'].map(l=>'<xhtml:link rel="alternate" hreflang="'+l+'" href="https://jangwook.net/'+l+'/"/>').join('')+'<xhtml:link rel="alternate" hreflang="x-default" href="https://jangwook.net/"/>':'')+'</url>');
 nodes.push(...catalog.flatMap(p=>publishedVariants(p.slug)).map(({post,path})=>'<url><loc>https://jangwook.net'+path+'</loc><lastmod>'+esc(post.updatedAt)+'</lastmod>'+publishedVariants(post.slug).map(t=>'<xhtml:link rel="alternate" hreflang="'+t.lang+'" href="https://jangwook.net'+t.path+'"/>').join('')+'</url>'));
 nodes.push(...old.map(p=>'<url><loc>https://jangwook.net'+esc(p.path)+'</loc><lastmod>'+esc(p.updatedAt??p.publishedAt)+'</lastmod>'+old.filter(t=>t.slug===p.slug).map(t=>'<xhtml:link rel="alternate" hreflang="'+t.lang+'" href="https://jangwook.net'+esc(t.path)+'"/>').join('')+'</url>'));
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+nodes.join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
