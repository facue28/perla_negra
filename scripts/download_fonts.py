#!/usr/bin/env python3
"""
Download Google Fonts using google-webfonts-helper API.
"""

import requests
import json
from pathlib import Path

FONTS_DIR = Path("public/fonts")
FONTS_DIR.mkdir(exist_ok=True)

# google-webfonts-helper API
API_BASE = "https://gwfh.mranftl.com/api/fonts"

def download_outfit_fonts():
    print("🔤 Downloading Outfit fonts from google-webfonts-helper...")
    
    # Get Outfit font data
    response = requests.get(f"{API_BASE}/outfit")
    if response.status_code != 200:
        print(f"❌ Failed to fetch font data: {response.status_code}")
        return
    
    font_data = response.json()
    
    # We need weights: 300, 400 (regular), 600
    weights_needed = ['300', 'regular', '600']
    
    for variant in font_data['variants']:
        weight = variant['id']
        
        if weight not in weights_needed:
            continue
        
        # Get WOFF2 file (best compression)
        woff2_url = None
        for format_type, url in variant.items():
            if format_type == 'woff2':
                woff2_url = url
                break
        
        if not woff2_url:
            print(f"   ⚠️  No WOFF2 found for weight {weight}")
            continue
        
        # Full URL
        full_url = f"https://gwfh.mranftl.com{woff2_url}"
        
        # Filename
        weight_name = weight if weight != 'regular' else '400'
        filename = f"outfit-v11-latin-{weight_name}.woff2"
        filepath = FONTS_DIR / filename
        
        # Download
        print(f"   ⬇️  Downloading {filename}...")
        font_response = requests.get(full_url)
        
        if font_response.status_code == 200:
            filepath.write_bytes(font_response.content)
            size_kb = len(font_response.content) / 1024
            print(f"   ✅ Saved: {filename} ({size_kb:.2f} KB)")
        else:
            print(f"   ❌ Failed to download {filename}: {font_response.status_code}")
    
    print("\n✅ Font download complete!")

if __name__ == "__main__":
    download_outfit_fonts()
