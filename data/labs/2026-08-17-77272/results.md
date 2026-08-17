# 2026-08-17-77272

- 파서 버전: urllib.robotparser = CPython 3.12.8 / protego = 0.6.2 / robots-parser = 3.0.1 (99개 raw 파일 전부에 동일하게 기록됨)
- hit = 3회 반복 중 사양 정답(plan.json 의 observe 에 명시)과 일치한 횟수. 33개 셀 모두 3회가 서로 동일한 값이었다 — 셀 내 분산 0
- 33개 셀 × 3회 = 99런, exit code 는 99런 전부 0

## cells

- control-plain/urllib — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · RFC 9309 §2.2.2 "규칙이 매칭되지 않으면 URI 는 허용"
- control-plain/protego — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일
- control-plain/robots-parser — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일 (통제 셀 3개 일치, 하네스 이상 없음)
- empty-specific-group/urllib — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · Google "user agent 전용 그룹과 전역 그룹(*)은 결합되지 않는다" + RFC 9309 §2.2.2 "그룹에 규칙이 없으면 URI 는 허용"
- empty-specific-group/protego — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일
- empty-specific-group/robots-parser — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일. falsifier 셀 3개가 예상대로 전부 ALLOWED — 예상 미기각
- duplicate-groups/urllib — 0/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · RFC 9309 §2.2.1 "같은 user-agent 에 매칭되는 그룹이 둘 이상이면 규칙을 하나의 그룹으로 결합해야 한다(MUST)"
- duplicate-groups/protego — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일
- duplicate-groups/robots-parser — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일
- ua-case-mismatch/urllib — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · RFC 9309 §2.2.1 "크롤러는 대소문자를 가리지 않는 매칭을 써야 한다(MUST)"
- ua-case-mismatch/protego — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일
- ua-case-mismatch/robots-parser — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일 (두 번째 통제 셀 3개 일치)
- longest-match-allow/urllib — 0/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · RFC 9309 §2.2.2 "가장 구체적인 매칭을 써야 한다(MUST). 가장 구체적인 매칭은 옥텟 수가 가장 많은 매칭이다". 2026-08 기존 글의 1건 관측이 3/3 으로 재현됨
- longest-match-allow/protego — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일
- longest-match-allow/robots-parser — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일
- tie-disallow-first/urllib — 0/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · RFC 9309 §2.2.2 "allow 규칙과 disallow 규칙이 동등하면 allow 를 써야 한다(SHOULD)" · Google "충돌하는 규칙에서는 가장 덜 제한적인 규칙을 쓴다"
- tie-disallow-first/protego — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일
- tie-disallow-first/robots-parser — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일
- tie-allow-first/urllib — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일. 규칙 집합은 tie-disallow-first 와 같고 두 줄 순서만 뒤집힌 셀인데 urllib 의 답이 뒤집혔다
- tie-allow-first/protego — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일. tie-disallow-first 와 같은 답
- tie-allow-first/robots-parser — 3/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 ALLOWED · 동일. tie-disallow-first 와 같은 답
- wildcard-dollar/urllib — 0/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · Google "* 는 유효한 문자 0개 이상, $ 는 URL 의 끝을 가리킨다"
- wildcard-dollar/protego — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일
- wildcard-dollar/robots-parser — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일
- full-ua-string/urllib — 0/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · RFC 9309 §2.2.1 "제품 토큰은 User-Agent 헤더의 부분 문자열이어야 한다(SHOULD)"
- full-ua-string/protego — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일. 세 파서 중 유일하게 UA 헤더 전문에서 GPTBot 토큰을 찾아냈다. plan.json 의 예상(셋 다 ALLOWED)을 깬 셀
- full-ua-string/robots-parser — 0/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일. README 는 RFC 9309 준수를 표방하지만 이 셀에서 부분 문자열 매칭을 하지 않는다
- bom-prefix/urllib — 0/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · Google "robots.txt 앞머리의 유니코드 BOM 을 포함해 유효하지 않은 줄을 무시한다"
- bom-prefix/protego — 0/3 hit — RESULT=ALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일. protego 가 사양과 갈린 유일한 셀이고 plan.json 의 예상(urllib 만 ALLOWED)을 깬 셀
- bom-prefix/robots-parser — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED · 동일. 세 파서 중 유일하게 BOM 3바이트를 무시했다
- bare-path-query/urllib — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED
- bare-path-query/protego — 3/3 hit — RESULT=DISALLOWED ×3 — exit 0,0,0 — 사양 DISALLOWED
- bare-path-query/robots-parser — 0/3 hit — RESULT=UNDEFINED ×3 — exit 0,0,0 — 사양 DISALLOWED · README "이 robots.txt 에 유효하지 않은 URL 이면 undefined 를 반환한다" — 문서화된 동작이고 예외나 오류가 아니다
- 합계, 파서별 사양 일치 셀: protego 10/11, robots-parser 9/11, urllib 5/11. 11개 시나리오 전부를 맞힌 파서는 없다
- 합계, 사양 일치: 33셀 중 24셀, 99런 중 72런
- 합계, 세 파서 답이 갈린 시나리오: 11개 중 7개(duplicate-groups, longest-match-allow, tie-disallow-first, wildcard-dollar, full-ua-string, bom-prefix, bare-path-query). 만장일치 4개는 control-plain, empty-specific-group, ua-case-mismatch, tie-allow-first
- 합계, 차단 의도된 URL 에 ALLOWED 를 낸 셀 9개: empty-specific-group ×3, duplicate-groups/urllib, wildcard-dollar/urllib, full-ua-string/urllib, full-ua-string/robots-parser, bom-prefix/urllib, bom-prefix/protego. 여기에 UNDEFINED 1개(bare-path-query/robots-parser)를 더하면 10셀
- 합계, 그 10셀 중 3셀(empty-specific-group)은 세 파서가 모두 사양대로 답한 결과다 — 파서 결함이 아니라 robots.txt 자체의 규정
- 합계, urllib 이 사양과 갈린 6셀 중 4셀(duplicate-groups, wildcard-dollar, full-ua-string, bom-prefix)이 ALLOWED 방향, 2셀(longest-match-allow, tie-disallow-first)이 DISALLOWED 방향

