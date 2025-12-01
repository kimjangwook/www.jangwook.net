#!/usr/bin/env python3
"""
Validate blog post frontmatter against schema requirements

This script checks that a blog post's frontmatter includes all required
fields, uses correct formats, and follows SEO best practices.

Usage:
    python validate_frontmatter.py <path-to-markdown-file>
    python validate_frontmatter.py ko/my-post.md

Exit codes:
    0: All validations passed
    1: Validation errors found
"""
import sys
import re
from pathlib import Path
from datetime import datetime


# SEO Guidelines for optimal lengths
SEO_LIMITS = {
    'ko': {
        'title': {'min': 25, 'max': 30},
        'description': {'min': 70, 'max': 80}
    },
    'en': {
        'title': {'min': 50, 'max': 60},
        'description': {'min': 150, 'max': 160}
    },
    'ja': {
        'title': {'min': 30, 'max': 35},
        'description': {'min': 80, 'max': 90}
    },
    'zh': {
        'title': {'min': 20, 'max': 25},
        'description': {'min': 60, 'max': 70}
    }
}


def detect_language(file_path):
    """Detect language from file path (ko, en, ja, or zh)."""
    path_str = str(file_path)
    if '/ko/' in path_str or '\\ko\\' in path_str:
        return 'ko'
    elif '/en/' in path_str or '\\en\\' in path_str:
        return 'en'
    elif '/ja/' in path_str or '\\ja\\' in path_str:
        return 'ja'
    elif '/zh/' in path_str or '\\zh\\' in path_str:
        return 'zh'
    return None


def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return None
    return match.group(1)


def parse_frontmatter_field(frontmatter, field_name):
    """Parse a specific field from frontmatter."""
    # Match field with quotes (single or double)
    pattern = rf"{field_name}:\s*['\"](.+?)['\"]"
    match = re.search(pattern, frontmatter)
    if match:
        return match.group(1)

    # Match field without quotes (for arrays, etc.)
    pattern = rf"{field_name}:\s*(.+?)(?:\n\w+:|$)"
    match = re.search(pattern, frontmatter, re.DOTALL)
    if match:
        return match.group(1).strip()

    return None


def validate_date_format(date_str, field_name):
    """Validate date is in YYYY-MM-DD format."""
    errors = []

    if not date_str:
        errors.append(f"❌ {field_name}: Missing")
        return errors

    # Check format
    if not re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        errors.append(f"❌ {field_name}: Invalid format '{date_str}' (must be YYYY-MM-DD)")
        return errors

    # Check if valid date
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        errors.append(f"❌ {field_name}: Invalid date '{date_str}'")
        return errors

    return errors


