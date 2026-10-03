#!/usr/bin/env python3
"""
Blog Screenshot Post-Processor

Usage:
  python3 scripts/process-screenshot.py <input> <output> [operations...]

Operations:
  --blur x,y,w,h          Blur a rectangular region (redact sensitive info)
  --blackout x,y,w,h      Black-fill a rectangular region (complete redaction)
  --highlight x,y,w,h     Add red highlight border around a region
  --highlight-green x,y,w,h  Add green highlight border
  --highlight-blue x,y,w,h   Add blue highlight border
  --arrow x1,y1,x2,y2     Draw an arrow from (x1,y1) to (x2,y2)
  --label x,y,text         Add text label at position
  --crop x,y,w,h          Crop to specified region
  --resize WxH            Resize to width x height (e.g., 1020x510)
  --border                Add subtle border for blog embedding

Examples:
  # Blur an API key area and highlight a button
  python3 scripts/process-screenshot.py _sandbox/screenshots/raw.png src/assets/blog/post-demo.png \\
    --blur 200,50,400,30 \\
    --highlight 100,200,300,50

  # Crop, add highlight, and resize for blog
  python3 scripts/process-screenshot.py _sandbox/screenshots/raw.png src/assets/blog/post-ui.png \\
    --crop 0,100,1200,600 \\
    --highlight 50,50,200,100 \\
    --resize 1020x510

  # Multiple blurs for sensitive data
  python3 scripts/process-screenshot.py _sandbox/screenshots/raw.png src/assets/blog/post-config.png \\
    --blur 300,120,500,20 \\
    --blur 300,150,500,20 \\
    --blackout 600,80,200,30
"""

import sys
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont


def parse_rect(s):
    """Parse 'x,y,w,h' string to tuple."""
    parts = s.split(",")
    if len(parts) != 4:
        raise ValueError(f"Expected x,y,w,h but got: {s}")
    return tuple(int(p.strip()) for p in parts)


def parse_points(s):
    """Parse 'x1,y1,x2,y2' string to tuple."""
    parts = s.split(",")
    if len(parts) != 4:
        raise ValueError(f"Expected x1,y1,x2,y2 but got: {s}")
    return tuple(int(p.strip()) for p in parts)


def parse_label_pos(s):
    """Parse 'x,y' string to tuple."""
    parts = s.split(",")
    if len(parts) != 2:
        raise ValueError(f"Expected x,y but got: {s}")
    return tuple(int(p.strip()) for p in parts)


def blur_region(img, x, y, w, h, intensity=15):
    """Apply Gaussian blur to a rectangular region."""
    box = (x, y, x + w, y + h)
    region = img.crop(box)
    blurred = region.filter(ImageFilter.GaussianBlur(radius=intensity))
    img.paste(blurred, box)
    return img


def blackout_region(img, x, y, w, h):
    """Fill a rectangular region with black."""
    draw = ImageDraw.Draw(img)
    draw.rectangle([x, y, x + w, y + h], fill=(0, 0, 0))
    return img


def highlight_region(img, x, y, w, h, color=(255, 59, 48), width=3):
    """Draw a colored border around a region."""
    draw = ImageDraw.Draw(img)
    # Semi-transparent overlay
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    # Draw rounded-ish rectangle border
    for i in range(width):
        overlay_draw.rectangle(
            [x - i, y - i, x + w + i, y + h + i],
            outline=(*color, 200),
        )
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    return img


def draw_arrow(img, x1, y1, x2, y2, color=(255, 59, 48), width=3):
    """Draw a simple arrow from (x1,y1) to (x2,y2)."""
    import math

    draw = ImageDraw.Draw(img)
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

    # Arrowhead
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_len = 15
    arrow_angle = math.pi / 6  # 30 degrees

    ax1 = x2 - arrow_len * math.cos(angle - arrow_angle)
    ay1 = y2 - arrow_len * math.sin(angle - arrow_angle)
    ax2 = x2 - arrow_len * math.cos(angle + arrow_angle)
    ay2 = y2 - arrow_len * math.sin(angle + arrow_angle)

    draw.polygon([(x2, y2), (int(ax1), int(ay1)), (int(ax2), int(ay2))], fill=color)
    return img


