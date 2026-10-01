#!/usr/bin/env python3
"""규칙 1 재계산 — 강제 슬러그를 모델이 실제로 골랐는지 셸이 확인한다.

프롬프트에만 적은 지시는 지켜지지 않았다. 하드 블록·우선순위 0 으로 지정해도
4주 연속 다른 글이 나갔고, 그 사실은 다음 일요일 리포트에서야 보였다.
여기가 그 지시의 집행부다.

규칙 1
  priority-slugs.json 에 14일 이상 대기한 미소비 슬러그가 있으면 그것을 고른다.
  가장 오래 기다린 것이 먼저다.

exit 0  통과 (강제 대상이 없거나, 모델이 올바르게 골랐다)
exit 1  위반 — 파이프라인을 멈춘다

**읽을 수 없으면 닫는다.** 파싱 실패를 통과로 처리하면 게이트가 있으나 마나다.
"""
import argparse
import json
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

FORCE_AFTER_DAYS = 14
# priority-slugs.json 이 이보다 낡으면 신뢰하지 않는다. 주간 잡이 죽어 있는데
# 3주 전 우선순위를 영원히 강제하면, 사람이 이미 포기한 주제에 파이프라인이 갇힌다.
STALE_AFTER_DAYS = 10


def parse_date(s):
    try:
        return datetime.strptime(str(s)[:10], '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None


def priority_of(row):
    """백로그의 priority 는 타입이 섞여 있다.

    411건 중 하나가 문자열 'high' 이고 하나가 null 이다. 숫자로 비교하기 전에
    반드시 통과시켜야 한다 — 안 그러면 게이트가 TypeError 로 죽고, 죽은 게이트는
    exit 1 이라 매일 파이프라인을 멈춘다. 게이트의 버그가 곧 발행 중단이다.

    숫자가 아닌 값은 "우선순위 없음"으로 본다. 강제 소비는 명시적으로 0 을 준
    항목에만 건다.
    """
    v = row.get('priority')
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        return 99
    return v


def field(text, key):
    m = re.search(rf'^{re.escape(key)}:\s*(.+)$', text, re.M)
    return m.group(1).strip() if m else ''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pick', required=True)
    ap.add_argument('--priority', required=True)
    ap.add_argument('--backlog', required=True)
    ap.add_argument('--posts', required=True)
    ap.add_argument('--today', default=None)
    args = ap.parse_args()

    today = parse_date(args.today) if args.today else date.today()
    cutoff = today - timedelta(days=FORCE_AFTER_DAYS)

    pick_path = Path(args.pick)
    if not pick_path.is_file():
        print('check-forced-slug: topic-pick 파일이 없다', file=sys.stderr)
        return 1
    pick = pick_path.read_text(encoding='utf-8')
    picked = field(pick, 'slug')
    source = field(pick, 'pick-source')
    if not picked:
        print('check-forced-slug: topic-pick 에 slug: 가 없다', file=sys.stderr)
        return 1

    # 이미 발행된 슬러그는 강제 대상이 아니다. ko 를 정본으로 본다 —
    # 네 언어는 같은 슬러그로 같이 나가므로 하나만 봐도 된다.
    posts = Path(args.posts)
    published = {p.stem for p in posts.glob('*.md')} if posts.is_dir() else set()

    prio_path = Path(args.priority)
    candidates = []
    # 주간 계약을 신뢰할 수 있는가. 이 값이 폴백 여부를 정한다.
    #
    # ★ "후보가 없다"와 "계약을 못 읽었다"는 다르다. 둘을 같게 두면,
    #   이번 주 계약이 멀쩡히 6건을 지목했는데 그중 14일 넘은 게 없다는 이유로
    #   3개월 묵은 백로그 항목이 강제된다. 모델은 계약만 읽으므로 그걸 절대 못 고르고,
    #   게이트는 매일 exit 1 이 된다 — 게이트 하나가 발행을 통째로 멈춘다.
    contract_ok = False
    if prio_path.is_file():
        try:
            prio = json.loads(prio_path.read_text(encoding='utf-8'))
        except json.JSONDecodeError as e:
            print(f'check-forced-slug: priority-slugs.json 을 읽을 수 없다 — {e}', file=sys.stderr)
            return 1
        week_of = parse_date(prio.get('week_of'))
        if week_of and (today - week_of).days > STALE_AFTER_DAYS:
            print(
                f'check-forced-slug: priority-slugs.json 이 낡았다 '
                f'(week_of {week_of}, {(today - week_of).days}일) — 백로그로 폴백',
                file=sys.stderr,
            )
        else:
            contract_ok = True
            for row in prio.get('slugs', []):
                slug = row.get('slug')
                since = parse_date(row.get('since'))
                if not slug or slug in published:
                    continue
                if since and since <= cutoff:
                    candidates.append((since, slug))

    if not candidates and not contract_ok:
        # 폴백. priority-slugs 가 **없거나 낡았을 때만** 여기 온다.
        try:
            backlog = json.loads(Path(args.backlog).read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError) as e:
            print(f'check-forced-slug: topic-backlog.json 을 읽을 수 없다 — {e}', file=sys.stderr)
            return 1
        rows = backlog.get('topics', backlog) if isinstance(backlog, dict) else backlog
        for row in rows:
            # 6건은 slug 키 자체가 없다. 그건 강제 대상이 될 수 없다.
            if not isinstance(row, dict) or 'slug' not in row:
                continue
            if row.get('status') == 'done' or row['slug'] in published:
                continue
            if priority_of(row) > 0:
                continue
            added = parse_date(row.get('added_at') or row.get('added'))
            if added and added <= cutoff:
                candidates.append((added, row['slug']))

    if not candidates:
        where = '주간 계약' if contract_ok else '백로그 폴백'
        print(f'check-forced-slug: 강제 대상 없음 ({where}) — 통과', file=sys.stderr)
        return 0

    candidates.sort()
    oldest_since, expected = candidates[0]
    waited = (today - oldest_since).days

    if picked == expected:
        if source != 'forced':
            # 슬러그는 맞는데 라벨이 다르다. 통과시키되 남긴다 —
            # 이 표시가 Telegram 의 objection 경로를 탄다.
            print(
                f'check-forced-slug: 슬러그는 맞으나 pick-source 가 '
                f"'{source}' 다 (기대 forced)",
                file=sys.stderr,
            )
        print(f'check-forced-slug: 강제 슬러그 준수 — {expected} ({waited}일 대기)', file=sys.stderr)
        return 0

    print(
        f'check-forced-slug: 규칙 1 위반\n'
        f'  기대 {expected}  ({oldest_since} 부터 {waited}일 대기)\n'
        f'  실제 {picked}  (pick-source: {source or "없음"})\n'
        f'  대기 중인 강제 후보 {len(candidates)}건: '
        + ', '.join(sl for _, sl in candidates[:5]),
        file=sys.stderr,
    )
    return 1


if __name__ == '__main__':
    sys.exit(main())
