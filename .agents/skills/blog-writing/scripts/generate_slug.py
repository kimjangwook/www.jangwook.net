#!/usr/bin/env python3
"""
Generate URL-friendly slug from title

This script converts a blog post title into a URL-friendly slug
following best practices for SEO and readability.

Usage:
    python generate_slug.py "Your Blog Post Title"
    python generate_slug.py "Claude Skills Complete Guide"

Output:
    claude-skills-complete-guide
"""
import sys
import re
import unicodedata


def generate_slug(title):
    """
    Convert title to URL-friendly slug.

    Rules:
    1. Convert to lowercase
    2. Remove special characters
    3. Replace spaces with hyphens
    4. Remove consecutive hyphens
    5. Remove leading/trailing hyphens
    6. Handle Unicode characters (transliterate when possible)

    Args:
        title: Blog post title

    Returns:
        str: URL-friendly slug
    """
    # Normalize Unicode characters (NFD = decompose, then remove accents)
    slug = unicodedata.normalize('NFD', title)
    slug = slug.encode('ascii', 'ignore').decode('utf-8')

    # Convert to lowercase
    slug = slug.lower()

    # Replace special patterns
    replacements = {
        '&': 'and',
        '+': 'plus',
        '@': 'at',
        '#': 'number',
        '%': 'percent',
    }

    for char, replacement in replacements.items():
        slug = slug.replace(char, replacement)

    # Remove all non-alphanumeric characters except spaces and hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)

    # Replace whitespace with hyphens
    slug = re.sub(r'\s+', '-', slug)

    # Remove consecutive hyphens
    slug = re.sub(r'-+', '-', slug)

    # Remove leading/trailing hyphens
    slug = slug.strip('-')

    # Limit length to 60 characters (good for URLs)
    if len(slug) > 60:
        # Try to break at word boundary
        slug = slug[:60]
        last_hyphen = slug.rfind('-')
        if last_hyphen > 40:  # Only break if we're not cutting too much
            slug = slug[:last_hyphen]

    return slug


def check_slug_exists(slug, language='ko'):
    """
    Check if a slug already exists in the blog directory.

    Args:
        slug: The slug to check
        language: Language code (ko, en, ja)

    Returns:
        bool: True if slug exists, False otherwise
    """
    from pathlib import Path

    blog_dir = Path(f"src/content/blog/{language}")
    if not blog_dir.exists():
        return False

    target_file = blog_dir / f"{slug}.md"
    return target_file.exists()


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_slug.py \"Your Blog Post Title\"")
        print("Example: python generate_slug.py \"Claude Skills Complete Guide\"")
        sys.exit(1)

    # Get title from arguments (join all args in case title has spaces without quotes)
    title = ' '.join(sys.argv[1:])

    # Generate slug
    slug = generate_slug(title)

    # Output the slug
    print(slug)

    # Check if slug exists in Korean blog directory (default)
    if check_slug_exists(slug, 'ko'):
        print(f"\n⚠️  Warning: File 'ko/{slug}.md' already exists", file=sys.stderr)

    # Also check other languages
    for lang in ['en', 'ja']:
        if check_slug_exists(slug, lang):
            print(f"⚠️  Warning: File '{lang}/{slug}.md' already exists", file=sys.stderr)


if __name__ == "__main__":
    main()
