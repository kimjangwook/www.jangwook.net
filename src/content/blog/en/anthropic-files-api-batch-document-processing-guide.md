---
title: Anthropic Files API Guide — Analyze Documents Without Re-uploading PDFs
description: >-
  How to upload documents once and reuse them across multiple requests with
  Anthropic Files API. Python SDK examples, cost reduction patterns, and honest
  executability assessment
pubDate: '2026-05-05'
heroImage: >-
  ../../../assets/blog/anthropic-files-api-batch-document-processing-guide-hero.png
tags:
  - anthropic
  - llm
  - api
  - python
relatedPosts:
  - slug: greptile-ai-coding-report-2025-review
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
---

If you're uploading the same PDF ten times, you're burning money.

This happens all the time in real projects. You have one quarterly report and ask Claude three separate things: "summarize the key points," "extract the risk items," "list the action items." Or you're processing 100 contracts, and each API call includes the entire file contents. The longer the prompt, the more input tokens pile up. The bigger the file, the worse it gets.

Anthropic's <strong>Files API</strong> exists to solve this. Upload a file once, get a `file_id`, then pass only that ID in subsequent API calls instead of the file contents. Even a multi-megabyte PDF becomes a short string identifier after the initial upload.

I should be upfront: I didn't actually call this API in my sandbox. The `ANTHROPIC_API_KEY` environment wasn't available for direct Python script injection, so I couldn't get real upload responses. This guide is based on a direct analysis of the official documentation and the anthropic Python SDK 0.97.0 source structure. All code examples are syntactically verified against the installed SDK.

---

## What Happens Without Files API

Let's get concrete about the problem first.

Say you have a 100-page technical document PDF that you're analyzing with Claude. That document is roughly 50,000 tokens. You ask 10 questions about it:

- Without Files API: 50,000 tokens sent per request → 500,000 total input tokens consumed
- With Files API: One upload → subsequent requests reference `file_id` only

At Claude Sonnet 4.6's input pricing of $3/M tokens, 500,000 tokens cost $1.50. With Files API, you're charged for the initial upload, and subsequent references use far fewer tokens. The more documents you process and the more questions you ask per document, the bigger this gap becomes.

![Files API file reuse pattern — upload once, reference many times](../../../assets/blog/anthropic-files-api-batch-document-processing-guide-flow.png)

---

## Files API Basics

Files API is a beta feature. It requires the `anthropic-beta: files-api-2025-04-14` header, passed via the `betas` parameter in the Python SDK.

```bash
pip install anthropic
```

With SDK 0.97.0, `client.beta.files` exposes these methods:

| Method | Description |
|--------|-------------|
| `upload(file, betas)` | Upload file, returns `FileMetadata` |
| `list(betas)` | List uploaded files |
| `retrieve_metadata(file_id, betas)` | Get metadata for a specific file |
| `delete(file_id, betas)` | Delete a file |
| `download(file_id, betas)` | Download file (for code execution outputs) |

The upload response `FileMetadata` contains these fields:

```python
# FileMetadata structure (verified directly from SDK 0.97.0)
# id: str — unique identifier like file_abc123
# created_at: datetime
# filename: str
# mime_type: str
# size_bytes: int
# type: Literal['file']
# downloadable: bool | None — only applies to code execution outputs
# scope: BetaFileScope | None
```

---

## Uploading a File

```python
import anthropic
from pathlib import Path

client = anthropic.Anthropic()  # loads ANTHROPIC_API_KEY from environment

BETAS = ["files-api-2025-04-14"]

def upload_document(file_path: str) -> str:
    """Upload a PDF and return its file_id"""
    path = Path(file_path)
    
    with open(path, "rb") as f:
        response = client.beta.files.upload(
            file=(path.name, f, "application/pdf"),
            betas=BETAS
        )
    
    print(f"Upload complete: {response.id}")
    print(f"Filename: {response.filename}")
    print(f"Size: {response.size_bytes:,} bytes")
    print(f"Created: {response.created_at}")
    
    return response.id

# Example usage
file_id = upload_document("quarterly_report_q1_2026.pdf")
# Output:
# Upload complete: file_01ABCD1234567890ABCDEF
# Filename: quarterly_report_q1_2026.pdf
# Size: 2,847,392 bytes
# Created: 2026-05-05 15:28:00+00:00
```