## boundary

- 설계된 경계 tie-disallow-first → tie-allow-first: 규칙 집합이 같고 두 줄의 순서만 뒤집힌 이 축을 넘을 때 urllib 만 DISALLOWED → ALLOWED 로 뒤집혔고(0/3 → 3/3), protego 와 robots-parser 는 양쪽 다 ALLOWED 로 변하지 않았다 — urllib 의 답을 결정하는 것은 규칙 길이가 아니라 파일 줄 번호다.
- 예상 밖 경계 "규칙 해석 → 입력 처리": protego 와 robots-parser 는 규칙 의미론을 묻는 8개 시나리오(control-plain, empty-specific-group, duplicate-groups, ua-case-mismatch, longest-match-allow, tie-disallow-first, tie-allow-first, wildcard-dollar)에서 24/24 셀 사양 일치인데, 입력 층을 건드리는 3개 시나리오(full-ua-string · bom-prefix · bare-path-query)로 축을 넘는 순간 6셀 중 3셀이 어긋났다 — 갈림은 파서 품질 축이 아니라 이 축에서 일어났다.

## quotes

- text: "Crawlers MUST use case-insensitive matching to find the group that matches the product token and then obey the rules of the group.  If there is more than one group matching the user-agent, the matching groups' rules MUST be combined into one group and parsed according to Section 2.2.2."
  url: https://www.rfc-editor.org/rfc/rfc9309.txt
  bears_on: duplicate-groups 와 ua-case-mismatch. 병합 MUST 를 지키지 않은 것은 urllib 뿐이고(ALLOWED 3/3), 대소문자 MUST 는 세 파서가 모두 지켰다.

- text: "To evaluate if access to a URI is allowed, a crawler MUST match the paths in \"allow\" and \"disallow\" rules against the URI.  The matching SHOULD be case sensitive.  The matching MUST start with the first octet of the path.  The most specific match found MUST be used.  The most specific match is the match that has the most octets.  Duplicate rules in a group MAY be deduplicated.  If an \"allow\" rule and a \"disallow\" rule are equivalent, then the \"allow\" rule SHOULD be used.  If no match is found amongst the rules in a group for a matching user-agent or there are no rules in the group, the URI is allowed.  The /robots.txt URI is implicitly allowed."
  url: https://www.rfc-editor.org/rfc/rfc9309.txt
  bears_on: longest-match-allow(최장 일치 MUST), tie-disallow-first·tie-allow-first(동등하면 allow SHOULD), empty-specific-group(그룹에 규칙이 없으면 허용). 마지막 문장이 empty-specific-group 3셀 전부가 ALLOWED 인 이유를 사양 쪽에서 설명한다.

- text: "For example, in the case of HTTP [RFC9110], the product token SHOULD be a substring in the User-Agent header."
  url: https://www.rfc-editor.org/rfc/rfc9309.txt
  bears_on: full-ua-string. 사양은 제품 토큰이 UA 헤더의 부분 문자열이라고 적는데, 이 방향으로 매칭한 파서는 protego 하나뿐이다(DISALLOWED 3/3). urllib 와 robots-parser 는 ALLOWED 3/3.

