from pathlib import Path
import json,hashlib,re,shutil
r=Path('/tmp/jangwook-captions-review-20261009');d=r/'reports/validation/captions-1.2.2-20261009-final';m=json.loads((d/'input-manifest.json').read_text());ref=json.loads((d/'reference.json').read_text());cases={x['case_id']:x for x in json.loads((d/'cases.json').read_text())};sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();cl=Path('/private/tmp/jangwook-a11y-claude-validation-20261003/captions-final-20261009/outputs');rows=[];checks=[]
for round in [1,2,3]:
 for i in m['inputs']:
  for name in ['raw.md','result.json']:
   f=cl/f'r{round}'/f"{i['id']}-{name}"
   if f.exists():shutil.copyfile(f,d/'outputs'/f"claude-{i['id']}-r{round}-{name}")
 receipt=cl/f'r{round}/execution-receipt.json'
 if receipt.exists():shutil.copyfile(receipt,d/'outputs'/f'claude-r{round}-execution-receipt.json')
keys={'criterion','level','prompt_version','scope','evidence_use','media','errors','limits'}
mkeys={'media_id','classification','classification_evidence_ids','execution','decision','reason','exception','caption_delivery','coverage','comparisons','missing_evidence','recommendations'}
scopes={'url_and_state','inventory_complete_within_scope','execution','decision','reason'}
comparison={'original_start_seconds','original_end_seconds','original_content','caption_location','caption_start_seconds','caption_end_seconds','relation','evidence_ids','user_impact'}
def IDs(v):
 found=set()
 if isinstance(v,dict):
  for k,x in v.items():
   if k=='evidence_id' and isinstance(x,str):found.add(x)
   if k in ['evidence_ids','used_evidence_ids','classification_evidence_ids'] and isinstance(x,list):found.update(z for z in x if isinstance(z,str))
   found|=IDs(x)
 elif isinstance(v,list):
  for x in v:found|=IDs(x)
 return found
for f in sorted((d/'outputs').glob('*-result.json')):
 name=f.name.removesuffix('-result.json');parts=name.split('-');model,id,round=parts[0],parts[1],parts[2]
 if id not in cases:continue
 x=json.loads(f.read_text());c=cases[id];allowed=IDs(c);allowed.update(im['id'] for im in next(i for i in m['inputs'] if i['id']==id)['images']);allowed.add('SOURCE-SOUND');allowed.add('ENCODE-LINK');start=len(checks)
 def ck(label,passed):checks.append({'run':name,'check':label,'pass':bool(passed)})
 ck('schema top keys',set(x)==keys);ck('criterion/version',x.get('criterion')=='1.2.2' and x.get('prompt_version')=='0.1.0' and x.get('level')=='A');ck('scope schema',set(x.get('scope',{}))==scopes);ck('reference decision',x.get('scope',{}).get('decision')==ref['expected'][id]);ck('native processing not fabricated',x.get('evidence_use',{}).get('direct_audio_review') is False and x.get('evidence_use',{}).get('direct_continuous_video_review') is False);ck('media inventory',{z.get('media_id') for z in x.get('media',[])}=={z['media_id'] for z in c['media_inventory']});ck('existing evidence IDs',IDs(x)<=allowed)
 for z in x.get('media',[]):
  ck('media schema',set(z)==mkeys);ck('media decision',z.get('decision')==ref['expected'][id]);ck('nonempty reason',bool(z.get('reason')))
  for q in z.get('comparisons',[]):ck('comparison schema',set(q)==comparison)
  if id in ['C01','C07','C08']:ck('complete provided scope',z.get('coverage',{}).get('complete') is True and not z.get('coverage',{}).get('unreviewed_ranges'))
  if id=='C09':ck('both exception conditions verified',z.get('exception',{}).get('verified') is True and z['exception'].get('no_extra_information') is True and z['exception'].get('clearly_labeled') is True)
  if id=='C11':ck('extra info exception rejected',z.get('exception',{}).get('verified') is False and z['exception'].get('no_extra_information') is False)
  if id=='C12':
   ck('incomplete original preserved',z.get('coverage',{}).get('complete') is False and bool(z['coverage'].get('unreviewed_ranges')) and bool(z.get('missing_evidence')))
   ck('no invented original beyond8seconds',all(g.get('end_seconds') is None or g['end_seconds']<=8.001 for g in z['coverage'].get('processed_ranges',[])))
  if id=='C13':ck('execution failure separate',z.get('execution') in ['error','blocked'] and bool(x.get('errors')) and bool(z.get('missing_evidence')))
  if ref['expected'][id]=='fail':
   bad=[a for a in z.get('comparisons',[]) if a.get('relation') in ['missing','inaccurate','timing_mismatch','obscures_information']];ck('localized failure evidence',bool(bad) and all(a.get('evidence_ids') and a.get('user_impact') for a in bad));ck('change and retest',bool(z.get('recommendations')) and all(a.get('change') and a.get('retest') for a in z['recommendations']))
 if model=='sol':
  rr=json.loads((d/'outputs'/f'{name}-receipt.json').read_text());ck('actual exact model',rr.get('model_returned')=='gpt-6.1-sol' and rr.get('status')=='completed');ck('frozen input',rr['input_sha256']==next(i['input_sha256'] for i in m['inputs'] if i['id']==id))
 these=checks[start:];rows.append({'run':name,'model':model,'case_id':id,'round':round,'decision':x.get('scope',{}).get('decision'),'expected':ref['expected'][id],'pass_count':sum(c['pass'] for c in these),'total':len(these),'all_checks_passed':all(c['pass'] for c in these)})
immutable=[]
for i in m['inputs']:
 immutable.append({'id':i['id'],'input':sha(Path(i['input']))==i['input_sha256'],'images':all(sha(Path(im['path']))==im['sha256'] for im in i['images'])})
summary={'reference_sha256':sha(d/'reference.json'),'frozen_reference_intact':sha(d/'reference.json')==m['reference_sha256'],'inputs_immutable':immutable,'runs':rows,'checks':checks,'semantic_review':'pending','overview_review':'pending','execution_context':'Sol stateless request per input; Claude fresh session per repeat, shared batch context within each repeat. No other model outputs or reference answers supplied.'};(d/'contract-checks.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps({'runs':len(rows),'models':{mo:{'completed':sum(z['model']==mo for z in rows),'fully_passed':sum(z['model']==mo and z['all_checks_passed'] for z in rows)} for mo in ['sol','claude']},'failed_checks':[z for z in checks if not z['pass']]},ensure_ascii=False,indent=2))
