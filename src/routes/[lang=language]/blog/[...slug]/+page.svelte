<script lang="ts">
import ArchiveDiagrams from '$lib/components/ArchiveDiagrams.svelte';
import ArchiveList from '$lib/components/ArchiveList.svelte';
import ArticleSeo from '$lib/components/ArticleSeo.svelte';
let {data}=$props();
const languages:Record<string,string>={ko:'한국어',en:'English',ja:'日本語',zh:'中文'};
</script>
<svelte:head><title>{data.post?data.post.title+' — jangwook.net 아카이브':'아카이브 — jangwook.net'}</title><meta name="description" content={data.post?.description??'기존에 공개한 글을 원래 주소 그대로 보관합니다.'}/></svelte:head>
{#if data.post}
 <ArticleSeo title={data.post.title} description={data.post.description} path={data.post.path} lang={data.post.lang} publishedAt={data.post.publishedAt} updatedAt={data.post.updatedAt} translations={data.translations} image={data.post.hero}/>
 <article class="wrap archive-article" lang={data.post.lang} data-source-sha256={data.post.sourceHash}>
  <a class="text-link" lang="ko" href={'/archive?lang='+data.post.lang}>← 아카이브 목록</a>
  <div class="archive-banner" lang="ko"><p>아카이브에 보관된 글입니다. 작성 당시의 정보이며, 최신 시리즈와 구분해 제공합니다.</p></div>
  <header class="article-header"><h1>{data.post.title}</h1><p class="article-summary">{data.post.description}</p><div class="article-facts"><span><time datetime={data.post.publishedAt}>{data.post.publishedAt.slice(0,10)}</time></span>{#if data.post.updatedAt}<span lang="ko">수정 <time datetime={data.post.updatedAt}>{data.post.updatedAt.slice(0,10)}</time></span>{/if}</div></header>
  {#if data.post.hero}<img class="archive-hero" src={data.post.hero} alt={data.post.heroAlt} loading="eager" fetchpriority="high"/>{/if}
  {#if data.post.toc.length}<nav class="archive-toc article-toc" lang="ko" aria-label="이 글의 목차"><p lang="ko">이 글의 목차</p><ol>{#each data.post.toc as item}<li><a lang={data.post.lang} href={'#'+item.id}>{item.text}</a></li>{/each}</ol></nav>{/if}
  <div class="prose">{@html data.html}</div>{#key data.post.path}<ArchiveDiagrams lang={data.post.lang}/>{/key}
  {#if data.translations.length}<nav class="archive-translations" lang="ko" aria-label="다른 언어로 읽기">{#each data.translations as t}<a href={t.path} hreflang={t.lang} lang={t.lang}>{languages[t.lang]}</a>{/each}</nav>{/if}
  <a class="text-link" lang="ko" href={'/archive?lang='+data.post.lang}>아카이브 목록으로 돌아가기</a>
 </article>
{:else if data.list}<ArchiveList list={data.list}/>{/if}