- text: "Only one group is valid for a particular crawler. Google's crawlers determine the correct group of rules by finding in the robots.txt file the group with the most specific user agent that matches the crawler's user agent. Other groups are ignored."
  url: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  bears_on: empty-specific-group. GPTBot 그룹이 존재하는 순간 전역 그룹의 Disallow: / 가 무시된다.

- text: "If there's more than one specific group declared for a user agent, all the rules from the groups applicable to the specific user agent are combined internally into a single group. User agent specific groups and global groups (*) are not combined."
  url: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  bears_on: empty-specific-group 과 duplicate-groups. 앞 문장이 duplicate-groups 의 정답을, 뒤 문장이 empty-specific-group 의 정답을 각각 규정한다.

- text: "Google ignores invalid lines in robots.txt files, including the Unicode Byte Order Mark (BOM) at the beginning of the robots.txt file, and use only valid lines."
  url: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  bears_on: bom-prefix. BOM 3바이트만 붙였을 때 이 문서대로 답한 파서는 robots-parser 하나뿐이고(DISALLOWED 3/3), urllib 와 protego 는 ALLOWED 3/3.

- text: "* designates 0 or more instances of any valid character. $ designates the end of the URL."
  url: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  bears_on: wildcard-dollar. `Disallow: /*.json$` 을 문자 그대로 접두사 비교한 urllib 만 ALLOWED 3/3.

- text: "When matching robots.txt rules to URLs, crawlers use the most specific rule based on the length of the rule path. In case of conflicting rules, including those with wildcards, Google uses the least restrictive rule."
  url: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  bears_on: tie-disallow-first 와 tie-allow-first. 같은 문서의 표에 동일 사례가 있다 — "https://example.com/folder/page / allow: /folder / disallow: /folder / Applicable rule: allow: /folder, because in case of conflicting rules, Google uses the least restrictive rule."

- text: "This module provides a single class, RobotFileParser, which answers questions about whether or not a particular user agent can fetch a URL on the website that published the robots.txt file. For more details on the structure of robots.txt files, see RFC 9309."
  url: https://docs.python.org/3/library/urllib.robotparser.html
  bears_on: urllib 열 전체. 공식 문서가 RFC 9309 를 가리키지만 11개 시나리오 중 6개에서 그 RFC 와 다른 답을 냈다. 문서 어디에도 최장 일치·와일드카드·그룹 병합 미구현이 적혀 있지 않다.

- text: "Reference specification | Google | Martijn Koster's 1996 draft" (Protego 열은 Google, RobotFileParser 열은 1996 draft) / "Wildcard support | ✓" / "Length-based precedence | ✓"
  url: https://github.com/scrapy/protego/blob/master/README.rst
  bears_on: protego 열. README 의 비교표가 Google 사양을 준거로 삼는다고 적고 와일드카드·길이 기반 우선순위에 체크를 넣는다. 실측은 그 두 항목 모두 일치(wildcard-dollar·longest-match-allow 3/3)했고, 표에 항목이 없는 BOM 처리에서 갈렸다.

- text: "A robots.txt parser which aims to be complaint with the [RFC 9309 specification](https://datatracker.ietf.org/doc/html/rfc9309)."
  url: https://github.com/samclarke/robots-parser/blob/master/README.md
  bears_on: robots-parser 열. RFC 9309 준수를 표방하지만 그 RFC 의 "제품 토큰은 UA 헤더의 부분 문자열" 문장과 full-ua-string 에서 부딪힌다(ALLOWED 3/3).

- text: "Returns true if crawling the specified URL is allowed for the specified user-agent.\n\nThis will return `undefined` if the URL isn't valid for this robots.txt."
  url: https://github.com/samclarke/robots-parser/blob/master/README.md
  bears_on: bare-path-query. UNDEFINED 3/3 은 문서화된 반환값이다 — 버그가 아니라 호출부가 상대 경로를 넘겼을 때의 규정된 동작이고, 세 값(true/false/undefined)을 구분하지 않는 검증 코드에서만 문제가 된다.

- text: "Example user-agent string (the version number may change): Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot"
  url: https://platform.openai.com/docs/bots
  bears_on: full-ua-string. 이 셀이 파서에 넘긴 문자열은 같은 형태의 GPTBot/1.2 판이다(plan.json 작성 시점 값이고, 2026-08-17 현재 문서는 1.4 를 보여준다). 실제 크롤러가 보내는 것은 제품 토큰이 아니라 이 헤더 전문이다.
