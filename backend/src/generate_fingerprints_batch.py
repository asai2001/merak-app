import os
import json
from PIL import Image
import numpy as np
from pathlib import Path
from datetime import datetime
import sys

def generate_custom_hashes(img_array):
    """
    Generate custom hashes matching frontend implementation
    Mirrors: web/src/utils/imageMatcher.ts
    """
    if len(img_array.shape) == 3:
        grayscale = np.mean(img_array, axis=2)
    else:
        grayscale = img_array
    
    grayscale_flat = grayscale.flatten()
    grayscale_256 = grayscale_flat[:256]
    average = np.mean(grayscale_256)
    
    phash = ''.join(['1' if grayscale_256[i] >= average else '0' 
                      for i in range(len(grayscale_256))])
    dhash = ''.join(['1' if grayscale_256[i + 1] >= grayscale_256[i] else '0' 
                      for i in range(len(grayscale_256) - 1)])
    ahash = ''.join(['1' if grayscale_256[i] >= 128 else '0' 
                      for i in range(len(grayscale_256))])
    
    return {
        'phash': phash.ljust(64, '0'),
        'dhash': dhash.ljust(64, '0'),
        'ahash': ahash.ljust(64, '0'),
        'whash': '0' * 64
    }

def generate_fingerprints_batch(data_dir='dataset', output_file='web/public/dataset_fingerprints.json', batch_size=100):
    
    data_dir = os.path.abspath(data_dir)
    
    if not os.path.exists(data_dir):
        print(f"ERROR: Dataset directory not found: {data_dir}")
        return None
    """
    Generate image fingerprints in batches to handle large datasets
    """
    
    class_dirs = ['fertil', 'infertil']
    fingerprints = {
        'metadata': {
            'version': '2.0',
            'generated_at': datetime.now().isoformat(),
            'total_images': 0,
            'threshold': 0.99,
            'algorithm': 'custom-mirroring-frontend'
        },
        'images': []
    }
    
    total_count = 0
    
    for class_dir_name in class_dirs:
        class_path = os.path.join(data_dir, class_dir_name)
        
        if not os.path.exists(class_path):
            print(f"Warning: {class_path} not found, skipping...")
            continue
        
        print(f"\n{'='*60}")
        print(f"Processing {class_dir_name} images...")
        print(f"{'='*60}")
        
        image_files = [f for f in os.listdir(class_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        
        print(f"Total images found: {len(image_files)}")
        print(f"Batch size: {batch_size}")
        print(f"Will process in {(len(image_files) + batch_size - 1) // batch_size} batches\n")
        
        for batch_start in range(0, len(image_files), batch_size):
            batch_end = min(batch_start + batch_size, len(image_files))
            batch_files = image_files[batch_start:batch_end]
            
            print(f"Processing batch {batch_start//batch_size + 1}: images {batch_start+1}-{batch_end}")
            
            for idx, filename in enumerate(batch_files, start=batch_start + 1):
                try:
                    image_path = os.path.join(class_path, filename)
                    
                    img = Image.open(image_path)
                    
                    img_resized = img.resize((224, 224), Image.LANCZOS)
                    img_array = np.array(img_resized)
                    hashes = generate_custom_hashes(img_array)
                    
                    width, height = img.size
                    
                    fingerprint_entry = {
                        'filename': f"{class_dir_name}/{filename}",
                        'class': class_dir_name.replace('fertil', 'fertile'),
                        'original_filename': filename,
                        'width': width,
                        'height': height,
                        'hashes': hashes
                    }
                    
                    fingerprints['images'].append(fingerprint_entry)
                    total_count += 1
                    
                    if total_count % 50 == 0:
                        print(f"  Progress: {total_count} images processed", flush=True)
                    
                    img.close()
                    img_resized.close()
                    
                except Exception as e:
                    print(f"  ERROR processing {filename}: {str(e)[:100]}")
                    continue
            
            print(f"  Batch {batch_start//batch_size + 1} completed")
            
            # Save intermediate results
            if batch_end % 200 == 0:
                intermediate_file = output_file.replace('.json', f'_temp_{batch_end}.json')
                os.makedirs(os.path.dirname(intermediate_file) if os.path.dirname(intermediate_file) else '.', exist_ok=True)
                fingerprints['metadata']['total_images'] = total_count
                with open(intermediate_file, 'w', encoding='utf-8') as f:
                    json.dump(fingerprints, f, indent=2)
                print(f"  Intermediate save: {intermediate_file}")
    
    fingerprints['metadata']['total_images'] = total_count
    
    os.makedirs(os.path.dirname(output_file) if os.path.dirname(output_file) else '.', exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"Saving final results...")
    print(f"{'='*60}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fingerprints, f, indent=2)
    
    file_size_kb = os.path.getsize(output_file) / 1024
    
    print(f"\n{'='*60}")
    print(f"Fingerprints generated successfully!")
    print(f"{'='*60}")
    print(f"  Total images: {total_count}")
    print(f"  Output file: {output_file}")
    print(f"  File size: {file_size_kb:.2f} KB")
    print(f"  Average per image: {file_size_kb/total_count:.2f} KB")
    
    return fingerprints

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate image fingerprints for dataset')
    parser.add_argument('--data_dir', type=str, default='dataset', help='Path to dataset directory')
    parser.add_argument('--output', type=str, default='web/public/dataset_fingerprints.json', help='Output JSON file path')
    parser.add_argument('--batch_size', type=int, default=100, help='Batch size for processing')
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("Peacock Egg Detector - Fingerprint Generation")
    print("="*60 + "\n")
    
    generate_fingerprints_batch(args.data_dir, args.output, args.batch_size)
