<script lang="ts">
import {labels,type Language} from '$lib/series/i18n';
let {links,lang='ko'}:{links:{lang:Language;name:string;path:string;current:boolean}[];lang?:Language}=$props();
</script>
<nav class="language-nav" aria-label={labels[lang].language}>
 {#each links as link}<a data-sveltekit-reload href={link.path} lang={link.lang} hreflang={link.lang} aria-current={link.current?'page':undefined}>{link.name}</a>{/each}
</nav>
