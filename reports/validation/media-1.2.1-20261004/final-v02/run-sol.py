import os,json,time,hashlib,re,asyncio,argparse
from pathlib import Path
from dataclasses import asdict
from dotenv import load_dotenv
from lm.gateway.providers import codex
load_dotenv('/Users/jangwook/workspace/life-manager-v2/.env',override=True)
d=Path('/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004/final-v02');manifest=json.loads((d/'input-manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
original=codex._Assembler
class Assembler(original):
 def __init__(self,*a,**k):super().__init__(*a,**k);self.actual_model=None;self.terminal=None
 def feed(self,e):
  super().feed(e)
  if e.get('type') in ['response.completed','response.incomplete','response.failed']:
   x=e.get('response',{});self.actual_model=x.get('model');self.terminal={k:x.get(k) for k in ['id','model','status','usage','incomplete_details']}
codex._Assembler=Assembler
async def run(i,repeat):
 name=f"sol-{i['id']}-r{repeat}";receiptfile=d/'outputs'/f'{name}-receipt.json'
 if receiptfile.exists() and json.loads(receiptfile.read_text()).get('status')=='completed':print('SKIP',name,flush=True);return
 t=time.time();text=Path(i['input']).read_text();assert sha(text.encode())==i['input_sha256'];receipt={'model_requested':'gpt-6.1-sol','reasoning_effort':'high','case_id':i['id'],'kind':i['kind'],'repeat':repeat,'input_sha256':i['input_sha256'],'prompt_sha256':i['prompt_sha256'],'reference_sha256':manifest['reference_sha256'],'image_hashes':{im['id']:im['sha256'] for im in i['images']},'started_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'status':'running','context':'Fresh stateless Responses request; no other outputs or reference answers supplied.'};receiptfile.write_text(json.dumps(receipt,indent=2));print('START',name,flush=True)
 provider=codex.CodexProvider()
 try:
  content=[{'type':'input_text','text':text}]
  for im in i['images']:
   raw=Path(im['path']).read_bytes();assert sha(raw)==im['sha256'];content += [{'type':'input_text','text':'Actual attachment evidence ID: '+im['id']},*codex.input_image_parts([raw])]
  payload={'model':'gpt-6.1-sol','input':[{'type':'message','role':'user','content':content}],'store':False,'stream':True,'reasoning':{'effort':'high','summary':'auto'}}
  token=await provider._token(model='gpt-6.1-sol');asm=await provider._stream_chat(token,payload,model='gpt-6.1-sol',idle=180,budget=900);output=asm.text;receipt.update(status=asm.status,model_returned=asm.actual_model,finish_reason=asm.finish_reason,usage=asdict(asm.usage));(d/'outputs'/f'{name}-raw.md').write_text(output);(d/'outputs'/f'{name}-response.json').write_text(json.dumps({'terminal':asm.terminal,'output_text':output},ensure_ascii=False,indent=2))
  if i['kind']=='criterion' and asm.status=='completed':
   objects=[];dec=json.JSONDecoder()
   for m in re.finditer(r'\{',output):
    try:o,n=dec.raw_decode(output[m.start():])
    except Exception:continue
    if isinstance(o,dict) and o.get('criterion')=='1.2.1' and 'scope' in o:objects.append(o)
   if objects:(d/'outputs'/f'{name}-result.json').write_text(json.dumps(objects[-1],ensure_ascii=False,indent=2));receipt['decision']=objects[-1].get('scope',{}).get('decision')
   else:receipt.update(status='invalid_output')
 except Exception as e:receipt.update(status='error',error_class=type(e).__name__)
 finally:await provider.aclose()
 receipt['elapsed_seconds']=round(time.time()-t,2);receiptfile.write_text(json.dumps(receipt,ensure_ascii=False,indent=2));print('DONE',name,receipt['status'],receipt.get('model_returned'),receipt.get('decision'),receipt['elapsed_seconds'],flush=True)
async def main():
 ap=argparse.ArgumentParser();ap.add_argument('--repeats',default='1');ap.add_argument('--only',default='');a=ap.parse_args();sem=asyncio.Semaphore(3)
 async def job(i,r):
  async with sem:await run(i,r)
 await asyncio.gather(*(job(i,int(r)) for r in a.repeats.split(',') for i in manifest['inputs'] if not a.only or i['id'] in a.only.split(',')))
if __name__=='__main__':asyncio.run(main())
