from PIL import Image
import os

# Configuration
SOURCE_DIR = 'public/hero'
TARGET_WIDTH = 720
TARGET_HEIGHT = 1280
ASPECT_RATIO = TARGET_WIDTH / TARGET_HEIGHT
QUALITY = 80

images = ['silk', 'feather', 'glass', 'liquid', 'smoke']

def crop_center_and_resize(img_path):
    with Image.open(img_path) as img:
        # Calculate current aspect ratio
        img_width, img_height = img.size
        img_ratio = img_width / img_height
        
        # Determine crop box (Center Crop to Target Aspect Ratio)
        if img_ratio > ASPECT_RATIO:
            # Image is too wide
            new_width = int(img_height * ASPECT_RATIO)
            offset = (img_width - new_width) // 2
            box = (offset, 0, offset + new_width, img_height)
        else:
            # Image is too tall (unlikely for desktops backgrounds but possible)
            new_height = int(img_width / ASPECT_RATIO)
            offset = (img_height - new_height) // 2
            box = (0, offset, img_width, offset + new_height)
            
        cropped_img = img.crop(box)
        
        # Resize to target dimensions
        resized_img = cropped_img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
        
        return resized_img

def main():
    print(f"Starting optimization for {len(images)} images...")
    
    for name in images:
        source_path = os.path.join(SOURCE_DIR, f"{name}.webp")
        target_path = os.path.join(SOURCE_DIR, f"{name}-mobile.webp")
        
        if not os.path.exists(source_path):
            print(f"Skipping {name}: Source not found.")
            continue
            
        try:
            print(f"Processing {name}...")
            final_img = crop_center_and_resize(source_path)
            final_img.save(target_path, 'WEBP', quality=QUALITY)
            print(f"Saved: {target_path}")
        except Exception as e:
            print(f"Error processing {name}: {e}")

if __name__ == "__main__":
    main()
