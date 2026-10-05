<script lang="ts">
import texts from '$lib/site/copy.json';import {localizedPath,type Language} from '$lib/series/i18n';
let {list,copy=texts.ko.archive,lang='ko'}:{list:any;copy?:string[];lang?:Language}=$props();
</script>
<section class="wrap page-intro"><p class="eyebrow">ARCHIVE</p><h1>{copy[0]}</h1><p class="lead">{copy[1]}</p></section>
<section class="wrap section">
 <form action={localizedPath('/archive',lang)} method="GET" class="archive-search search-tools" role="search" aria-label={copy[2]}><div><label for="archive-query">{copy[3]}</label><input id="archive-query" name="q" type="search" value={list.query} maxlength="200" placeholder={copy[4]}/></div><div><label for="archive-lang">{copy[5]}</label><select id="archive-lang" name="lang" value={list.lang}><option value="all">{copy[6]}</option><option value="ko">한국어</option><option value="en">English</option><option value="ja">日本語</option><option value="zh">中文</option></select></div><button type="submit" class="button">{copy[7]}</button></form>
 <p class="results-count">{list.total} {copy[8]} · {list.page} / {list.pages} {copy[9]}</p>
 <ul class="archive-list">{#each list.posts as p}<li><a href={p.path}><p class="eyebrow"><time datetime={p.publishedAt}>{p.publishedAt.slice(0,10)}</time> · {p.lang.toUpperCase()}</p><h2 lang={p.lang}>{p.title}</h2><p lang={p.lang}>{p.description}</p></a></li>{/each}</ul>
 {#if !list.posts.length}<p class="empty-state">{copy[10]}</p>{/if}
 <nav class="archive-pagination" aria-label={copy[11]}>{#if list.prev}<a class="text-link" href={list.prev}>← {copy[12]}</a>{:else}<span></span>{/if}<span>{list.page} / {list.pages}</span>{#if list.next}<a class="text-link" href={list.next}>{copy[13]} →</a>{:else}<span></span>{/if}</nav>
</section>
