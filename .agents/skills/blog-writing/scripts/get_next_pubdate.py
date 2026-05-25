#!/usr/bin/env python3
"""
Find the latest blog post pubDate and return +1 day

This script scans all blog posts across all languages (ko, en, ja)
to find the most recent pubDate, then returns the next day in
the correct format for use in frontmatter.

Usage:
    python get_next_pubdate.py

Output:
    '2025-10-23'  (with single quotes, ready to paste into frontmatter)
"""
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path


def find_latest_pubdate():
    """
    Scan all blog posts in ko, en, ja directories and find the latest pubDate.

    Returns:
        str: Next pubDate in 'YYYY-MM-DD' format with single quotes,
             or None if no posts found.
    """
    # All language directories to scan
    blog_dirs = [
        Path("src/content/blog/ko"),
        Path("src/content/blog/en"),
        Path("src/content/blog/ja"),
        Path("src/content/blog/zh")
    ]

    latest_date = None

    for blog_dir in blog_dirs:
        if not blog_dir.exists():
            continue

        for md_file in blog_dir.glob("*.md"):
            try:
                content = md_file.read_text(encoding='utf-8')

                # Match pubDate with either single or double quotes
                match = re.search(r"pubDate:\s*['\"](\d{4}-\d{2}-\d{2})['\"]", content)

                if match:
                    date_str = match.group(1)
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d")

                    if latest_date is None or date_obj > latest_date:
                        latest_date = date_obj
            except Exception as e:
                # Skip files that can't be read or parsed
                print(f"Warning: Could not process {md_file}: {e}", file=sys.stderr)
                continue

    if latest_date:
        next_from_latest = latest_date + timedelta(days=1)
        next_from_today = datetime.now() + timedelta(days=1)
        # Use whichever is later: latest post + 1 day OR today + 1 day
        next_date = max(next_from_latest, next_from_today)
        return next_date.strftime("%Y-%m-%d")

    # No existing posts: use tomorrow
    return (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")


if __name__ == "__main__":
    next_date = find_latest_pubdate()

    if next_date:
        # Output with single quotes for direct pasting into frontmatter
        print(f"'{next_date}'")
    else:
        print("No existing posts found", file=sys.stderr)
        sys.exit(1)
