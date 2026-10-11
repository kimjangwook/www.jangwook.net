from pathlib import Path
import json,re,hashlib,html,shutil
ROOT=Path(__file__).resolve().parents[3];CONTENT=ROOT/'content/series/accessibility';OUT=Path(__file__).parent
sha=lambda b:hashlib.sha256(b).hexdigest()
records=[]
for lang in ['en','ja','zh']:
 for c in [3,4]:
  p=OUT/f'{lang}-chapter{c}.json';rv=json.loads((OUT/f'{lang}-chapter{c}-review.json').read_text());d=json.loads(p.read_text())
  if not rv['approved'] and not rv['corrections']:raise ValueError((lang,c,rv))
  for correction in rv['corrections']:
   parts=correction['path'].split('.');obj=d
   for key in parts[:-1]:obj=obj[int(key)] if isinstance(obj,list) else obj[key]
   key=int(parts[-1]) if isinstance(obj,list) else parts[-1];old=correction['old'];assert obj[key].count(old)==1,correction;obj[key]=obj[key].replace(old,correction['new'])
  base=CONTENT/f'translations/{lang}'
  if c==3:
   dest=base/'posts/audio-only-and-video-only-prerecorded.md';s=dest.read_text()
   for fix in d['replacements']:
    assert s.count(fix['old'])==1,(lang,fix['old']);s=s.replace(fix['old'],fix['new'])
   dest.write_text(s)
  else:
   for num,f in d['figures'].items():
    raw=(ROOT/f'static/images/accessibility/captions-prerecorded/ko/{num}.svg').read_text();labels=iter(f['labels'])
    raw=re.sub(r'(<text\b[^>]*>)(.*?)(</text>)',lambda m:m[1]+html.escape(next(labels),quote=False)+m[3],raw)
    try:next(labels);raise ValueError('excess SVG label')
    except StopIteration:pass
    raw=re.sub(r'(<title[^>]*>).*?(</title>)',lambda m:m[1]+html.escape(f['title'],quote=False)+m[2],raw)
    raw=re.sub(r'(<desc[^>]*>).*?(</desc>)',lambda m:m[1]+html.escape(f['desc'],quote=False)+m[2],raw).replace('<svg xmlns=',f'<svg lang="{lang}" xml:lang="{lang}" xmlns=')
    name=f'{num}-{sha(raw.encode())[:12]}.svg';asset=ROOT/f'static/images/accessibility/captions-prerecorded/{lang}/{name}';asset.parent.mkdir(parents=True,exist_ok=True);asset.write_text(raw);d['body']=d['body'].replace(f'/images/accessibility/captions-prerecorded/ko/{num}.svg',f'/images/accessibility/captions-prerecorded/{lang}/{name}')
   d['body']=d['body'].replace('/labs/accessibility/captions/ko/',f'/labs/accessibility/captions/{lang}/')
   # Same-language internal navigation is localized by the server for absolute URLs;
   # relative URLs are localized here. External W3C and evidence links are untouched.
   d['body']=re.sub(r'(?<=[("\'])/series/',f'/{lang}/series/',d['body'])
   (base/'posts/captions-prerecorded.md').write_text(d['body'].strip()+'\n');(base/'prompts/captions-prerecorded.md').write_text(d['prompt'].strip()+'\n')
   dest=ROOT/f'static/labs/accessibility/captions/{lang}';dest.mkdir(parents=True,exist_ok=True)
   for name,strings in d['labs'].items():
    source=(ROOT/f'static/labs/accessibility/captions/ko/{name}').read_text();parts=re.split(r'(<style>.*?</style>)',source);texts=iter(strings['texts'])
    for i,part in enumerate(parts):
     if part.startswith('<style>'):continue
     parts[i]=re.sub(r'>([^<>]+)<',lambda m:'>'+html.escape(next(texts),quote=False)+'<' if m[1].strip() else m[0],part)
    try:next(texts);raise ValueError('excess lab text')
    except StopIteration:pass
    raw=''.join(parts);aria=iter(strings['aria']);raw=re.sub(r'aria-label="([^"]+)"',lambda m:'aria-label="'+html.escape(next(aria),quote=True)+'"',raw)
    raw=raw.replace('<html lang="ko">',f'<html lang="{lang}">').replace('srclang="ko"',f'srclang="{lang}"')
    label={'en':'English captions','ja':'日本語字幕','zh':'简体中文字幕'}[lang];raw=raw.replace('label="한국어 자막"',f'label="{label}"')
    for media in ['compatible.mp4','open.mp4']:raw=raw.replace(f'src="{media}"',f'src="/labs/accessibility/captions/ko/{media}"')
    # Missing original file remains deliberately missing for the failure example.
    raw=raw.replace('<body>','<body><p class="source-notice">'+html.escape(d['source_notice'])+'</p>');(dest/name).write_text(raw)
   for name,vtt in d['vtts'].items():
    original=(ROOT/f'static/labs/accessibility/captions/ko/{name}').read_text();assert re.findall(r'^.*-->.*$',original,re.M)==re.findall(r'^.*-->.*$',vtt,re.M),(lang,name)
    assert re.findall(r'^A\d+$',original,re.M)==re.findall(r'^A\d+$',vtt,re.M),(lang,name)
    (dest/name).write_text(vtt.strip()+'\n')
   entries=json.loads((base/'manifest.json').read_text());entry=next(x for x in entries if x['slug']=='captions-prerecorded');entry.update(title=d['title'],summary=d['summary'],hasContent=True,reviewReady=True)
   (base/'manifest.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n')
  (OUT/f'{lang}-chapter{c}-imported.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
  records.append({'lang':lang,'chapter':c,'review':rv,'model_receipt':json.loads((OUT/f'{lang}-chapter{c}-receipt.json').read_text())})
(OUT/'import-receipt.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Imported six reviewed translations; original media and source prompts preserved.')
