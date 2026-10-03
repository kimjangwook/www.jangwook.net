<script lang="ts">
import {onMount} from 'svelte';
let {lang='ko'}=$props<{lang?:string}>();
onMount(()=>{
 const labels:Record<string,{show:string;hide:string;loading:string;failure:string;diagram:string}>={ko:{show:'다이어그램 보기',hide:'다이어그램 닫기',loading:'그림을 준비하고 있습니다…',failure:'그림을 표시하지 못했습니다. 아래 원문을 확인하세요.',diagram:'다이어그램'},en:{show:'Show diagram',hide:'Hide diagram',loading:'Preparing diagram…',failure:'Could not display the diagram. The original source is available below.',diagram:'Diagram'},ja:{show:'図を表示',hide:'図を閉じる',loading:'図を準備しています…',failure:'図を表示できませんでした。下の原文をご確認ください。',diagram:'図'},zh:{show:'显示图表',hide:'关闭图表',loading:'正在准备图表…',failure:'无法显示图表。请查看下方原文。',diagram:'图表'}};
 const text=labels[lang]??labels.ko;
 const cleanup:(()=>void)[]=[];let alive=true;
 document.querySelectorAll<HTMLElement>('.archive-article .prose pre:has(code.language-mermaid)').forEach((pre,index)=>{
  const source=pre.querySelector('code')?.textContent??'';
  const button=document.createElement('button');button.type='button';button.className='diagram-toggle';button.textContent=text.show;button.setAttribute('aria-expanded','false');
  const figure=document.createElement('figure');figure.id='archive-diagram-'+index;figure.className='archive-diagram';figure.hidden=true;button.setAttribute('aria-controls',figure.id);
  const caption=document.createElement('figcaption');let previous:Element|null=pre.previousElementSibling;while(previous&&!/^H[2-6]$/.test(previous.tagName))previous=previous.previousElementSibling;caption.textContent=(previous?.textContent?.trim()?previous.textContent.trim()+' · ':'')+text.diagram;pre.id='archive-diagram-source-'+index;figure.appendChild(caption);
  const feedback=document.createElement('p');feedback.className='diagram-feedback';feedback.setAttribute('role','status');
  for(const node of [button,feedback,figure])pre.parentNode?.insertBefore(node,pre);let rendered=false;
  const show=async()=>{
   if(rendered){figure.hidden=!figure.hidden;button.textContent=figure.hidden?text.show:text.hide;button.setAttribute('aria-expanded',String(!figure.hidden));return;}
   button.disabled=true;feedback.textContent=text.loading;
   try{
    const {default:mermaid}=await import('mermaid');
    await document.fonts.ready;
    mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',fontFamily:'Noto Sans KR Variable, sans-serif',flowchart:{htmlLabels:false},themeVariables:{primaryColor:'#f1f1ee',primaryTextColor:'#252525',primaryBorderColor:'#858581',lineColor:'#62625e',secondaryColor:'#fafaf8',tertiaryColor:'#f1f1ee'}});
    const {svg}=await mermaid.render('archive-graph-'+crypto.randomUUID(),source);
    if(!alive||!pre.isConnected)return;
    const drawing=document.createElement('div');drawing.innerHTML=svg;const image=drawing.querySelector('svg');image?.setAttribute('role','img');image?.setAttribute('aria-label',caption.textContent??text.diagram);image?.setAttribute('aria-describedby',pre.id);figure.insertBefore(drawing,caption);figure.hidden=false;rendered=true;button.textContent=text.hide;button.setAttribute('aria-expanded','true');feedback.textContent='';
   }catch{if(alive)feedback.textContent=text.failure;}finally{if(alive)button.disabled=false;}
  };
  button.addEventListener('click',show);cleanup.push(()=>{button.removeEventListener('click',show);button.remove();figure.remove();feedback.remove();});
 });
 return()=>{alive=false;cleanup.forEach(remove=>remove());};
});
</script>
