import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
from collections import Counter

def explore_dataset(data_dir='dataset'):
    print("=" * 60)
    print("DATASET EXPLORATION")
    print("=" * 60)
    
    if not os.path.exists(data_dir):
        print(f"Error: Dataset directory '{data_dir}' not found!")
        return
    
    # Check subdirectories (classes)
    classes = [d for d in os.listdir(data_dir) 
               if os.path.isdir(os.path.join(data_dir, d)) and d != 'raw']
    
    if not classes:
        print(f"No class directories found in '{data_dir}'")
        return
    
    print(f"\nFound {len(classes)} classes:")
    for class_name in classes:
        class_path = os.path.join(data_dir, class_name)
        image_count = len([f for f in os.listdir(class_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        print(f"  - {class_name}: {image_count} images")
    
    print("\n" + "=" * 60)
    print("SAMPLE IMAGES")
    print("=" * 60)
    
    # Display sample images
    for class_name in classes:
        class_path = os.path.join(data_dir, class_name)
        images = [f for f in os.listdir(class_path) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        if images:
            sample_img = os.path.join(class_path, images[0])
            try:
                img = tf.keras.utils.load_img(sample_img)
                img_array = tf.keras.utils.img_to_array(img)
                print(f"\nClass: {class_name}")
                print(f"  Sample: {images[0]}")
                print(f"  Shape: {img_array.shape}")
                print(f"  Min/Max: {img_array.min():.2f} / {img_array.max():.2f}")
                
                # Plot sample images (optional)
                fig, axes = plt.subplots(1, min(3, len(images)), figsize=(12, 4))
                fig.suptitle(f'Class: {class_name}', fontsize=14)
                
                for i, ax in enumerate(axes):
                    if i < len(images):
                        img_path = os.path.join(class_path, images[i])
                        img = tf.keras.utils.load_img(img_path)
                        ax.imshow(img)
                        ax.set_title(images[i][:20] + '...')
                        ax.axis('off')
                
                plt.tight_layout()
                plt.savefig(f'output/{class_name}_samples.png', dpi=100, bbox_inches='tight')
                plt.close()
                print(f"  Saved samples to: output/{class_name}_samples.png")
                
            except Exception as e:
                print(f"  Error loading {images[0]}: {e}")
    
    print("\n" + "=" * 60)
    print("DATASET STATISTICS")
    print("=" * 60)
    
    # Collect all image sizes
    sizes = []
    formats = []
    
    for class_name in classes:
        class_path = os.path.join(data_dir, class_name)
        images = [f for f in os.listdir(class_path) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img_name in images:
            img_path = os.path.join(class_path, img_name)
            try:
                img = tf.keras.utils.load_img(img_path)
                img_array = tf.keras.utils.img_to_array(img)
                sizes.append(img_array.shape[:2])
                formats.append(img_name.split('.')[-1].lower())
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
    
    if sizes:
        sizes = np.array(sizes)
        print(f"\nTotal images: {len(sizes)}")
        print(f"Image formats: {Counter(formats)}")
        print(f"Size range: {sizes.min(axis=0)} to {sizes.max(axis=0)}")
        print(f"Mean size: {sizes.mean(axis=0).astype(int)}")
        print(f"Median size: {np.median(sizes, axis=0).astype(int)}")
    
    print("\n" + "=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    
    if len(sizes) > 0:
        print(f"\nRecommended target size: {tuple(np.median(sizes, axis=0).astype(int))}")
        print(f"or standard sizes: (224, 224), (256, 256), or (299, 299)")
    
    total_images = sum([len([f for f in os.listdir(os.path.join(data_dir, c)) 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png'))]) 
                       for c in classes])
    
    if total_images < 100:
        print("\n⚠️  Warning: Dataset is small (<100 images)")
        print("   Consider data augmentation or collecting more images")
    elif total_images < 1000:
        print("\nℹ️  Dataset is moderate (100-1000 images)")
        print("   Data augmentation is recommended")
    else:
        print("\n✓ Dataset is sufficient (>1000 images)")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    import numpy as np
    import sys
    
    os.makedirs('output', exist_ok=True)
    
    data_dir = 'dataset'
    if len(sys.argv) > 1:
        data_dir = sys.argv[1]
    
    explore_dataset(data_dir)
