import fs from 'node:fs';
import crypto from 'node:crypto';
// Editable, deterministic educational diagrams. No generated measurements.
const dir='static/images/series/accessibility/overview';
fs.mkdirSync(dir,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=32,weight=400,color='#252525')=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`;
const box=(x,y,w,h,fill='#fff')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#b7bcb7" stroke-width="2"/>`;
const arrow=(x,y,x2,y2)=>`<path d="M${x} ${y} L${x2} ${y2}" fill="none" stroke="#52645b" stroke-width="3" marker-end="url(#arrow)"/>`;
const card=(y,num,title,sub)=>box(64,y,712,108)+text(90,y+43,num,28,600,'#52645b')+text(150,y+44,title,34,600)+text(150,y+82,sub,27,400,'#535953');
const head=(num,title,sub)=>text(48,52,`FIG. ${num} / WCAG 2.2`,24,600,'#52645b')+text(48,108,title,40,650)+text(48,153,sub,28,400,'#535953');
const wrap=(title,desc,height,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${height}" viewBox="0 0 840 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#52645b" stroke-width="1.5"/></marker></defs><rect width="840" height="${height}" rx="16" fill="#f6f7f3"/><g font-family="'Noto Sans KR Variable','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif">${body}</g></svg>`;
const figures=[];
function save(slug,title,alt,height,body,caption,placement){
 const svg=wrap(title,alt,height,body),hash=crypto.createHash('sha256').update(svg).digest('hex').slice(0,12);
 const filename=`${slug}-${hash}.svg`; fs.writeFileSync(`${dir}/${filename}`,svg);
 figures.push({slug,title,alt,caption,placement,width:840,height,src:`/images/series/accessibility/overview/${filename}`,sha256:crypto.createHash('sha256').update(svg).digest('hex')});
}
save('wcag-structure','WCAG의 구조와 누적 수준','네 원칙 아래 지침, 지침 아래 성공 기준이 있습니다. 예: 인식 가능성, 1.1 텍스트 대안, 1.1.1 비텍스트 콘텐츠. AA 목표는 A와 AA 기준을 함께 포함하며 AAA 목표는 세 수준을 모두 포함합니다.',760,
 head('01','WCAG는 어떻게 읽을까요?','기준의 구조와 목표 수준을 구분합니다.')+
 box(48,187,744,116)+text(72,227,'원칙',30,600)+text(72,276,'인식 가능 · 운용 가능 · 이해 가능 · 견고',32)+arrow(420,308,420,335)+
 box(48,350,744,84)+text(72,402,'지침  예: 1.1 텍스트 대안',32,600)+arrow(420,440,420,464)+
 box(48,478,744,84)+text(72,530,'성공 기준  예: 1.1.1 비텍스트 콘텐츠',32,600)+
 text(48,610,'목표 수준은 누적됩니다',30,600)+
 box(48,636,220,74)+text(72,684,'A',32,600)+box(284,636,244,74,'#e7ede6')+text(306,684,'AA = A + AA',28,600)+box(544,636,248,74)+text(561,684,'AAA = 세 수준',28,600),
 '그림 1. 원칙 → 지침 → 성공 기준으로 요구를 읽습니다. AA 목표에는 A와 AA가 함께 포함됩니다. 수준은 난이도나 문제의 심각도 순위가 아닙니다.',
 '성공 기준 수를 설명한 문단 다음');

let states=head('02','한 URL, 여러 평가 상태','가입 과정의 가상 예시입니다.');
const stateRows=[['01','입력 화면','항목의 이름과 입력 조건을 확인'],['02','약관 팝업','초점 이동 → 내용 확인 → 닫고 복귀'],['03','잘못된 이메일 제출','오류 항목과 수정 안내를 확인'],['04','입력 수정 후 재제출','오류 해소와 다음 단계 이동을 확인'],['05','가입 완료','처리 결과가 전달되는지 확인']];
stateRows.forEach((r,i)=>{const y=190+i*140;states+=card(y,...r);if(i<4)states+=arrow(420,y+114,420,y+132);});
states+=text(64,932,'각 상태의 화면 · DOM · 조작 기록을 남깁니다.',29,500);
save('signup-states','가입 과정의 상태별 평가','입력 화면에서 약관을 열고 닫아 입력을 이어갑니다. 잘못된 이메일을 제출한 오류 상태, 수정 후 재제출, 가입 완료 상태까지 각각 관찰합니다. 한 번의 최초 화면 검사로 이 과정을 확인했다고 할 수 없습니다.',974,states,
 '그림 2. 한 URL에서도 조작에 따라 평가할 상태가 달라집니다. 실제 서비스에서는 분기와 반복을 함께 기록해야 합니다. 이 그림은 오류 수정 경로 하나를 보여 줍니다.',
 '상태 소개와 평가 범위 설명 다음, 상태별 표 앞');

const truck=(x,y)=>`<g transform="translate(${x} ${y})" fill="none" stroke="#52645b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="0" width="160" height="100" rx="8" fill="#e7ede6"/><path d="M160 30 H210 L248 68 V100 H160 M183 40 V69 H235"/><circle cx="48" cy="108" r="19" fill="#f6f7f3"/><circle cx="201" cy="108" r="19" fill="#f6f7f3"/></g>`;
save('image-context','같은 이미지, 다른 대체 정보','A는 배송 안내 문장 옆에 놓인 장식 이미지이며 이동 기능이 없습니다. B는 트럭 이미지만 들어 있는 배송 조회 링크입니다. B의 초점 테두리, 손 모양 포인터와 화살표는 이미지 링크를 선택하면 배송 조회 화면으로 이동함을 나타냅니다. A는 순수 장식인 경우 빈 대체 텍스트를, B는 링크 목적을 전달하는 배송 조회 같은 대체 텍스트를 검토합니다.',954,
 head('03','같은 그림도 목적은 다릅니다','이미지 + 주변 문장 + 기능을 함께 봅니다.')+
 box(48,191,744,292)+text(72,237,'A. 장식 / 이동 기능 없음',33,600)+
 box(72,266,696,142,'#f6f7f3')+`<g transform="translate(96 294) scale(.75)">${truck(0,0)}</g>`+text(328,320,'주문 후 배송을 시작합니다.',29)+text(328,367,'정보는 이 문장으로 전달',29,600)+text(72,451,'검토 예: alt=""',32,600)+
 box(48,511,744,340)+text(72,557,'B. 기능 / 배송 조회로 이동',33,600)+
 box(80,589,256,170)+`<rect x="72" y="581" width="272" height="186" rx="15" fill="none" stroke="#252525" stroke-width="3" stroke-dasharray="8 5"/><g transform="translate(110 615) scale(.75)">${truck(0,0)}</g>`+
 `<g transform="translate(280 696)" fill="#fff" stroke="#252525" stroke-width="3.5" stroke-linejoin="round"><path d="M0 45 V3 Q0 -5 8 -5 Q16 -5 16 3 V23 Q22 18 28 24 Q35 21 42 28 Q49 26 56 34 V58 Q54 78 41 90 H13 L-9 57 Q-15 45 -7 41 Q-3 40 0 45Z"/></g>`+
 arrow(374,677,447,677)+box(470,589,298,170,'#f1f1ee')+text(494,634,'배송 조회',32,600)+text(494,683,'배송 중',28)+`<path d="M499 720 H730" stroke="#858581" stroke-width="3"/><circle cx="515" cy="720" r="7" fill="#252525"/><circle cx="603" cy="720" r="7" fill="#252525"/><circle cx="710" cy="720" r="7" fill="#fff" stroke="#858581" stroke-width="3"/>`+
 text(72,817,'검토 예: alt="배송 조회"',32,600)+
 text(48,909,'모습만 묘사한 “트럭”으로 충분한지 묻습니다.',29,500),
 '그림 3. 교육용 화면 예시입니다. A는 안내 문장이 정보를 모두 제공하는 순수 장식입니다. B는 이미지가 링크의 유일한 콘텐츠이며, 테두리·포인터·화살표는 선택 후 배송 조회 화면으로 이동함을 보여 줍니다. 실제 문맥에 따라 판단합니다.',
 '대체 텍스트 문맥 설명 다음');

let flow=head('04','AI 평가를 증거와 연결하기','이 시리즈에서 탐구할 평가 과정의 설계입니다.');
[['01','범위와 질문 정하기','이용 과정 · 상태 · 성공 기준 · 평가 환경'],['02','증거 수집하기','화면 · DOM · 접근성 트리 · 실제 조작'],['03','도구와 AI로 검토하기','수치 측정 + 문맥 해석 + 상호작용 확인'],['04','근거와 판정을 기록하기','충족 · 미충족 · 해당 없음 · 판단 유보'],['05','수정하고 다시 확인하기','동일한 환경과 상태에서 재현 · 비교']].forEach((r,i)=>{const y=190+i*140;flow+=card(y,...r);if(i<4)flow+=arrow(420,y+114,420,y+132);});
flow+=box(48,917,744,138,'#e7ede6')+text(72,963,'증거 부족 → 수집 단계 보완',31,600)+text(72,1014,'조작 실패 → 실행 상태로 별도 기록',30,500)+text(48,1111,'미실행이나 증거 부족을 “충족”으로 바꾸지 않습니다.',28,500);
save('evidence-workflow','증거 기반 AI 평가 흐름','범위와 질문을 정하고 증거를 수집한 뒤 도구와 AI로 검토합니다. 근거와 판정을 기록하고 수정 후 같은 환경에서 재확인합니다. 증거가 부족하면 수집을 보완하며 조작 실패는 실행 상태로 따로 기록합니다. 이 그림은 구현 완료된 서비스가 아니라 평가 설계입니다.',1152,flow,
 '그림 4. 평가 계획과 실제 판정을 구분하는 흐름입니다. 화면만으로 알 수 없는 동작은 관찰을 추가하고, 증거 부족과 실행 실패를 따로 남깁니다. 서비스 구현 완료를 나타내는 그림은 아닙니다.',
 '수치 측정과 의미 판단의 역할 설명 다음');
fs.writeFileSync('reports/drafts/accessibility-overview-visuals.json',JSON.stringify({method:'Deterministic native SVG; editable source in scripts/create-overview-visuals.mjs',figures},null,2)+'\n');
console.log(JSON.stringify(figures.map(({slug,src})=>({slug,src})),null,2));
