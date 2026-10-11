from pathlib import Path
import html,re
S=Path(__file__).resolve().parents[3];C=S/'content/series/accessibility'
slugs=['complete','sound-omitted','speaker-omitted','negation','shifted','transcript-only','open','condensed','text-alternative','unlabeled-text-alternative','extra-information','partial','unavailable-source','no-target']
copy={
'ko':('모든 자막 실습 조건','교육용 사례입니다. 실제 계정이나 코드를 입력하지 않습니다.','글로 돌아가기','모든 실습 조건 보기',['전체 자막','경고음 누락','화자 누락','부정 표현 변경','자막 지연','전체 전사문만 제공','영상에 포함된 자막','의미를 유지한 축약 자막','본문의 매체 대안','매체 대안 표시 누락','영상의 추가 정보','평가용 원본 자료 일부 누락','원본 파일 불러오기 실패','평가 대상 매체 없음']),
'en':('All caption practice conditions','These are educational examples. Do not enter real accounts or codes.','Return to the article','View all practice conditions',['Complete captions','Warning sounds omitted','Speaker identity omitted','Negation reversed','Delayed captions','Transcript only','Burned-in captions','Condensed captions preserving meaning','Media alternative to text','Missing media-alternative label','Additional video information','Partial source evidence','Unavailable source file','No target media']),
'ja':('字幕実習の全条件','教育用の例です。実際のアカウントやコードを入力しないでください。','記事に戻る','すべての実習条件を見る',['完全な字幕','警告音の欠落','話者の欠落','否定表現の反転','字幕の遅延','全文書き起こしのみ','映像に焼き込まれた字幕','意味を保った要約字幕','本文のメディア代替','メディア代替の明示なし','映像だけの追加情報','原資料の一部欠落','原ファイルの読み込み失敗','対象メディアなし']),
'zh':('全部字幕练习条件','这些是教学示例。请勿输入真实账户或代码。','返回文章','查看全部练习条件',['完整字幕','遗漏警告音','遗漏说话者','否定含义颠倒','字幕延迟','仅有完整转录文本','烧录字幕','保留含义的精简字幕','正文的媒体替代','未明确标注媒体替代','视频中的新增信息','原始证据不完整','原始文件无法加载','没有目标媒体'])}
for lang,(title,note,back,all_label,labels) in copy.items():
 base=S/f'static/labs/accessibility/captions/{lang}';base.mkdir(parents=True,exist_ok=True);article=('' if lang=='ko' else '/'+lang)+'/series/accessibility/captions-prerecorded'
 links=''.join('<li><a href="'+slug+'.html">'+html.escape(label)+'</a></li>' for slug,label in zip(slugs,labels))
 raw='<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex, follow"><title>'+title+'</title><style>html{background:#fafaf8;color:#252525;font-family:system-ui,sans-serif}body{max-width:740px;margin:0 auto;padding:24px;line-height:1.8}a{color:inherit;text-underline-offset:3px}li{margin:8px 0}a{display:inline-block;padding:8px 0}</style></head><body><h1>'+title+'</h1><p>'+note+'</p><ol>'+links+'</ol><p><a href="'+article+'">'+back+'</a></p></body></html>'
 (base/'index.html').write_text(raw)
 file=C/(('posts/' if lang=='ko' else 'translations/'+lang+'/posts/')+'captions-prerecorded.md');body=file.read_text();match=re.search(r'<div class="caption-practice">.*?</p></div>',body,re.S);assert match
 new=match[0].replace('</p></div>',' · <a href="/labs/accessibility/captions/'+lang+'/index.html">'+all_label+'</a></p></div>');body=body[:match.start()]+new+body[match.end():];file.write_text(body)
print('Four practice indexes connect all 14 unchanged original or localized conditions.')
