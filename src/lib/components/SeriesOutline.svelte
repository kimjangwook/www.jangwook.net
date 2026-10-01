<script lang="ts">
import {labels,localizedPath,type Language} from '$lib/series/i18n';
type Chapter={slug:string;title:string;order:number;group:string;published:boolean};
let {chapters,current,lang}:{chapters:Chapter[];current:string;lang:Language}=$props();
let ui=$derived(labels[lang]);let position=$derived(chapters.find(p=>p.slug===current)?.order??0);
let groups=$derived(['intro','1','2','3','4','outro'].map((id,i)=>({id,name:ui.groups[i],posts:chapters.filter(p=>p.group===id)})));
function revealCurrent(event:Event){const details=event.currentTarget as HTMLDetailsElement;if(!details.open)return;const list=details.querySelector<HTMLElement>('.series-outline-list');const link=list?.querySelector<HTMLElement>('[aria-current="page"]');if(list&&link)list.scrollTop=Math.max(0,link.offsetTop-list.clientHeight/3);}
</script>
<details class="series-outline" ontoggle={revealCurrent}>
 <summary><span>{ui.allChapters}<small>{ui.currentChapter} {position}/{chapters.length}</small></span><span class="outline-chevron" aria-hidden="true">⌄</span></summary>
 <!-- svelte-ignore a11y_no_noninteractive_tabindex (Named, scrollable curriculum supports keyboard scrolling.) -->
 <nav class="series-outline-list" aria-label={ui.seriesNavigation} tabindex="0">
  {#each groups as group}{#if group.posts.length}<section><h2>{group.name}</h2><ol start={group.posts[0].order}>{#each group.posts as chapter}<li class:current={chapter.slug===current}><a href={localizedPath('/series/accessibility/'+chapter.slug,lang)} aria-current={chapter.slug===current?'page':undefined}><span class="outline-number" aria-hidden="true">{String(chapter.order).padStart(2,'0')}</span><span>{chapter.title}<small>{chapter.published?ui.public:ui.planned}</small></span></a></li>{/each}</ol></section>{/if}{/each}
 </nav>
</details>
