<script lang="ts">
import '../app.css';import {page} from '$app/state';import Seo from '$lib/components/Seo.svelte';import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';import {labels,isLanguage,seriesLanguage,localizedPath} from '$lib/series/i18n';
let {children,data}=$props();let lang=$derived(isLanguage(page.data.seo?.lang??'')?page.data.seo!.lang as keyof typeof labels:seriesLanguage(page.url.pathname));$effect(()=>{document.documentElement.lang=lang;});let ui=$derived(labels[lang]);
</script>
<svelte:head><meta name="theme-color" content="#fafaf8"/></svelte:head><Seo/>
<a class="skip-link" href="#main">{ui.skip}</a>
<header class="site-header" lang={lang}>
 <a class="brand" href={localizedPath('/',lang)} aria-label={'jangwook.net '+ui.home}>jangwook.net</a>
 <nav aria-label={ui.menu}><a href={localizedPath('/series',lang)} aria-current={page.url.pathname.includes('/series')?'page':undefined}>{ui.series}</a><a href={localizedPath('/prompts',lang)} aria-current={page.url.pathname.endsWith('/prompts')?'page':undefined}>{ui.prompts}</a><a href={localizedPath('/about',lang)}>{ui.about}</a></nav>

</header>
{#if data.preview}<div class="review-strip" lang={lang}>{ui.review} <span>{ui.reviewNote}</span></div>{/if}
{#if page.data.languageLinks}<LanguageSwitcher links={page.data.languageLinks} {lang}/>{/if}
<main id="main" tabindex="-1">{@render children()}</main>
<footer class="site-footer" lang={lang}><div class="footer-bottom"><span>© 2026 jangwook.net</span><div><a href={localizedPath('/archive',lang)}>{ui.archive}</a><a href={localizedPath('/updates',lang)}>{ui.updates}</a><a href={localizedPath('/privacy',lang)}>{ui.privacy}</a>{#if data.preview}<a href="/dev/inbox">{ui.inbox}</a>{/if}</div></div></footer>
