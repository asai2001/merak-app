import os
import json
from PIL import Image
import imagehash
from pathlib import Path

def generate_fingerprints(data_dir='dataset', output_file='web/public/dataset_fingerprints.json'):
    """
    Generate image fingerprints for all images in dataset
    
    Args:
        data_dir: Path to dataset directory (fertil/infertil subdirs)
        output_file: Path to output JSON file
    """
    
    class_dirs = ['fertil', 'infertil']
    fingerprints = {
        'metadata': {
            'version': '1.0',
            'generated_at': None,
            'total_images': 0,
            'threshold': 0.99
        },
        'images': []
    }
    
    from datetime import datetime
    fingerprints['metadata']['generated_at'] = datetime.now().isoformat()
    
    total_count = 0
    
    for class_dir in class_dirs:
        class_path = os.path.join(data_dir, class_dir)
        
        if not os.path.exists(class_path):
            print(f"Warning: {class_path} not found, skipping...")
            continue
        
        print(f"\nProcessing {class_dir} images...")
        
        image_files = [f for f in os.listdir(class_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        
        print(f"  Found {len(image_files)} images")
        
        for idx, filename in enumerate(image_files):
            try:
                image_path = os.path.join(class_path, filename)
                
                img = Image.open(image_path)
                
                phash = str(imagehash.phash(img, hash_size=16))
                ahash = str(imagehash.average_hash(img, hash_size=16))
                dhash = str(imagehash.dhash(img, hash_size=16))
                whash = str(imagehash.whash(img, hash_size=16))
                
                width, height = img.size
                
                fingerprint_entry = {
                    'filename': f"{class_dir}/{filename}",
                    'class': class_dir.replace('fertil', 'fertile'),
                    'original_filename': filename,
                    'width': width,
                    'height': height,
                    'hashes': {
                        'phash': phash,
                        'ahash': ahash,
                        'dhash': dhash,
                        'whash': whash
                    }
                }
                
                fingerprints['images'].append(fingerprint_entry)
                total_count += 1
                
                if (idx + 1) % 50 == 0:
                    print(f"  Processed {idx + 1}/{len(image_files)} images")
                
                img.close()
                
            except Exception as e:
                print(f"  Error processing {filename}: {e}")
                continue
    
    fingerprints['metadata']['total_images'] = total_count
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fingerprints, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"✓ Fingerprints generated successfully!")
    print(f"{'='*60}")
    print(f"  Total images: {total_count}")
    print(f"  Output file: {output_file}")
    print(f"  File size: {os.path.getsize(output_file) / 1024:.2f} KB")
    
    return fingerprints

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate image fingerprints for dataset')
    parser.add_argument('--data_dir', type=str, default='dataset', help='Path to dataset directory')
    parser.add_argument('--output', type=str, default='web/public/dataset_fingerprints.json', help='Output JSON file path')
    
    args = parser.parse_args()
    
    generate_fingerprints(args.data_dir, args.output)
