<script lang="ts">
import Arrow from './Arrow.svelte';import {localizedPath} from '$lib/series/i18n';import type {loadInfo} from '$lib/server/site-pages';
let {data}:{data:ReturnType<typeof loadInfo>}=$props();
</script>
<svelte:head><title>{data.seo.title}</title><meta name="description" content={data.description}/><link rel="alternate" hreflang="x-default" href={'https://jangwook.net/'+data.kind}/></svelte:head>
<section class="wrap page-intro" lang={data.lang}><p class="eyebrow">{data.title}</p><h1>{data.heading}</h1><p class="lead">{data.description}</p></section>
<section class="wrap section info-sections" lang={data.lang}>
{#if data.kind==='updates'}<div class="update-list">{#each data.sections as row}<article><time datetime={row[0]}>{row[0]}</time><div><h2>{row[1]}</h2><p>{row[2]}</p>{#if row[0]==='2026-10-05'}<a class="text-link" href={localizedPath('/labs/accessibility/media-alternatives',data.lang)}>{data.labLabel}<Arrow/></a>{/if}</div></article>{/each}</div>
{:else}<div class="prose">{#each data.sections as row}<h2>{row[0]}</h2><p>{row[1]}</p>{/each}<a class="text-link" href={localizedPath('/series/accessibility',data.lang)}>{data.read}<Arrow/></a>{#if data.kind==='privacy'}<p><a href="mailto:me@jangwook.net">me@jangwook.net</a></p>{/if}</div>{/if}
</section>
<style>.info-sections>.prose{max-width:740px}.page-intro h1{max-width:1000px;overflow-wrap:anywhere}</style>
