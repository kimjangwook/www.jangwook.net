<script lang="ts">
import MediaTeachingVideo from './MediaTeachingVideo.svelte';
import copy from '$lib/labs/copy.json';import {localizedPath,type Language} from '$lib/series/i18n';
let {lang}:{lang:Language}=$props();let ui=$derived(copy[lang]);
</script>
<MediaTeachingVideo {lang}/><section class="media-lab-embed" aria-labelledby="media-lab-heading"><p class="eyebrow">SC 1.2.1</p><h2 id="media-lab-heading">{ui.title}</h2><p>{ui.lead}</p><iframe src={'/lab-fixtures/media-1.2.1/'+lang+'/K63.html'} title={ui.frame+' — '+ui.names[3]} loading="lazy" sandbox="allow-same-origin allow-scripts" referrerpolicy="no-referrer"></iframe><p><a href={localizedPath('/labs/accessibility/media-alternatives',lang)}>{ui.all}</a> · <a href={'/lab-fixtures/media-1.2.1/'+lang+'/K63.html'}>{ui.open}</a></p><p class="lab-note">{ui.note}</p></section>
<style>.media-lab-embed{padding:32px 0;margin:32px 0;border-top:1px solid var(--rule,#deded9)}h2{font-size:24px}p{line-height:1.85}iframe{width:100%;height:640px;border:1px solid var(--rule,#deded9);border-radius:6px;background:#fafaf8}.lab-note{font-size:14px;color:var(--muted,#62625e)}</style>
