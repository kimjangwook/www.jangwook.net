<script lang="ts">
import copy from '$lib/labs/copy.json';import {localizedPath,type Language} from '$lib/series/i18n';
let {lang,caseId='K63'}:{lang:Language;caseId?:'K63'|'K25'}=$props();let ui=$derived(copy[lang]);let name=$derived(ui.names[caseId==='K63'?3:4]);
</script>
<div class="media-lab-embed" data-practice-case={caseId}><iframe src={'/lab-fixtures/media-1.2.1/'+lang+'/'+caseId+'.html'} title={ui.practiceTitle+' — '+caseId+' · '+name} loading="lazy" sandbox="allow-same-origin allow-scripts" referrerpolicy="no-referrer"></iframe><p><a href={'/lab-fixtures/media-1.2.1/'+lang+'/'+caseId+'.html'}>{ui.open} · {caseId}</a> · <a href={'/lab-fixtures/media-1.2.1/original/cases/'+caseId+'/index.html'}>{ui.original} · {caseId}</a> · <a href={localizedPath('/labs/accessibility/media-alternatives/'+caseId,lang)}>{ui.all}</a></p></div>
<style>.media-lab-embed{margin:24px 0}p{font-size:14px;line-height:1.85}iframe{display:block;width:100%;height:660px;border:1px solid var(--rule,#deded9);border-radius:6px;background:#fafaf8}</style>