def add_label(img, x, y, text, color=(255, 59, 48)):
    """Add a text label with background at position."""
    draw = ImageDraw.Draw(img)

    # Try system font, fall back to default
    font = None
    font_paths = [
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, 16)
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((x, y), text, font=font)
    padding = 4
    # Background
    draw.rectangle(
        [bbox[0] - padding, bbox[1] - padding, bbox[2] + padding, bbox[3] + padding],
        fill=(255, 255, 255, 220),
        outline=color,
    )
    draw.text((x, y), text, fill=color, font=font)
    return img


def add_border(img, color=(220, 220, 220), width=1):
    """Add a subtle border for blog embedding."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for i in range(width):
        draw.rectangle([i, i, w - 1 - i, h - 1 - i], outline=color)
    return img


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    args = sys.argv[3:]

    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    img = Image.open(input_path)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    print(f"Processing: {input_path} ({img.size[0]}x{img.size[1]})")

    i = 0
    while i < len(args):
        op = args[i]

        if op == "--blur" and i + 1 < len(args):
            x, y, w, h = parse_rect(args[i + 1])
            img = blur_region(img, x, y, w, h)
            print(f"  Blurred region: ({x},{y}) {w}x{h}")
            i += 2

        elif op == "--blackout" and i + 1 < len(args):
            x, y, w, h = parse_rect(args[i + 1])
            img = blackout_region(img, x, y, w, h)
            print(f"  Blacked out region: ({x},{y}) {w}x{h}")
            i += 2

        elif op == "--highlight" and i + 1 < len(args):
            x, y, w, h = parse_rect(args[i + 1])
            img = highlight_region(img, x, y, w, h, color=(255, 59, 48))
            print(f"  Highlighted (red): ({x},{y}) {w}x{h}")
            i += 2

        elif op == "--highlight-green" and i + 1 < len(args):
            x, y, w, h = parse_rect(args[i + 1])
            img = highlight_region(img, x, y, w, h, color=(52, 199, 89))
            print(f"  Highlighted (green): ({x},{y}) {w}x{h}")
            i += 2

        elif op == "--highlight-blue" and i + 1 < len(args):
            x, y, w, h = parse_rect(args[i + 1])
            img = highlight_region(img, x, y, w, h, color=(0, 122, 255))
            print(f"  Highlighted (blue): ({x},{y}) {w}x{h}")
            i += 2

        elif op == "--arrow" and i + 1 < len(args):
            x1, y1, x2, y2 = parse_points(args[i + 1])
            img = draw_arrow(img, x1, y1, x2, y2)
            print(f"  Arrow: ({x1},{y1}) -> ({x2},{y2})")
            i += 2

        elif op == "--label" and i + 2 < len(args):
            x, y = parse_label_pos(args[i + 1])
            text = args[i + 2]
            img = add_label(img, x, y, text)
            print(f"  Label at ({x},{y}): '{text}'")
            i += 3

        elif op == "--crop" and i + 1 < len(args):
            x, y, w, h = parse_rect(args[i + 1])
            img = img.crop((x, y, x + w, y + h))
            print(f"  Cropped to: ({x},{y}) {w}x{h}")
            i += 2

        elif op == "--resize" and i + 1 < len(args):
            size_str = args[i + 1]
            w, h = size_str.split("x")
            img = img.resize((int(w), int(h)), Image.LANCZOS)
            print(f"  Resized to: {w}x{h}")
            i += 2

        elif op == "--border":
            img = add_border(img)
            print("  Added border")
            i += 1

        else:
            print(f"  Warning: Unknown operation '{op}', skipping")
            i += 1

    # Save - convert to RGB if saving as JPEG/WebP
    if output_path.lower().endswith((".jpg", ".jpeg")):
        img = img.convert("RGB")
        img.save(output_path, "JPEG", quality=90)
    elif output_path.lower().endswith(".webp"):
        img.save(output_path, "WEBP", quality=90)
    else:
        img.save(output_path, "PNG", optimize=True)

    file_size = os.path.getsize(output_path)
    print(f"\nSaved: {output_path} ({file_size // 1024}KB)")


if __name__ == "__main__":
    main()
