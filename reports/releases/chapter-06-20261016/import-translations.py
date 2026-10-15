from pathlib import Path
import json,re,html,shutil,hashlib
r=Path(__file__).resolve().parents[3];o=Path(__file__).parent;src=json.loads((o/'translation-input.json').read_text());slug='captions-live';ko=next(x for x in json.loads((r/'src/lib/content/catalog.json').read_text()) if x['slug']==slug)
for lang in ['en','ja','zh']:
 a=json.loads((o/f'{lang}-article.json').read_text());b=json.loads((o/f'{lang}-assets.json').read_text());base=r/f'content/series/accessibility/translations/{lang}';assert {'metadata','body','prompt'} <= set(a);assert set(b['figures'])==set(src['figures']) and set(b['labs'])==set(src['labs']);assert len(b['script_texts'])==4
 for file,data in b['figures'].items():
  assert [len(x) for x in data['labels']]==[len(x) for x in src['figures'][file]['labels']],(lang,file)
  raw=(r/f'static/images/accessibility/captions-live/ko/{file}').read_text();labels=iter(data['labels'])
  def repl(m):
   lines=next(labels);inner=m[2]
   if '<tspan' in inner:
    it=iter(lines);inner=re.sub(r'(<tspan\b[^>]*>).*?(</tspan>)',lambda z:z[1]+html.escape(next(it),quote=False)+z[2],inner)
   else:assert len(lines)==1;inner=html.escape(lines[0],quote=False)
   return m[1]+inner+m[3]
  raw=re.sub(r'(<text\b[^>]*>)(.*?)(</text>)',repl,raw);raw=re.sub(r'(<title[^>]*>).*?(</title>)',lambda z:z[1]+html.escape(data['title'],quote=False)+z[2],raw);raw=re.sub(r'(<desc[^>]*>).*?(</desc>)',lambda z:z[1]+html.escape(data['desc'],quote=False)+z[2],raw);raw=raw.replace('<svg xmlns=',f'<svg lang="{lang}" xml:lang="{lang}" xmlns=');p=r/f'static/images/accessibility/captions-live/{lang}/{file}';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(raw)
 a['body']=a['body'].replace('/images/accessibility/captions-live/ko/',f'/images/accessibility/captions-live/{lang}/').replace('/labs/accessibility/captions-live/ko/',f'/labs/accessibility/captions-live/{lang}/');a['body']=re.sub(r'(?<=[("\'])/series/',f'/{lang}/series/',a['body']);a['body']=a['body'].replace('https://jangwook.net/series/',f'https://jangwook.net/{lang}/series/')
 for file,data in b['labs'].items():
  assert len(data['texts'])==len(src['labs'][file]['texts']) and len(data['aria'])==len(src['labs'][file]['aria']),(lang,file)
  raw=(r/f'static/labs/accessibility/captions-live/ko/{file}').read_text();parts=re.split(r'(<style>.*?</style>|<script>.*?</script>)',raw);it=iter(data['texts'])
  for i,s in enumerate(parts):
   if s.startswith('<style>') or s.startswith('<script>'):continue
   parts[i]=re.sub(r'>([^<>]+)<',lambda z:'>'+html.escape(next(it),quote=False)+'<' if z[1].strip() else z[0],s)
  assert next(it,None) is None;raw=''.join(parts);aria=iter(data['aria']);raw=re.sub(r'aria-label="[^"]+"',lambda z:'aria-label="'+html.escape(next(aria),quote=True)+'"',raw);assert next(aria,None) is None
  raw=raw.replace('<html lang="ko">',f'<html lang="{lang}">').replace('href="/series/',f'href="/{lang}/series/').replace('src="../../captions/ko/complete.vtt"',f'src="../../captions/{lang}/complete.vtt"').replace('srclang="ko"',f'srclang="{lang}"').replace('label="한국어 자막"','label="'+{'en':'English captions','ja':'日本語字幕','zh':'简体中文字幕'}[lang]+'"')
  if file=='replay.html':raw=raw.replace('<video ', '<p class="small">'+html.escape(b['source_notice'])+'</p><video ',1)
  if file=='generated.html':
   for old,new in zip(src['script_texts'],b['script_texts']):raw=raw.replace("'"+old+"'",json.dumps(new,ensure_ascii=False))
  p=r/f'static/labs/accessibility/captions-live/{lang}/{file}';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(raw)
 for name in ['cases-source.json','results.json']:shutil.copy(r/f'static/labs/accessibility/captions-live/ko/{name}',r/f'static/labs/accessibility/captions-live/{lang}/{name}')
 (base/f'posts/{slug}.md').write_text(a['body'].strip()+'\n');(base/f'prompts/{slug}.md').write_text(a['prompt'].strip()+'\n');entries=json.loads((base/'manifest.json').read_text());e=next(x for x in entries if x['slug']==slug);e.update(title=a['metadata']['title'],summary=a['metadata']['summary'],hasContent=True,translationSourceHash=ko['sourceHash'],status='draft',reviewReady=True,approvalHash=None,reviewedAt=None,publishedAt=None);(base/'manifest.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n');print(lang,'imported')
