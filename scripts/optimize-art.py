#!/usr/bin/env python3
"""Optimize a reviewed 3:2 EmoLex illustration into a self-contained WebP.

Requires Python 3 and Pillow (development only, not micro.blog runtime):
    python3 -m pip install Pillow
    python3 scripts/optimize-art.py --input /path/to/original.png --id joy --out /tmp/joy-v01.webp

This does NOT approve, publish or modify canonical concept data.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path
from PIL import Image, ImageOps

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True, help='Local high-res PNG/JPEG source (keep outside the plugin repo)')
    parser.add_argument('--id', required=True, help='Stable lowercase concept id')
    parser.add_argument('--out', type=Path, required=True, help='Output WebP candidate; explicit to avoid accidental release')
    parser.add_argument('--quality', type=int, default=78, help='Starting point is 78; compare visually before choosing')
    parser.add_argument('--width', type=int, default=960, help='Output width; height derives from 3:2 source')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.id):
        parser.error('Invalid concept id')
    if not (50 <= args.quality <= 95):
        parser.error('Quality must be between 50 and 95')
    if args.width not in (960,1200):
        parser.error('Use 960 or 1200 px width')
    if args.out.suffix.lower() != '.webp':
        parser.error('Output filename must end in .webp')
    if args.out.resolve() == args.input.resolve():
        parser.error('Input and output cannot be the same file')
    with Image.open(args.input) as source:
        source = ImageOps.exif_transpose(source)
        if source.width * 2 != source.height * 3:
            parser.error(f'Source must already be a complete 3:2 composition, got {source.width}x{source.height}; do not silently crop a story scene')
        if source.width < args.width or source.height < args.width * 2 // 3:
            parser.error('Source must be at least output resolution; no upscaling')
        if 'A' in source.getbands():
            # Canonical pictures use a warm, opaque paper ground, never opaque black.
            background = Image.new('RGBA', source.size, '#F8F4E9')
            background.alpha_composite(source.convert('RGBA'))
            image = background.convert('RGB')
        else:
            image = source.convert('RGB')
        image = image.resize((args.width, args.width * 2 // 3), Image.Resampling.LANCZOS)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.out, 'WEBP', quality=args.quality, method=6, exact=True)
    with Image.open(args.out) as check:
        check.verify()
    data = args.out.read_bytes()
    result = {
        'conceptId': args.id,
        'file': str(args.out),
        'width': args.width,
        'height': args.width * 2 // 3,
        'quality': args.quality,
        'bytes': len(data),
        'sha256': hashlib.sha256(data).hexdigest(),
        'status': 'candidate-not-approved',
        'note': 'Visual/art consistency, semantic brief, alt text, real micro.blog and iOS Safari share still need review'
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if len(data) > 180 * 1024:
        raise SystemExit('Candidate exceeds 180KiB hard per-file budget; adjust quality/resolution after inspecting the image')

if __name__ == '__main__':
    main()
