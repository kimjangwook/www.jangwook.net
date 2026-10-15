from pathlib import Path
import json,hashlib,re
from bs4 import BeautifulSoup
r=Path(__file__).resolve().parents[3];o=Path(__file__).parent;slug='captions-live';root=r/'content/series/accessibility';m=next(x for x in json.loads((root/'manifest.json').read_text()) if x['slug']==slug)
src={'metadata':{k:m[k] for k in ['title','summary']},'body':(root/f'posts/{slug}.md').read_text(),'prompt':(root/f'prompts/{slug}.md').read_text(),'figures':{},'labs':{},'script_texts':['컴퓨터 생성 데모 · 실제 생중계 아님','[알림음]','숫자 화면과 합성 소리',' / 10초']}
for p in sorted((r/'static/images/accessibility/captions-live/ko').glob('*.svg')):
 s=BeautifulSoup(p.read_text(),'html.parser');src['figures'][p.name]={'title':s.title.get_text(),'desc':s.desc.get_text(),'labels':[[x.get_text() for x in t.find_all('tspan')] if t.find('tspan') else [t.get_text()] for t in s.find_all('text')]}
for p in sorted((r/'static/labs/accessibility/captions-live/ko').glob('*.html')):
 s=BeautifulSoup(p.read_text(),'html.parser');src['labs'][p.name]={'texts':[str(t) for t in s.find_all(string=True) if t.parent.name not in ['style','script','[document]'] and str(t).strip()],'aria':[x['aria-label'] for x in s.select('[aria-label]')]}
(o/'translation-input.json').write_text(json.dumps(src,ensure_ascii=False,indent=2));approved=json.loads((r/'reports/drafts/captions-live-20261016/review-status.json').read_text());assert approved['sourceHash']==m['contentRevisionHash'];(o/'user-approval.json').write_text(json.dumps({'instruction':'내용 좋아.4가지 언어 배포해줘.','approved_sourceHash':approved['sourceHash'],'approved_pdf_sha256':approved['pdf_sha256'],'scope':'Four-language publication, commit/push/deployment and established post-deploy English announcement. Approved Korean text and tested prompt unchanged.','review_telegram_message_ids':approved['telegram']['message_ids']},ensure_ascii=False,indent=2));print('Approved Korean packet prepared')
