import {seriesLanguage} from '$lib/series/i18n';
import { isPreview } from '$lib/server/content';
export const ssr = true;
export const prerender = false;
export const trailingSlash = 'ignore';
const metadata:Record<string,[string,string]>={
 '/':['jangwook.net — 웹을 이해하고, 더 나은 경험을 만듭니다','주제별 시리즈로 웹의 기준과 실무 적용 방법을 배웁니다.'],
 '/series':['시리즈 — jangwook.net','접근성에서 시작해 AI와 비즈니스를 위한 웹까지. 주제별 학습과 실행을 연결하는 시리즈.'],
 '/series/accessibility':['웹 접근성 시리즈 — jangwook.net','WCAG 2.2의 모든 활성 기준별 해설, 멀티모달 평가 프롬프트와 에이전트 적용.'],
 '/prompts':['접근성 평가 프롬프트 — jangwook.net','WCAG 기준별 평가 프롬프트와 입력 준비법, 결과 해석.'],
 '/services':['도구와 서비스 — jangwook.net','접근성 점검과 개선을 연결하는 도구와 서비스의 개발 방향.'],
 '/about':['김장욱의 관점 — jangwook.net','웹의 기준을 실무의 판단으로 연결하는 교육·컨설팅 관점과 편집 원칙.'],
 '/privacy':['개인정보 안내 — jangwook.net','자료 전달과 선택적 구독에 사용하는 개인정보 안내.'],
 '/updates':['업데이트 — jangwook.net','시리즈와 프롬프트, 웹사이트의 변경 내역.'],
 '/resources/accessibility':['전체 접근성 프롬프트 받기 — jangwook.net','전체 프롬프트와 입력 자료 준비법, 실행 순서를 받아보세요.']
};
export const load = ({url}:{url:URL}) => {const [title,description]=metadata[url.pathname.replace(/\/$/,'')||'/']??['jangwook.net','Web for AI / Business / Everyone'];return {preview:isPreview(url),seo:{title,description,lang:seriesLanguage(url.pathname)}};};