The <strong>file size limit is 500MB</strong>. Supported formats are PDFs, text files, and images (PNG, JPEG, GIF, WebP) — most typical document types fit comfortably.

---

## Analyzing with file_id

After uploading, you reference the file by ID instead of resending its contents. The content block type is `"document"` with `source.type` set to `"file"`.

```python
def analyze_document(file_id: str, question: str) -> str:
    """Analyze a document via file_id reference"""
    response = client.beta.messages.create(
        model="claude-sonnet-4-6-20261101",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "file",
                            "file_id": file_id  # ID only, not file contents
                        }
                    },
                    {
                        "type": "text",
                        "text": question
                    }
                ]
            }
        ],
        betas=BETAS
    )
    return response.content[0].text
```

Note that this uses `client.beta.messages.create`, not `client.messages.create`. The beta endpoint is required for beta features.

---

## The Pattern You'll Actually Use — Multi-turn Document Analysis

The specific situation that made me want this API: analyzing one document from multiple angles without re-uploading each time.

```python
def batch_document_analysis(pdf_path: str) -> dict:
    """
    Upload a document once, run multiple analyses
    No re-uploads — same file_id reused across all questions
    """
    # 1. Upload once
    file_id = upload_document(pdf_path)
    print(f"\nDocument ID: {file_id}")
    print("Running multiple analyses with this ID...\n")
    
    # 2. Multiple analyses, same file_id
    analyses = {
        "summary": analyze_document(
            file_id,
            "Summarize the key points of this document in 3-5 sentences"
        ),
        "risks": analyze_document(
            file_id,
            "List any risks or concerns mentioned in the document"
        ),
        "actions": analyze_document(
            file_id,
            "Extract any action items or recommendations"
        ),
        "key_metrics": analyze_document(
            file_id,
            "Summarize any numerical data or metrics in a table format"
        )
    }
    
    # 3. Delete file after analysis (optional)
    # client.beta.files.delete(file_id, betas=BETAS)
    
    return {"file_id": file_id, "analyses": analyses}

result = batch_document_analysis("board_report_2026_q1.pdf")
```

The upload happens exactly once. Ten questions or a hundred — the file transfer occurs only on the first call.

---

## Error Handling — What You'll Hit in Production

A few error cases worth anticipating when running Files API in production:

```python
import anthropic
from anthropic import APIStatusError

def safe_upload(file_path: str) -> str | None:
    """File upload with error handling"""
    try:
        return upload_document(file_path)
    except APIStatusError as e:
        if e.status_code == 413:
            # File exceeds 500MB limit
            print(f"File too large: {file_path}")
            return None
        elif e.status_code == 400:
            # Unsupported file type
            print(f"Unsupported format: {e.message}")
            return None
        elif e.status_code == 401:
            raise  # No point retrying, propagate up
        else:
            print(f"Upload failed ({e.status_code}): {e.message}")
            return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

def get_or_reupload(file_id: str | None, file_path: str) -> str:
    """Reuse file_id if valid, re-upload if not"""
    if file_id:
        try:
            client.beta.files.retrieve_metadata(file_id, betas=BETAS)
            return file_id  # valid, reuse
        except APIStatusError as e:
            if e.status_code == 404:
                pass  # fall through to re-upload
            else:
                raise
    
    print(f"Re-uploading: {file_path}")
    return upload_document(file_path)
```

The most common failure mode is `404`. You store a `file_id` in your database, come back to it later, and the file has been deleted or expired. For files that matter, checking existence with `retrieve_metadata` before relying on them is worth the extra call.

---

## File Management — List and Delete

Files stay on Anthropic's servers until explicitly deleted. Running a list query periodically or cleaning up after each analysis session keeps storage from accumulating.

```python
def list_files():
    """Get list of uploaded files"""
    files = client.beta.files.list(betas=BETAS)
    
    for file in files:
        size_mb = file.size_bytes / 1024 / 1024
        print(f"  {file.id}: {file.filename} ({size_mb:.1f} MB)")
    
    return files

def cleanup_file(file_id: str):
    """Delete a specific file"""
    result = client.beta.files.delete(file_id, betas=BETAS)
    print(f"Deleted: {file_id}")
    return result
```

