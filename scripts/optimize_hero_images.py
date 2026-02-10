#!/usr/bin/env python3
"""
Optimize hero images for mobile performance.

Target:
- Mobile: 720px width (9:16 aspect ratio = 1280px height)
- Quality: 78 (balance between size and visual quality)
- Format: WebP

Expected savings: ~30-40% file size reduction
"""

import os
from pathlib import Path
from PIL import Image

# Configuration
HERO_DIR = Path("public/hero")
MOBILE_TARGET_WIDTH = 720
MOBILE_TARGET_HEIGHT = 1280
DESKTOP_TARGET_WIDTH = 1920
DESKTOP_TARGET_HEIGHT = 1080
QUALITY = 78

def optimize_image(input_path, output_path, target_width, target_height, quality=QUALITY):
    """Resize and compress image to target dimensions."""
    print(f"\n📷 Processing: {input_path.name}")
    
    # Open image
    img = Image.open(input_path)
    original_size = input_path.stat().st_size / 1024  # KB
    
    print(f"   Original: {img.width}x{img.height} - {original_size:.2f} KB")
    
    # Resize if needed
    if img.width != target_width or img.height != target_height:
        img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        print(f"   Resized to: {target_width}x{target_height}")
    
    # Save with WebP compression
    img.save(output_path, 'WEBP', quality=quality, method=6)
    
    new_size = output_path.stat().st_size / 1024  # KB
    savings = ((original_size - new_size) / original_size) * 100
    
    print(f"   New size: {new_size:.2f} KB")
    print(f"   ✅ Saved: {original_size - new_size:.2f} KB ({savings:.1f}% reduction)")
    
    return original_size, new_size

def main():
    print("🚀 Hero Image Optimization Script")
    print("=" * 50)
    
    # Check if Pillow is installed
    try:
        from PIL import Image
    except ImportError:
        print("❌ Error: Pillow not installed")
        print("   Run: pip install Pillow")
        return
    
    # Get all hero images
    mobile_images = list(HERO_DIR.glob("*-mobile.webp"))
    desktop_images = [img for img in HERO_DIR.glob("*.webp") if "-mobile" not in img.name]
    
    print(f"\n📊 Found {len(mobile_images)} mobile + {len(desktop_images)} desktop images")
    
    total_original = 0
    total_optimized = 0
    
    # Optimize mobile images
    print("\n" + "=" * 50)
    print("MOBILE IMAGES (720x1280)")
    print("=" * 50)
    
    for img_path in sorted(mobile_images):
        backup_path = img_path.with_suffix('.webp.backup')
        
        # Create backup if it doesn't exist
        if not backup_path.exists():
            import shutil
            shutil.copy2(img_path, backup_path)
            print(f"   💾 Backup created: {backup_path.name}")
        
        orig, new = optimize_image(img_path, img_path, MOBILE_TARGET_WIDTH, MOBILE_TARGET_HEIGHT)
        total_original += orig
        total_optimized += new
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 OPTIMIZATION SUMMARY")
    print("=" * 50)
    print(f"Total original size: {total_original:.2f} KB")
    print(f"Total optimized size: {total_optimized:.2f} KB")
    print(f"Total savings: {total_original - total_optimized:.2f} KB ({((total_original - total_optimized) / total_original) * 100:.1f}%)")
    print(f"\n✅ Optimization complete!")
    print(f"   Backups saved with .backup extension")
    print(f"   To rollback: rename .webp.backup files back to .webp")

if __name__ == "__main__":
    main()
