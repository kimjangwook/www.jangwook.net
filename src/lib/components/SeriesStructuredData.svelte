<script lang="ts">
import {labels,localizedPath,type Language} from '$lib/series/i18n';
let {chapters,lang}:{chapters:{slug:string;title:string;order:number;published:boolean}[];lang:Language}=$props();
let path=$derived('https://jangwook.net'+localizedPath('/series/accessibility',lang));
let graph=$derived({'@context':'https://schema.org','@graph':[
 {'@type':'CreativeWorkSeries','@id':path+'#series',url:path,name:labels[lang].seriesTitle,description:labels[lang].seriesDescription,inLanguage:lang,hasPart:chapters.filter(p=>p.published).map(p=>({'@id':'https://jangwook.net'+localizedPath('/series/accessibility/'+p.slug,lang)+'#article'}))},
 {'@type':'ItemList','@id':path+'#learning-order',name:labels[lang].allChapters,numberOfItems:chapters.length,itemListOrder:'https://schema.org/ItemListOrderAscending',itemListElement:chapters.map(p=>({'@type':'ListItem',position:p.order,item:{'@type':'WebPage','@id':'https://jangwook.net'+localizedPath('/series/accessibility/'+p.slug,lang)+'#webpage',url:'https://jangwook.net'+localizedPath('/series/accessibility/'+p.slug,lang),name:p.title}}))},
 {'@type':'CollectionPage','@id':path+'#webpage',url:path,name:labels[lang].seriesTitle,inLanguage:lang,about:{'@id':path+'#series'},mainEntity:{'@id':path+'#learning-order'}}
]});
</script>
<svelte:head>{@html '<script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,'\u003c')+'</script>'}</svelte:head>
