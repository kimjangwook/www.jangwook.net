from pathlib import Path
import json,re,hashlib
r=Path('/Users/jangwook/workspace/www.jangwook.net');d=r/'reports/validation/media-1.2.1-20261004/final-v02';ref=json.loads((d/'reference.json').read_text());manifest=json.loads((d/'input-manifest.json').read_text());cases={x['case_id']:x for x in json.loads((d/'cases.json').read_text())};checks=[]
keys={'criterion','level','prompt_version','scope','input_used','media','errors','unreviewed_media','other_checks','next_checks'}
mkeys={'media_id','classification','classification_evidence_ids','original_version','duration','execution','decision','exception','coverage','alternatives','comparisons','reason','missing_evidence','recommendations'}
ck=lambda label,v:checks.append({'check':label,'pass':bool(v)})
def allowedIDs(c):
 ids=set()
 def scan(x):
  if isinstance(x,dict):
   for k,v in x.items():
    if k=='evidence_id':ids.add(v)
    scan(v)
  elif isinstance(x,list):
   for v in x:scan(v)
 scan(c);return ids
def merged_ranges(ranges):
 intervals=sorted((g['start_seconds'],g['end_seconds']) for g in ranges if isinstance(g,dict) and isinstance(g.get('start_seconds'),(int,float)) and isinstance(g.get('end_seconds'),(int,float)))
 merged=[]
 for a,b in intervals:
  if b<a:return []
  if merged and a<=merged[-1][1]+0.001:merged[-1][1]=max(merged[-1][1],b)
  else:merged.append([a,b])
 return merged
rows=[]
for f in sorted((d/'outputs').glob('*-result.json')):
 x=json.loads(f.read_text());name=f.stem.removesuffix('-result');id=next((k for k in cases if '-'+k+'-' in name),None)
 if not id:continue
 c=cases[id];allowed=allowedIDs(c);row={'run':name,'case':id,'decision':x.get('scope',{}).get('decision'),'expected':ref['decisions'][id]};start=len(checks)
 ck(name+' required schema',set(x)==keys);ck(name+' criterion/version',x.get('criterion')=='1.2.1' and x.get('level')=='A' and x.get('prompt_version')=='0.2.0');ck(name+' scope decision',row['decision']==row['expected']);ck(name+' scope execution',x.get('scope',{}).get('execution') in ref['executions'][id]);ck(name+' media inventory',{m['media_id'] for m in x.get('media',[])}=={m['media_id'] for m in c['media_inventory']['items']})
 for m in x.get('media',[]):
  ck(name+' '+m['media_id']+' schema',set(m)==mkeys);ck(name+' '+m['media_id']+' individual decision',m.get('decision')==ref['decisions'][id]);ck(name+' '+m['media_id']+' reason',bool(m.get('reason')))
  for field in ['processed_ranges','unreviewed_ranges']:
   ranges=m.get('coverage',{}).get(field,[])
   ck(name+' '+field+' typed ranges',all(isinstance(g,dict) and set(g)=={'start_seconds','end_seconds','evidence_ids','reason'} and all(g[k] is None or isinstance(g[k],(int,float)) for k in ['start_seconds','end_seconds']) and bool(g.get('reason')) for g in ranges))
  if id=='K03':
   pr=m['coverage']['processed_ranges'];ur=m['coverage']['unreviewed_ranges'];expected=ref['additional_contract']['K03_confirmed_ranges'];gap=ref['additional_contract']['K03_unreviewed_range']
   ck(name+' conservative intersection boundaries',len(pr)==2 and all(isinstance(g,dict) and abs(g.get('start_seconds',-999)-a)<0.001 and abs(g.get('end_seconds',-999)-b)<0.001 for g,(a,b) in zip(pr,expected)))
   merged=merged_ranges(ur);ck(name+' full actual middle gap',len(merged)==1 and abs(merged[0][0]-gap[0])<0.001 and abs(merged[0][1]-gap[1])<0.001)
  if id=='K91':ck(name+' audio alternative excluded from original coverage',all(isinstance(g,dict) and (g.get('end_seconds') is None or g['end_seconds']<=20) for g in m['coverage']['processed_ranges']))
  if id=='K03':ck(name+' unreviewed ranges preserved',bool(m.get('coverage',{}).get('unreviewed_ranges')) and m.get('coverage',{}).get('complete') is False and bool(m.get('missing_evidence')))
  if id=='K79':ck(name+' decode failure recorded',m.get('execution')=='error' and bool(x.get('errors')) and bool(m.get('missing_evidence')) and not m.get('comparisons'))
  if id=='K34':ck(name+' actual exception verified',m.get('exception',{}).get('verified') is True and m['exception'].get('no_extra_information') is True and m['exception'].get('clearly_labeled') is True)
  if id=='K56':ck(name+' false exception rejected',m.get('exception',{}).get('verified') is False and m['exception'].get('no_extra_information') is False)
  if id=='K91':ck(name+' audio alone accepted',any(a.get('kind')=='audio' and a.get('actually_observed') for a in m.get('alternatives',[])))
  if id in ['K08','K25','K56']:
   bad=[v for v in m.get('comparisons',[]) if v.get('relation') in ['missing','inaccurate']];ck(name+' localized deficiency',bool(bad) and all(v.get('original_location') and v.get('evidence_ids') and v.get('user_impact') for v in bad));ck(name+' actionable retest',bool(m.get('recommendations')) and all(v.get('change') and v.get('retest') for v in m['recommendations']))
 used=[]
 def scanUsed(v):
  if isinstance(v,dict):
   for k,w in v.items():
    if k in ['classification_evidence_ids','evidence_ids','relation_evidence_ids'] and isinstance(w,list):used.extend(w)
    elif k=='evidence_id' and isinstance(w,str):used.append(w)
    scanUsed(w)
  elif isinstance(v,list):
   for w in v:scanUsed(w)
 scanUsed(x);ck(name+' real evidence IDs',set(used).issubset(allowed))
 # Actual model receipts checked separately for Sol; Claude identity must be UI-observed.
 rf=d/'outputs'/f'{name}-receipt.json'
 if rf.exists():
  rr=json.loads(rf.read_text());ck(name+' requested and returned model',rr.get('model_returned')=='gpt-6.1-sol' and rr.get('status')=='completed');ck(name+' fixed input hash',rr.get('input_sha256')==next(i['input_sha256'] for i in manifest['inputs'] if i['id']==id))
 row['checks_passed']=sum(k['pass'] for k in checks[start:]);row['checks_total']=len(checks)-start;row['all_checks_passed']=all(k['pass'] for k in checks[start:]);rows.append(row)
result={'reference_sha256':hashlib.sha256((d/'reference.json').read_bytes()).hexdigest(),'runs':rows,'checks':checks,'pass_count':sum(c['pass'] for c in checks),'total':len(checks),'all_completed_checks_passed':all(c['pass'] for c in checks),'manual_semantic_and_no_fabrication_review':'pending','overview_review':'pending'};(d/'contract-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({'runs':rows,'failed_checks':[x for x in checks if not x['pass']]},ensure_ascii=False,indent=2))