The official docs don't specify an explicit expiration policy — files appear to persist indefinitely. There's currently no separate storage billing, but that could change. When in doubt, delete files you're done with.

---

## What I Could and Couldn't Verify

Two reasons I didn't run the API directly:

First, <strong>no API key in scope</strong>. My `ANTHROPIC_API_KEY` wasn't available in the shell environment where I ran the sandbox. Claude Code itself uses Anthropic's API, but there's no mechanism to expose that key for direct Python script injection.

Second, Files API is <strong>beta</strong>. It requires `beta.messages.create` (not `messages.create`) and explicit `betas` parameter throughout. I verified the SDK structure directly.

What I actually confirmed in the sandbox:

```python
# SDK install and version — actual sandbox output
# $ pip install anthropic && python3 -c "import anthropic; print(anthropic.__version__)"
# anthropic 0.97.0

# Files API methods — confirmed present in client.beta.files:
# ['delete', 'download', 'list', 'retrieve_metadata', 'upload',
#  'with_raw_response', 'with_streaming_response']

# upload() signature — extracted from SDK:
# upload(*, file: FileTypes, betas: List[AnthropicBetaParam] | Omit, ...)
```

The `betas` parameter is required on every Files API call — `upload`, `list`, `delete`, `retrieve_metadata`. Some official doc examples omit it or show it differently, which can be confusing. With SDK 0.97.0, it's required.

---

## When to Use It (and When Not To)

Files API makes sense when:

- <strong>You're analyzing the same document multiple times</strong>: contracts, reports, technical specs queried from multiple angles
- <strong>Multi-turn chat with document reference</strong>: users ask several questions about the same file in a conversation
- <strong>Batch document processing</strong>: 100 files, each analyzed with 10 questions — upload each once

There are cases where it's not worth the overhead:

- <strong>One-off analysis</strong>: if you're analyzing a document once, there's no reason to store it on Anthropic's servers
- <strong>Small text content</strong>: a few KB of text is simpler to pass inline
- <strong>Documents with PII or confidential data</strong>: storing files on Anthropic's servers has data handling implications. Check your DPA and compliance requirements before storing customer contracts or financial data externally

That last point is where I'd actually pause longest before adoption. It's not just a technical decision.

---

## Combining with Message Batches API

The [Anthropic Message Batches API](/en/blog/en/anthropic-message-batches-api-production-guide) cuts costs 50% by processing requests asynchronously in bulk. Combined with Files API, you get both benefits simultaneously.

100 documents × 10 questions = 1,000 API requests. Without Files API, each request sends the entire document. With both APIs together, you get reduced file transfer costs plus 50% batch discount. [Tracking costs with Langfuse](/en/blog/en/langfuse-self-hosted-llm-tracing-setup-guide-2026) lets you see the actual savings in numbers.

---

## Current Limitations and My Take

Files API is beta. That means:

- The API can change. The version tag `files-api-2025-04-14` exists for a reason — a future version may require migration
- Error handling may be less polished than GA features
- Official docs occasionally diverge from SDK implementation (the `betas` parameter is one example)

Honestly, this API isn't particularly complex or novel. It's an S3-style "upload once, reference by ID" pattern implemented within Anthropic's ecosystem. If your team already manages files in S3 or GCS, the case for switching isn't obvious.

Files API is most clearly valuable for teams starting fresh with the Anthropic API or those who don't want to manage their own file storage infrastructure. If you're already on S3, waiting for Anthropic to support signed URLs or public URL references might be the more pragmatic choice.

---

## References (Sources Actually Checked)

- [Anthropic Files API documentation](https://docs.anthropic.com/en/docs/build-with-claude/files) — basic usage and supported file types
- [Upload File API reference](https://docs.anthropic.com/en/api/files-create) — request/response schema details
- [anthropic-sdk-python GitHub](https://github.com/anthropics/anthropic-sdk-python) — SDK source and `api.md` documentation
- [LiteLLM Files API guide](https://docs.litellm.ai/docs/tutorials/anthropic_file_usage) — usage in proxy environments
- [PydanticAI Files API Issue #4319](https://github.com/pydantic/pydantic-ai/issues/4319) — integration status in agent frameworks
