import records from '$lib/content/catalog.json';
import { dev } from '$app/environment';
import translations from '$lib/content/translations.json';
import type {Language} from '$lib/series/i18n';
export type Post = {slug:string;title:string;summary:string;order:number;group:string;criterion?:string;level?:string;version:string;status:string;body:string;prompt:string;sourceHash:string;approvalHash:string|null;publishedAt:string|null;reviewedAt:string|null;firstPublishedAt:string|null;updatedAt:string;source:string};
export const catalog = records as Post[];
export type LocalizedPost = Post & {lang?:Language;translationSourceHash?:string;translationStale?:boolean;hasContent?:boolean;reviewReady?:boolean};
export function catalogFor(lang:Language):LocalizedPost[]{return lang==='ko'?catalog:(translations[lang] as LocalizedPost[]);}
export function hasBody(p:LocalizedPost){return !!p.body.trim()&&!!p.prompt.trim()&&!p.translationStale;}
export function isVisible(p:LocalizedPost,preview:boolean){return hasBody(p)&&((preview&&p.reviewReady!==false)||canPublish(p));}
export const SERIES_VERSION=catalog.find(p=>p.group==='intro')?.version??'0.1.0';
export const loopback = (url: URL) => ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
export const isPreview = (url: URL) => dev && loopback(url);
export const canPublish = (p:Pick<Post,'status'|'sourceHash'|'approvalHash'|'publishedAt'|'reviewedAt'> & {translationStale?:boolean}) => {const publication=Date.parse(p.publishedAt??''),review=Date.parse(p.reviewedAt??'');return !p.translationStale && p.status==='published' && /^[a-f0-9]{64}$/.test(p.sourceHash) && p.sourceHash===p.approvalHash && Number.isFinite(publication) && Number.isFinite(review) && review<=publication && publication<=Date.now();};
export const bundleReady=()=>catalog.length>0&&catalog.every(canPublish);
export function bundle(preview=false){const posts=catalog.filter(p=>preview||canPublish(p));return '# Web accessibility — 평가 프롬프트 모음집\n\n김장욱 / jangwook.net\n버전 '+SERIES_VERSION+' / 2026-10-01\n'+(preview?'로컬 편집 초안. 모델 성능 검증과 발행 승인 전 자료입니다.\n':'')+'\n## 실행 전 준비\n\n평가할 페이지·상태·이용 목표를 정하고, DOM·접근성 트리·화면·조작 기록을 준비하세요. 각 입력의 수집 시각과 환경을 기록합니다. 개인정보는 입력 전에 제거하세요. 먼저 개요를 읽고 필요한 항목을 선택합니다. 결과는 판단·근거·적용 범위·확인하지 못한 내용을 함께 읽습니다.\n\n'+posts.map(p=>'## '+String(p.order).padStart(2,'0')+'. '+p.title+'\n\n'+p.summary+'\n\n'+p.prompt+'\n\n해설: https://jangwook.net/series/accessibility/'+p.slug+'\n기준: '+p.source+'\n').join('\n---\n\n');}