def validate_frontmatter(file_path):
    """
    Validate frontmatter of a blog post.

    Args:
        file_path: Path to the markdown file

    Returns:
        tuple: (bool success, list of errors/warnings)
    """
    errors = []
    warnings = []

    # Read file
    try:
        content = Path(file_path).read_text(encoding='utf-8')
    except Exception as e:
        return False, [f"❌ Could not read file: {e}"], []

    # Detect language
    language = detect_language(file_path)
    if not language:
        warnings.append("⚠️  Could not detect language from path (expected ko/, en/, ja/, or zh/)")

    # Extract frontmatter
    frontmatter = extract_frontmatter(content)
    if not frontmatter:
        return False, ["❌ No valid frontmatter found (must start and end with ---)"], []

    # Check for single quotes on pubDate
    if re.search(r'pubDate:\s*"', frontmatter):
        errors.append("❌ pubDate: Must use single quotes, not double quotes")

    # Required fields
    required_fields = ['title', 'description', 'pubDate', 'heroImage', 'relatedPosts']

    for field in required_fields:
        value = parse_frontmatter_field(frontmatter, field)
        if not value:
            errors.append(f"❌ {field}: Missing (required field)")

    # Validate title
    title = parse_frontmatter_field(frontmatter, 'title')
    if title and language:
        length = len(title)
        limits = SEO_LIMITS[language]['title']

        if length < limits['min']:
            warnings.append(
                f"⚠️  title: Too short ({length} chars, recommended {limits['min']}-{limits['max']} for {language})"
            )
        elif length > limits['max']:
            warnings.append(
                f"⚠️  title: Too long ({length} chars, recommended {limits['min']}-{limits['max']} for {language})"
            )

    # Validate description
    description = parse_frontmatter_field(frontmatter, 'description')
    if description and language:
        length = len(description)
        limits = SEO_LIMITS[language]['description']

        if length < limits['min']:
            warnings.append(
                f"⚠️  description: Too short ({length} chars, recommended {limits['min']}-{limits['max']} for {language})"
            )
        elif length > limits['max']:
            warnings.append(
                f"⚠️  description: Too long ({length} chars, recommended {limits['min']}-{limits['max']} for {language})"
            )

    # Validate pubDate
    pubdate = parse_frontmatter_field(frontmatter, 'pubDate')
    date_errors = validate_date_format(pubdate, 'pubDate')
    errors.extend(date_errors)

    # Validate updatedDate if present
    updated_date = parse_frontmatter_field(frontmatter, 'updatedDate')
    if updated_date:
        date_errors = validate_date_format(updated_date, 'updatedDate')
        errors.extend(date_errors)

    # Validate heroImage path
    hero_image = parse_frontmatter_field(frontmatter, 'heroImage')
    if hero_image:
        if not hero_image.startswith('../../../assets/blog/'):
            errors.append(
                f"❌ heroImage: Must use path '../../../assets/blog/' (got '{hero_image}')"
            )

        # Check if file exists (relative to content file)
        if file_path:
            content_dir = Path(file_path).parent
            image_path = content_dir / hero_image
            if not image_path.exists():
                warnings.append(f"⚠️  heroImage: File not found at {image_path}")

    # Validate tags
    tags = parse_frontmatter_field(frontmatter, 'tags')
    if tags:
        # Extract array values
        tag_list = re.findall(r"['\"]([^'\"]+)['\"]", tags)
        if tag_list:
            for tag in tag_list:
                if tag != tag.lower():
                    errors.append(f"❌ tags: Tag '{tag}' must be lowercase")
                if ' ' in tag and '-' not in tag:
                    warnings.append(f"⚠️  tags: Tag '{tag}' contains spaces (use hyphens)")

            if len(tag_list) > 5:
                warnings.append(f"⚠️  tags: Too many tags ({len(tag_list)}, recommended max 5)")

    # Validate relatedPosts
    related_posts = parse_frontmatter_field(frontmatter, 'relatedPosts')
    if related_posts:
        # Check for required language keys in reasons
        required_langs = ['ko', 'ja', 'en', 'zh']
        if 'reason:' in related_posts:
            for lang in required_langs:
                if f'{lang}:' not in related_posts:
                    warnings.append(f"⚠️  relatedPosts: Missing '{lang}' in reason field")

        # Check for score field
        if 'score:' in related_posts:
            # Extract scores and validate range
            score_matches = re.findall(r'score:\s*(\d+\.?\d*)', related_posts)
            for score_str in score_matches:
                score = float(score_str)
                if score < 0 or score > 1:
                    errors.append(f"❌ relatedPosts: Score {score} out of range (must be 0-1)")

    return len(errors) == 0, errors, warnings


def main():
    if len(sys.argv) != 2:
        print("Usage: python validate_frontmatter.py <path-to-markdown-file>")
        print("Example: python validate_frontmatter.py ko/my-post.md")
        sys.exit(1)

    file_path = sys.argv[1]

    # Convert to absolute path if relative
    if not Path(file_path).is_absolute():
        file_path = Path.cwd() / file_path

    print(f"Validating: {file_path}\n")

    success, errors, warnings = validate_frontmatter(file_path)

    # Print errors
    if errors:
        print("ERRORS:")
        for error in errors:
            print(f"  {error}")
        print()

    # Print warnings
    if warnings:
        print("WARNINGS:")
        for warning in warnings:
            print(f"  {warning}")
        print()

    # Summary
    if success and not warnings:
        print("✅ All validations passed!")
        sys.exit(0)
    elif success:
        print("✅ Required validations passed (warnings above)")
        sys.exit(0)
    else:
        print("❌ Validation failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
