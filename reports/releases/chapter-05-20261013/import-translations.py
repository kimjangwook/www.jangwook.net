from pathlib import Path
import json,re,hashlib,html,shutil
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).parent;slug='audio-description-or-media-alternative-prerecorded';src=json.loads((OUT/'translation-input.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
for lang in ['en','ja','zh']:
 article=json.loads((OUT/f'{lang}-article.json').read_text());assets=json.loads((OUT/f'{lang}-assets.json').read_text());base=ROOT/f'content/series/accessibility/translations/{lang}'
 assert {'metadata','body','prompt'} <= set(article),(lang,article.keys())
 assert set(assets['labs'])==set(src['labs'])
 for file,data in assets['figures'].items():
  assert len(data['labels'])==len(src['figures'][file]['labels'])
  raw=(ROOT/f'static/images/accessibility/media-alternatives-1-2-3/ko/{file}').read_text();labels=iter(data['labels']);raw=re.sub(r'(<text\b[^>]*>)(.*?)(</text>)',lambda m:m[1]+html.escape(next(labels),quote=False)+m[3],raw)
  raw=re.sub(r'(<title[^>]*>).*?(</title>)',lambda m:m[1]+html.escape(data['title'],quote=False)+m[2],raw);raw=re.sub(r'(<desc[^>]*>).*?(</desc>)',lambda m:m[1]+html.escape(data['desc'],quote=False)+m[2],raw).replace('<svg xmlns=',f'<svg lang="{lang}" xml:lang="{lang}" xmlns=')
  target=ROOT/f'static/images/accessibility/media-alternatives-1-2-3/{lang}/{file}';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(raw);article['body']=article['body'].replace(f'/images/accessibility/media-alternatives-1-2-3/ko/{file}',f'/images/accessibility/media-alternatives-1-2-3/{lang}/{file}')
 article['body']=article['body'].replace('/labs/accessibility/media-alternatives-1-2-3/ko/',f'/labs/accessibility/media-alternatives-1-2-3/{lang}/')
 article['body']=article['body'].replace('https://jangwook.net/series/',f'https://jangwook.net/{lang}/series/')
 # Relative article URLs are localized; external references are retained.
 article['body']=re.sub(r'(?<=[("\'])/series/',f'/{lang}/series/',article['body'])
 (base/f'posts/{slug}.md').write_text(article['body'].strip()+'\n');(base/f'prompts/{slug}.md').write_text(article['prompt'].strip()+'\n')
 for file,data in assets['labs'].items():
  assert len(data['texts'])==len(src['labs'][file]['texts']),(lang,file)
  original=(ROOT/f'static/labs/accessibility/media-alternatives-1-2-3/ko/{file}').read_text();parts=re.split(r'(<style>.*?</style>)',original);texts=iter(data['texts'])
  for i,part in enumerate(parts):
   if part.startswith('<style>'):continue
   parts[i]=re.sub(r'>([^<>]+)<',lambda m:'>'+html.escape(next(texts),quote=False)+'<' if m[1].strip() else m[0],part)
  try:next(texts);raise ValueError('excess lab text')
  except StopIteration:pass
  raw=''.join(parts);aria=iter(data['aria']);raw=re.sub(r'aria-label="([^"]+)"',lambda m:'aria-label="'+html.escape(next(aria),quote=True)+'"',raw)
  raw=raw.replace('<html lang="ko">',f'<html lang="{lang}">').replace('srclang="ko"',f'srclang="{lang}"').replace('label="한국어 자막"',f'label="'+{'en':'English captions','ja':'日本語字幕','zh':'简体中文字幕'}[lang]+'"').replace('src="source.mp4"','src="/labs/accessibility/media-alternatives-1-2-3/ko/source.mp4"')
  raw=raw.replace('<main>','<main><p class="source-notice">'+html.escape(assets['source_notice'])+'</p>');dest=ROOT/f'static/labs/accessibility/media-alternatives-1-2-3/{lang}/{file}';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(raw)
 vtt=assets['vtt'];assert re.findall(r'^.*-->.*$',src['vtt'],re.M)==re.findall(r'^.*-->.*$',vtt,re.M);assert re.findall(r'^(?:A\d|B\d|SFX)$',src['vtt'],re.M)==re.findall(r'^(?:A\d|B\d|SFX)$',vtt,re.M)
 (ROOT/f'static/labs/accessibility/media-alternatives-1-2-3/{lang}/captions.vtt').write_text(vtt.strip()+'\n')
 entries=json.loads((base/'manifest.json').read_text());entry=next(p for p in entries if p['slug']==slug);entry.update(title=article['metadata']['title'],summary=article['metadata']['summary'],hasContent=True,reviewReady=True,status='draft',approvalHash=None,reviewedAt=None,publishedAt=None)
 (base/'manifest.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n');(OUT/f'{lang}-imported.json').write_text(json.dumps(article,ensure_ascii=False,indent=2))
 print(lang,'imported; 4 figures, 14 lab pages, 7 caption cues')
