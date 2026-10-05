<script lang="ts">
import ArchiveDiagrams from '$lib/components/ArchiveDiagrams.svelte';
import ArchiveList from '$lib/components/ArchiveList.svelte';
import ArticleSeo from '$lib/components/ArticleSeo.svelte';
import {labels,isLanguage,localizedPath} from '$lib/series/i18n';import copy from '$lib/site/copy.json';
let {data}=$props();let lang=$derived(isLanguage(data.post?.lang??data.seo?.lang??'')?(data.post?.lang??data.seo?.lang) as keyof typeof labels:'ko');let ui=$derived(labels[lang]);let ac=$derived(copy[lang].archive);
const languages:Record<string,string>={ko:'한국어',en:'English',ja:'日本語',zh:'中文'};
</script>
<svelte:head><title>{data.post?data.post.title+' — jangwook.net '+ac[0]:ac[0]+' — jangwook.net'}</title><meta name="description" content={data.post?.description??ac[1]}/></svelte:head>
{#if data.post}
 <ArticleSeo title={data.post.title} description={data.post.description} path={data.post.path} lang={data.post.lang} publishedAt={data.post.publishedAt} updatedAt={data.post.updatedAt} translations={data.translations} image={data.post.hero}/>
 <article class="wrap archive-article" lang={data.post.lang} data-source-sha256={data.post.sourceHash}>
  <a class="text-link" lang={lang} href={localizedPath('/archive',lang)}>← {ac[0]}</a>
  <div class="archive-banner" lang={lang}><p>{ac[1]}</p></div>
  <header class="article-header"><h1>{data.post.title}</h1><p class="article-summary">{data.post.description}</p><div class="article-facts"><span><time datetime={data.post.publishedAt}>{data.post.publishedAt.slice(0,10)}</time></span>{#if data.post.updatedAt}<span lang={lang}>{ui.modifiedDate} <time datetime={data.post.updatedAt}>{data.post.updatedAt.slice(0,10)}</time></span>{/if}</div></header>
  {#if data.post.hero}<img class="archive-hero" src={data.post.hero} alt={data.post.heroAlt} loading="eager" fetchpriority="high"/>{/if}
  {#if data.post.toc.length}<nav class="archive-toc article-toc" lang={lang} aria-label={ui.tocLabel}><p lang={lang}>{ui.toc}</p><ol>{#each data.post.toc as item}<li><a lang={data.post.lang} href={'#'+item.id}>{item.text}</a></li>{/each}</ol></nav>{/if}
  <div class="prose">{@html data.html}</div>{#key data.post.path}<ArchiveDiagrams lang={data.post.lang}/>{/key}
  {#if data.translations.length}<nav class="archive-translations" lang={lang} aria-label={ui.language}>{#each data.translations as t}<a href={t.path} hreflang={t.lang} lang={t.lang}>{languages[t.lang]}</a>{/each}</nav>{/if}
  <a class="text-link" lang={lang} href={localizedPath('/archive',lang)}>{ac[0]}</a>
 </article>
{:else if data.list}<ArchiveList list={data.list} copy={ac} {lang}/>{/if}
