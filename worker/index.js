// 정적 자산 앞단의 얇은 라우팅 레이어.
// 자산에 매칭되는 요청은 이 워커를 거치지 않고 엣지에서 바로 서빙되고,
// 매칭되지 않는 요청만 여기로 떨어진다 (run_worker_first 미사용).
const MEDIAVINE_ADSTXT =
	'https://adstxt.journeymv.com/sites/b87a8865-5f57-423f-81d5-36dd4700eafe/ads.txt';

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Mediavine 권장 방식: ads.txt는 Mediavine 호스팅본으로 301.
		// 파트너 목록이 바뀌어도 빌드 없이 항상 최신이 서빙된다.
		if (url.pathname === '/ads.txt') {
			return Response.redirect(MEDIAVINE_ADSTXT, 301);
		}

		// 그 외(존재하지 않는 경로)는 자산 핸들러로 위임 → 404 페이지
		return env.ASSETS.fetch(request);
	},
};
