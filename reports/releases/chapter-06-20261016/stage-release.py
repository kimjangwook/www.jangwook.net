from pathlib import Path
import json,shutil,hashlib
src=Path('/Users/jangwook/workspace/www.jangwook.net');dst=Path('/private/tmp/jangwook-publish-20261016');slug='captions-live';report=Path('reports/releases/chapter-06-20261016');h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();files=[]
for lang in ['ko','en','ja','zh']:
 base=Path('content/series/accessibility')/('' if lang=='ko' else f'translations/{lang}')
 for kind in ['posts','prompts']:files.append(base/kind/f'{slug}.md')
 target=dst/base/'manifest.json';a=json.loads(target.read_text());b=json.loads((src/base/'manifest.json').read_text());item=next(x for x in b if x['slug']==slug);a=[item if x['slug']==slug else x for x in a];target.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
 for asset in [Path(f'static/images/accessibility/{slug}/{lang}'),Path(f'static/labs/accessibility/{slug}/{lang}')]:
  shutil.copytree(src/asset,dst/asset,dirs_exist_ok=True)
for file in files:(dst/file).parent.mkdir(parents=True,exist_ok=True);shutil.copy(src/file,dst/file)
# These are the only policy changes from the approved writing-stage preference.
for file in ['AGENTS.md','docs/accessibility-production-workflow.md','docs/editorial-guide.md']:
 s=(src/file).read_text();old=(dst/file).read_text();
 # Verify differences separately before this staging script is run.
 shutil.copy(src/file,dst/file)
shutil.copytree(src/report,dst/report,dirs_exist_ok=True)
v=src/'reports/validation/captions-live-1.2.4-20261016';out=dst/report/'validation';out.mkdir(exist_ok=True)
for name in ['test-audit.json','test-input-freeze.json','desktop-execution-receipt.json','sol-high-final-review.json','fable-low-review.json','independent-final-reviews.json','private-reference.json','qualitative-review-notes.json']:shutil.copy(v/name,out/name)
frozen=Path(json.loads((v/'test-input-freeze.json').read_text())['testRoot']);shutil.copytree(frozen,out/'frozen-tests',dirs_exist_ok=True)
draft=src/'reports/drafts/captions-live-20261016'
for name in ['pdf-validation.json','review-status.json','gemini-writing-receipt.json']:shutil.copy(draft/name,out/name)
rec=json.loads((v/'isolated-desktop-launches.json').read_text());(out/'desktop-model-evidence.json').write_text(json.dumps([{'case':x['case'],'repetition':x['run'],'url':x['url'],'model':x['model'],'request_sha256':hashlib.sha256(x['request'].encode()).hexdigest(),'observed_model_medium':'모델: Opus 5.5 중간' in x.get('completed_ui',x['ui'])} for x in rec],ensure_ascii=False,indent=2));print('Staged only chapter06 and writer policy changes; no other source workspace changes copied')
