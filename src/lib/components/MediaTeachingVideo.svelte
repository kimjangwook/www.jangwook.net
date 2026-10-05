<script lang="ts">
import copy from '$lib/labs/copy.json';import type {Language} from '$lib/series/i18n';
let {lang}:{lang:Language}=$props();let ui=$derived(copy[lang]);let source=$derived('/lab-fixtures/media-1.2.1/teaching/'+lang+'.mp4');
</script>
<section class="teaching-video" aria-labelledby="teaching-video-heading"><h2 id="teaching-video-heading">{ui.teachingTitle}</h2><p>{ui.teachingNote}</p><video controls muted preload="metadata" playsinline poster={'/lab-fixtures/media-1.2.1/teaching/'+lang+'.jpg'} aria-label={ui.teachingTitle} aria-describedby="teaching-video-alternative" src={source}></video><p><a href={source}>{ui.teachingOpen}</a></p><div id="teaching-video-alternative"><h3>{ui.teachingAlternative}</h3><ol>{#each ui.steps as step}<li>{step}</li>{/each}</ol></div></section>
<style>.teaching-video{padding:28px 0;border-top:1px solid var(--rule)}h2{font-size:24px;margin-bottom:16px}h3{font-size:18px;margin-top:24px}p,li{line-height:1.85}p{margin:16px 0}video{display:block;width:100%;height:auto;border:1px solid var(--rule);border-radius:6px}ol{padding-left:24px}li{margin:12px 0}a{text-decoration:underline;text-underline-offset:5px}</style>
