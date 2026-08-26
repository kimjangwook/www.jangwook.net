#!/usr/bin/env python3
"""Batch regenerate selected jangwook.net posts using Local LLM (SuperQwen-27b) and Local Image LLM (z-image-turbo)."""

import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/jangwook/workspace/www.jangwook.net")
LOCAL_LLM_CLI = Path("/Users/jangwook/workspace/life-manager/src/cli/local-llm.ts")
GEN_HERO_SH = ROOT / "scripts" / "gen-hero.sh"

SLUGS = [
    "agent-session-portability-vs-policy-plane-slack-code-2026",
    "mcp-roadmap-doc-read-agent-identity-progressive-discovery-2026",
    "claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026",
    "mcp-builtin-vs-external-harness-cost-28x-measured-2026",
    "search-console-ai-features-opt-out-vs-official-docs-gap-2026",
    "spam-update-rollout-window-search-status-vs-gsc-2026",
    "declared-rules-fail-open-robots-txt-agents-md-2026"
]

def run_cmd(cmd, timeout=300):
    print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}", flush=True)
    res = subprocess.run(cmd, shell=isinstance(cmd, str), capture_output=True, text=True, timeout=timeout)
    return res

def call_local_llm(prompt, max_tokens=4096, temperature=0.3):
    cmd = [
        "node",
        str(LOCAL_LLM_CLI),
        "--thinking", "false",
        "--temperature", str(temperature),
        "--max-tokens", str(max_tokens),
        prompt
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if res.returncode != 0:
            print(f"ERROR: Local LLM failed: {res.stderr}", file=sys.stderr)
            return None
        return res.stdout.strip()
    except subprocess.TimeoutExpired:
        print("ERROR: Local LLM timed out after 600s", file=sys.stderr)
        return None

def main():
    print(f"Starting batch regeneration for {len(SLUGS)} posts...\n", flush=True)

    for i, slug in enumerate(SLUGS, 1):
        print(f"\n=======================================================", flush=True)
        print(f"[{i}/{len(SLUGS)}] Processing {slug}...", flush=True)
        print(f"=======================================================", flush=True)
        
        # 1. Generate Local Hero Image (z-image-turbo)
        hero_res = run_cmd([str(GEN_HERO_SH), slug], timeout=120)
        print(f"  Hero output: {hero_res.stdout.strip() or hero_res.stderr.strip()}", flush=True)

        ko_file = ROOT / "src" / "content" / "blog" / "ko" / f"{slug}.md"
        en_file = ROOT / "src" / "content" / "blog" / "en" / f"{slug}.md"
        ja_file = ROOT / "src" / "content" / "blog" / "ja" / f"{slug}.md"
        zh_file = ROOT / "src" / "content" / "blog" / "zh" / f"{slug}.md"
        
        ko_raw = ko_file.read_text(encoding="utf-8") if ko_file.exists() else ""
        en_raw = en_file.read_text(encoding="utf-8") if en_file.exists() else ""

        # Extract frontmatter
        m_fm = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", ko_raw or en_raw, re.DOTALL)
        fm_block = m_fm.group(1) if m_fm else ""
        existing_body = m_fm.group(2) if m_fm else (ko_raw or en_raw)

        # 2. Korean version (ko)
        if not (ko_file.exists() and len(ko_raw) > 4000 and "---" in ko_raw):
            prompt_ko = f"""
역할: 김장욱 (10년차+ 시니어 웹 개발자이자 엔지니어링 리더).
독자: CTO, CEO, C-Level 테크 리더 및 시니어 엔지니어.

다음 기술 포스트의 핵심 실측 데이터와 논지를 바탕으로, 억지스러운 번역투나 부자연스러운 단문 끊기를 완전히 배제하고, 자연스럽고 명쾌한 고급 한국어 해라체(평서문) 칼럼으로 재작성하라.

[핵심 작성 원칙]
1. 주제에 맞는 실제 동작 메커니즘(Mechanism)과 아키텍처 트레이드오프, 운영 비용/리스크를 논리적으로 명확하게 설명할 것.
2. 모든 글에 억지로 'CDP/DSR/웹 리뉴얼 고뇌'나 'C-Level 리스크 대장' 같은 상투적 문구를 끼워넣지 말 것. 본래 주제의 엔지니어링 문제의식에 집중할 것.
3. '확인하고 싶었다. ~했다. 결론은 분명하다. 이 구분이 중요하다' 식의 경직된 오프닝/클로징 템플릿을 피하고, 생각이 자연스럽게 이어지는 문장으로 작성할 것.
4. 사전식 괄호 주석 (예: Search Console(웹사이트 노출 확인 도구)) 금지. 문맥 안에서 자연스럽게 역할을 설명할 것.
5. 물결표(~, 〜) 일체 사용 금지 (범위는 '10에서 20' 또는 하이픈 '10-20' 사용).
6. 반드시 완전한 YAML frontmatter (title, description, pubDate, heroImage, tags, relatedPosts 등)와 마크다운 본문 전체를 출력할 것.

[기존 포스트 내용 및 원천 데이터]
---
{fm_block}
---
{existing_body[:4000]}
"""
            print(f"  Generating Korean version via SuperQwen-27b...", flush=True)
            ko_generated = call_local_llm(prompt_ko, max_tokens=4096, temperature=0.3)
            if ko_generated and "---" in ko_generated and len(ko_generated) > 2000:
                # Ensure frontmatter starts with ---
                if not ko_generated.startswith("---"):
                    ko_generated = "---" + ko_generated.partition("---")[2]
                ko_file.parent.mkdir(parents=True, exist_ok=True)
                ko_file.write_text(ko_generated + "\n", encoding="utf-8")
                ko_raw = ko_generated
                print(f"  ✓ Saved KO: {ko_file} ({len(ko_generated)} bytes)", flush=True)
            else:
                print(f"  ✗ KO generation rejected", flush=True)
        else:
            print(f"  ✓ KO already exists and valid ({len(ko_raw)} bytes)", flush=True)

        # 3. English version (en)
        if not (en_file.exists() and len(en_raw) > 4000 and "---" in en_raw):
            prompt_en = f"""
You are Kim Jangwook, a senior engineering leader and web architect.
Audience: Global CTOs, tech leaders, and senior architects.

Rewrite the following article into crisp, natural, authoritative English engineering prose.
Focus on clear cause and effect (mechanisms), architectural trade-offs, and practical operational insights.
Eliminate artificial stiff phrases. Write in active voice with clear logical flow.
Output complete markdown with frontmatter and body.

[Source Article Data]
{ko_raw[:4000]}
"""
            print(f"  Generating English version via SuperQwen-27b...", flush=True)
            en_generated = call_local_llm(prompt_en, max_tokens=4096, temperature=0.3)
            if en_generated and "---" in en_generated and len(en_generated) > 2000:
                if not en_generated.startswith("---"):
                    en_generated = "---" + en_generated.partition("---")[2]
                en_file.parent.mkdir(parents=True, exist_ok=True)
                en_file.write_text(en_generated + "\n", encoding="utf-8")
                en_raw = en_generated
                print(f"  ✓ Saved EN: {en_file} ({len(en_generated)} bytes)", flush=True)
            else:
                print(f"  ✗ EN generation rejected", flush=True)
        else:
            print(f"  ✓ EN already exists and valid ({len(en_raw)} bytes)", flush=True)

        # 4. Japanese version (ja)
        if not (ja_file.exists() and len(ja_file.read_text(encoding="utf-8")) > 4000):
            prompt_ja = f"""
役割: キム・ジャンウク (シニアエンジニアリングリーダー & Webアーキテクト)。
読者: CTO、技術リーダー、シニアエンジニア。

次の韓国語/英語記事の内容を、自然で明確な日本語の「だ・である調」コラムとして翻訳・ロー컬ライゼーションせよ。
直訳調を排し、技術的因果関係（Mechanism）と運用判断を明快に記述すること。
完全なYAML frontmatterと本文全体を出力せよ。

[元記事]
{ko_raw[:4000]}
"""
            print(f"  Generating Japanese version via SuperQwen-27b...", flush=True)
            ja_generated = call_local_llm(prompt_ja, max_tokens=4096, temperature=0.3)
            if ja_generated and "---" in ja_generated and len(ja_generated) > 2000:
                if not ja_generated.startswith("---"):
                    ja_generated = "---" + ja_generated.partition("---")[2]
                ja_file.parent.mkdir(parents=True, exist_ok=True)
                ja_file.write_text(ja_generated + "\n", encoding="utf-8")
                print(f"  ✓ Saved JA: {ja_file} ({len(ja_generated)} bytes)", flush=True)

        # 5. Chinese version (zh)
        if not (zh_file.exists() and len(zh_file.read_text(encoding="utf-8")) > 4000):
            prompt_zh = f"""
角色: 金长旭 (资深工程领导者 & Web架构师)。
读者: CTO、技术决策者及资深架构师。

将以下技术专栏内容重写为地道、严谨、结构清晰的中文技术专栏。
突出底层运行机制(Mechanism)、架构权衡及业务影响。
输出完整的YAML frontmatter和正文。

[源文章]
{ko_raw[:4000]}
"""
            print(f"  Generating Chinese version via SuperQwen-27b...", flush=True)
            zh_generated = call_local_llm(prompt_zh, max_tokens=4096, temperature=0.3)
            if zh_generated and "---" in zh_generated and len(zh_generated) > 2000:
                if not zh_generated.startswith("---"):
                    zh_generated = "---" + zh_generated.partition("---")[2]
                zh_file.parent.mkdir(parents=True, exist_ok=True)
                zh_file.write_text(zh_generated + "\n", encoding="utf-8")
                print(f"  ✓ Saved ZH: {zh_file} ({len(zh_generated)} bytes)", flush=True)

    print("\nBatch regeneration completely finished!", flush=True)

if __name__ == "__main__":
    main()
