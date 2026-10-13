from pathlib import Path
import asyncio,json,hashlib,time,sys
sys.path.insert(0,'/Users/jangwook/workspace/life-manager-v2/src')
from lm.gateway.providers.codex import CodexProvider
from lm.gateway.types import ChatRequest,Message
OUT=Path(__file__).parent
src=json.loads((OUT/'translation-input.json').read_text())
async def one(lang,name):
 data=({k:src[k] for k in ['metadata','body','prompt']} if name=='article' else {k:src[k] for k in ['figures','labs','vtt']})
 instruction=f'''Translate the following Korean accessibility teaching material directly into { {'en':'English','ja':'Japanese','zh':'Simplified Chinese'}[lang]}. Return ONLY one JSON object with the same keys/array sizes and structure. No omissions, truncation, summaries, new claims, process histories, or markdown wrapping. This is chapter 05 WCAG 2.2 SC1.2.3. Preserve every condition, exception, limitation, number, evidence claim, checklist ID C01-C12, case ID V01-V12, fake code R7K2-P9M4, links, JSON schema keys and enum literals in the prompt, and input placeholder function. Translate human-readable placeholder descriptions and the prompt's requested output language to the target language. Keep links/HTML structure initially unchanged; importer localizes internal URLs later. All four figures must retain the exact label count/order; adjacent line labels form one sentence, so translate the whole sentence across those lines coherently. English SVG labels must fit compactly in the original boxes; use concise labels preserving negations, meaning and results. Translate title/desc and HTML readable texts; never translate actual HTML syntax. The lab pages are deliberate controlled cases: preserve their omissions, contradictions, reversed chronology and missing code value; do not repair them. V05 does not add scene numbering. V12 public lab still has video; evidence-withheld is a test-input condition. Translate captions.vtt text only and preserve cue IDs, exact timestamps, settings and blank-line structure. For the figures/labs task also add source_notice: one concise target-language sentence explaining that video audio and screen text remain Korean while the page text and captions are translated. This is a localized teaching view; do not claim new model tests for translated copies. Functional prompt version 0.1.1 is retained in technical metadata, but replace the initial 'reader-copyable final instructions' descriptor with a plain target-language criterion descriptor. Do not alter prompt logic. JSON input:\n'''+json.dumps(data,ensure_ascii=False)
 (OUT/f'{lang}-{name}-input.txt').write_text(instruction)
 provider=CodexProvider();start=time.time()
 try:
  result=await provider.chat(ChatRequest(messages=[Message(role='system',content='You are a careful technical translator. Return valid complete JSON only. Preserve evidence boundaries.'),Message(role='user',content=instruction)],model='gpt-6.1-sol',timeout_sec=1200,extra={'reasoning_effort':'medium'}))
  (OUT/f'{lang}-{name}-raw.txt').write_text(result.text)
  parsed=json.loads(result.text);(OUT/f'{lang}-{name}.json').write_text(json.dumps(parsed,ensure_ascii=False,indent=2))
  receipt={'requested_model':'gpt-6.1-sol','returned_model':result.model,'provider':result.provider,'requested_effort':'medium','finish_reason':result.finish_reason,'elapsed_seconds':round(time.time()-start,2),'input_sha256':hashlib.sha256(instruction.encode()).hexdigest(),'output_sha256':hashlib.sha256(result.text.encode()).hexdigest()}
  (OUT/f'{lang}-{name}-receipt.json').write_text(json.dumps(receipt,indent=2));print(lang,name,'complete',flush=True)
 finally: await provider._client.aclose()
async def main():
 await asyncio.gather(*(one(lang,name) for lang in ['en','ja','zh'] for name in ['article','assets']))
asyncio.run(main())
