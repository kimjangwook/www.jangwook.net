"""Send an explicitly requested accessibility draft or verified publication notice.

Uses the existing personal LifeManager recipient; never prints credentials.
Each attachment has a persistent receipt. Uncertain attempts require reconciliation.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

LM = Path('/Users/jangwook/workspace/life-manager-v2')
sys.path.insert(0, str(LM / 'src'))
from dotenv import load_dotenv
from lm.channels.telegram import TelegramChannel, TelegramConfig


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--packet', type=Path, required=True)
    parser.add_argument('--stage', choices=['draft', 'published'], required=True)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    packet = args.packet.resolve()
    status = json.loads((packet / 'status.json').read_text())
    if args.stage == 'draft':
        artifacts = [packet / status['review_pdf'], packet / status['manuscript_bundle']]
        assert set(status['languages']) == {'ko', 'en', 'ja', 'zh'}
        text = status['telegram_draft_caption']
        assert len(text) <= 1024
    else:
        publication = json.loads((packet / 'publication-verification.json').read_text())
        assert publication['approved'] and publication['productionVerificationPassed']
        assert set(publication['urls']) == {'ko', 'en', 'ja', 'zh'}
        assert publication['content_hashes'] == status['approved_content_hashes']
        import httpx
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as http:
            for lang, url in publication['urls'].items():
                assert url.startswith('https://jangwook.net/')
                response = await http.get(url)
                response.raise_for_status()
                import re
                meta = re.search(r'<meta\b(?=[^>]*\bname=[\"\']article-source-sha256[\"\'])(?=[^>]*\bcontent=[\"\']([^\"\']+)[\"\'])[^>]*>', response.text)
                assert meta and meta.group(1) == publication['content_hashes'][lang]
        artifacts = [None]
        text = '웹 접근성 시리즈 공개 완료\n' + status['title'] + '\n\n' + '\n'.join(f'{k}: {v}' for k, v in publication['urls'].items())
    payloads = []
    for artifact in artifacts:
        if artifact is not None:
            assert artifact.is_file() and artifact.stat().st_size > 0
        digest = hashlib.sha256((artifact.read_bytes() if artifact else b'') + text.encode()).hexdigest()
        payloads.append((artifact, digest))
    if args.dry_run:
        print(json.dumps({'stage': args.stage, 'files': [p.name if p else 'text' for p, _ in payloads], 'sending': False}))
        return
    load_dotenv(LM / '.env')
    conn = sqlite3.connect(Path.home() / '.life-manager-v2/lm.db', isolation_level=None)
    channel = TelegramChannel(TelegramConfig.from_env(), conn=conn)
    receipt_path = packet / f'telegram-{args.stage}-receipt.json'
    receipt = json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
    try:
        for artifact, digest in payloads:
            prior = receipt.get(digest, {})
            if prior.get('status') == 'sent':
                continue
            assert prior.get('status') not in {'sending', 'uncertain'}, 'Reconcile the uncertain delivery before retrying'
            receipt[digest] = {'status': 'sending', 'artifact': artifact.name if artifact else None, 'started_at': datetime.now(timezone.utc).isoformat()}
            receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2))
            try:
                options = {'kind': f'jangwook-net.{args.stage}', 'company_id': 'jangwook-net', 'dedupe_key': f'jangwook-net:{args.stage}:{digest}'}
                result = await channel.send_file(artifact, caption=text, **options) if artifact else await channel.send_text(text, **options)
                receipt[digest].update(status=result.status, message_ids=result.message_ids, delivery_id=result.delivery_id)
                receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2))
                assert result.status == 'sent' and result.message_ids, 'Delivery did not return a sent receipt'
            except Exception:
                if receipt[digest]['status'] == 'sending':
                    receipt[digest]['status'] = 'uncertain'
                    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2))
                raise
        print(json.dumps({'stage': args.stage, 'deliveries': list(receipt.values())}, ensure_ascii=False))
    finally:
        await channel._client.aclose()
        conn.close()


if __name__ == '__main__':
    asyncio.run(main())
