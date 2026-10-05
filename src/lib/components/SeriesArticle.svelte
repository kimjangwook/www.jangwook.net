<script lang="ts">
import MediaLabEmbed from './MediaLabEmbed.svelte';
import SeriesOutline from './SeriesOutline.svelte';import SeriesStructuredData from './SeriesStructuredData.svelte';
import ArticleSeo from './ArticleSeo.svelte';import Arrow from './Arrow.svelte';import PromptPanel from './PromptPanel.svelte';
import {localizedPath} from '$lib/series/i18n';import type {loadArticle} from '$lib/server/series';
let {data}:{data:ReturnType<typeof loadArticle>}=$props();let ui=$derived(data.ui);let firstPublishedDate=$derived(data.post.firstPublishedAt?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.post.firstPublishedAt)):null);
</script>
<svelte:head><title>{data.post.title} — {ui.seriesTitle}</title><meta name="description" content={data.post.summary}/>{#if data.prepared}<meta name="article-source-sha256" content={data.post.sourceHash}/>{:else}{#each data.languageLinks as link}<link rel="alternate" hreflang={link.lang} href={'https://jangwook.net'+link.path}/>{/each}{/if}</svelte:head>
{#if data.prepared}<ArticleSeo title={data.post.title} description={data.post.summary} path={data.path} lang={data.lang} translations={data.translations} publishedAt={data.post.firstPublishedAt} updatedAt={data.post.updatedAt} seriesPath={localizedPath('/series/accessibility',data.lang)} position={data.post.order}/>{/if}
<SeriesStructuredData chapters={data.chapters} lang={data.lang}/>
<div class="wrap article-shell" lang={data.lang}><article class="article article-layout" data-source-sha256={data.post.sourceHash}>

 <header class="article-header"><p class="eyebrow">CHAPTER {String(data.post.order).padStart(2,'0')} {data.post.criterion?' / WCAG '+data.post.criterion:''}</p><h1>{data.post.title}</h1><p class="article-summary">{data.post.summary}</p><div class="byline">{#if data.post.status==='draft'}<span class="draft-badge">{data.prepared?ui.editorialDraft:ui.planned}</span>{/if}</div><dl class="article-dates"><div><dt>{ui.createdDate}</dt><dd>{#if firstPublishedDate}<time datetime={data.post.firstPublishedAt!}>{firstPublishedDate}</time>{:else}{ui.notPublished}{/if}</dd></div><div><dt>{ui.modifiedDate}</dt><dd><time datetime={data.post.updatedAt}>{data.post.updatedAt}</time></dd></div></dl></header>
 <aside class="article-sidebar" aria-label={ui.seriesNavigation}><a class="text-link" href={localizedPath('/series/accessibility',data.lang)}>{ui.allChapters} <Arrow/></a><p class="eyebrow">SERIES 01</p><p>{ui.seriesTitle}</p><div class="article-facts">{#if data.post.criterion}<span>WCAG {data.post.criterion}</span><span>LEVEL {data.post.level}</span>{/if}<span>{ui.version} {data.post.version}</span><span>{!data.prepared?ui.planned:data.post.status==='draft'?ui.draft:firstPublishedDate}</span></div>
 <SeriesOutline chapters={data.chapters} current={data.post.slug} lang={data.lang}/>
 {#if data.prepared}<nav class="article-toc" aria-label={ui.tocLabel}><p>{ui.toc}</p><ol>{#each data.toc as section}<li><a href={'#'+section.id}>{section.text}</a></li>{/each}</ol></nav><a href="#evaluation-prompt">{ui.evaluationPrompt}</a>{/if}</aside>
 <div class="article-content">
 {#if data.prepared}<div class="prose">{@html data.post.html}</div><div id="evaluation-prompt"><PromptPanel prompt={data.post.prompt} lang={data.lang}/></div>

{:else}<section class="article-preparation" aria-labelledby="preparation-title"><p class="eyebrow">{ui.planned}</p><h2 id="preparation-title">{ui.preparationTitle}</h2><p>{ui.preparationMessage}</p><p>{ui.preparationPrompt}</p><a class="text-link" href={data.post.source}>{ui.sourceStandard} <Arrow/></a><p><a class="text-link" href={localizedPath('/series/accessibility',data.lang)}>{ui.allChapters} <Arrow/></a></p></section>{/if}
 {#if data.post.slug==='audio-only-and-video-only-prerecorded'}<MediaLabEmbed lang={data.lang}/>{/if}
 <nav class="article-pagination" aria-label={ui.pagination}>{#if data.prev}<a href={localizedPath('/series/accessibility/'+data.prev.slug,data.lang)}><small>{ui.previous}</small>{data.prev.title}</a>{/if}{#if data.next}<a href={localizedPath('/series/accessibility/'+data.next.slug,data.lang)}><small>{ui.next}</small>{data.next.title}<Arrow/></a>{/if}</nav>
 </div></article>
</div>
