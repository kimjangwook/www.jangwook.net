import asyncio, hashlib, json, time, wave
from pathlib import Path
import httpx
from lm.gateway.api import build_gateway
from lm.gateway.ledger import InMemoryLedger
from lm.gateway.config_schema import RoleRoute, Target
from lm.gateway.providers.gemini import GeminiProvider
from lm.gateway.providers import base
from lm.gateway.types import TtsResponse, Usage

OUT=Path('/Users/jangwook/workspace/www.jangwook.net/reports/video/media-1.2.1-20261005/tts-probe')
OUT.mkdir(parents=True, exist_ok=True)
class Gemini38Probe(GeminiProvider):
    async def tts(self, req):
        # Process-local adapter: installed google-genai 2.20 cannot represent
        # Gemini 3.8 speech_metadata; do not mutate global gateway or routing.
        import base64
        started=time.monotonic()
        payload={'contents':[{'role':'user','parts':[{'text':req.text,'speech_metadata':{'style':req.style}}]}],
                 'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'voiceConfig':{'voice':req.voice}}}}
        async with httpx.AsyncClient(timeout=180) as client:
            for index in range(len(self._keys())):
                key=base.env_key(self._keys(), provider=self.id, rotate_index=index)
                r=await client.post(f'https://generativelanguage.googleapis.com/v1beta/models/{req.model}:generateContent',headers={'x-goog-api-key':key},json=payload)
                if r.status_code==429 and index<len(self._keys())-1: continue
                if r.status_code!=200:
                    raise RuntimeError(f'Gemini probe HTTP {r.status_code}: '+r.json().get('error',{}).get('message','')[:250])
                data=r.json(); part=next(p['inlineData'] for c in data.get('candidates',[]) for p in c['content']['parts'] if 'inlineData' in p)
                raw=base64.b64decode(part['data']); assert raw[:4]==b'RIFF' and raw[8:12]==b'WAVE', part.get('mimeType')
                Path(req.out_path).write_bytes(raw)
                self.actual_model=data.get('modelVersion',req.model); self.output_mime=part.get('mimeType'); self.key_slot=index
                with wave.open(req.out_path) as f: rate=f.getframerate(); assert f.getnframes()>0
                usage=data.get('usageMetadata',{})
                return TtsResponse(model=self.actual_model,provider=self.id,usage=Usage(input_tokens=usage.get('promptTokenCount',0),output_tokens=usage.get('candidatesTokenCount',0)),latency_ms=round((time.monotonic()-started)*1000),path=req.out_path,sample_rate=rate)

async def main():
    gw=await build_gateway(only=['gemini'],ledger=InMemoryLedger())
    adapter=Gemini38Probe();gw.providers['gemini']=adapter
    gw.config.roles['manual-tts-availability']=RoleRoute(capability='tts',primary=Target(provider='gemini',model='gemini-3.8-flash-tts',params={'voice':'Charon'}))
    script='설정에서 보안을 선택합니다. 복구 코드를 새로 발급하면 이전 코드는 더 이상 사용할 수 없습니다. 새 코드를 안전한 곳에 저장하고 발급 완료 화면을 확인합니다.'
    (OUT/'transcript.ko.txt').write_text(script+'\n')
    try:
        r=await gw.tts('manual-tts-availability',script,style='Calm, articulate Korean teaching voice. Read the transcript exactly, without introductory remarks.',lang_hint='ko',out_path=str(OUT/'gemini-3.8-flash-tts-ko.wav'))
        with wave.open(r.path) as w: props={'duration_seconds':w.getnframes()/w.getframerate(),'sample_rate':w.getframerate(),'channels':w.getnchannels(),'sample_width':w.getsampwidth()}
        receipt={'status':'generated','requested_model':'gemini-3.8-flash-tts','actual_model':r.model,'provider':r.provider,'voice':'Charon','mime_type':adapter.output_mime,'latency_ms':r.latency_ms,'sha256':hashlib.sha256(Path(r.path).read_bytes()).hexdigest(),**props,'scope':'Availability probe only; not published, no native narration or subtitle synchronization validation.'}
    except Exception as e:
        receipt={'status':'not_available_in_current_account','requested_model':'gemini-3.8-flash-tts','error_type':type(e).__name__,'error':str(e)[:350]}
    (OUT/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False),flush=True)
    await gw.aclose()
asyncio.run(main())
