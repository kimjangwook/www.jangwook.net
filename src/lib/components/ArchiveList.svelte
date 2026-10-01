<script lang="ts">
let {list}=$props();
</script>
<section class="wrap page-intro"><p class="eyebrow">ARCHIVE</p><h1>아카이브</h1><p class="lead">기존에 공개한 글을 원래 주소 그대로 보관합니다.<br/>과거의 글에는 작성 당시의 기술과 관점이 담겨 있습니다.</p></section>
<section class="wrap section">
 <form action="/archive" method="GET" class="archive-search search-tools" role="search" aria-label="아카이브 검색"><div><label for="archive-query">제목과 주제로 찾기</label><input id="archive-query" name="q" type="search" value={list.query} maxlength="200" placeholder="찾고 싶은 글의 제목이나 주제"/></div><div><label for="archive-lang">언어</label><select id="archive-lang" name="lang" value={list.lang}><option value="all">전체 언어</option><option value="ko">한국어</option><option value="en">English</option><option value="ja">日本語</option><option value="zh">中文</option></select></div><button type="submit" class="button">검색</button></form>
 <p class="results-count">{list.total}개 글 · {list.page} / {list.pages} 페이지</p>
 <ul class="archive-list">{#each list.posts as p}<li><a href={p.path}><p class="eyebrow"><time datetime={p.publishedAt}>{p.publishedAt.slice(0,10)}</time> · {p.lang.toUpperCase()}</p><h2 lang={p.lang}>{p.title}</h2><p lang={p.lang}>{p.description}</p></a></li>{/each}</ul>
 {#if !list.posts.length}<p class="empty-state">검색 결과가 없습니다. 다른 제목이나 주제로 찾아보세요.</p>{/if}
 <nav class="archive-pagination" aria-label="아카이브 페이지">{#if list.prev}<a class="text-link" href={list.prev}>← 이전 페이지</a>{:else}<span></span>{/if}<span>{list.page} / {list.pages}</span>{#if list.next}<a class="text-link" href={list.next}>다음 페이지 →</a>{:else}<span></span>{/if}</nav>
</section>
