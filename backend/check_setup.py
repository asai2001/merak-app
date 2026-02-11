import os
import sys

sys.path.append('src')

def test_setup():
    print("=== Testing Dataset Setup ===\n")
    
    data_dir = 'dataset'
    
    if not os.path.exists(data_dir):
        print(f"ERROR: Dataset directory '{data_dir}' not found!")
        return False
    
    fertil_dir = os.path.join(data_dir, 'fertil')
    infertil_dir = os.path.join(data_dir, 'infertil')
    
    if not os.path.exists(fertil_dir):
        print(f"ERROR: 'fertil' directory not found!")
        return False
    
    if not os.path.exists(infertil_dir):
        print(f"ERROR: 'infertil' directory not found!")
        return False
    
    fertil_images = [f for f in os.listdir(fertil_dir) if f.endswith('.jpg')]
    infertil_images = [f for f in os.listdir(infertil_dir) if f.endswith('.jpg')]
    
    print(f"Dataset Statistics:")
    print(f"  Fertil images: {len(fertil_images)}")
    print(f"  Infertil images: {len(infertil_images)}")
    print(f"  Total images: {len(fertil_images) + len(infertil_images)}")
    print(f"  Class ratio: {len(fertil_images)}/{len(infertil_images)} = {len(fertil_images)/len(infertil_images):.2f}:1")
    
    print(f"\nChecking for TensorFlow...")
    try:
        import tensorflow as tf
        print(f"  TensorFlow version: {tf.__version__}")
        print(f"  GPU Available: {tf.config.list_physical_devices('GPU') != []}")
    except ImportError:
        print("  ERROR: TensorFlow not installed!")
        return False
    
    print(f"\nChecking for other dependencies...")
    try:
        import numpy as np
        print(f"  NumPy version: {np.__version__}")
    except ImportError:
        print("  WARNING: NumPy not installed!")
    
    try:
        import matplotlib
        print(f"  Matplotlib version: {matplotlib.__version__}")
    except ImportError:
        print("  WARNING: Matplotlib not installed!")
    
    try:
        from sklearn import metrics
        print(f"  scikit-learn available")
    except ImportError:
        print("  WARNING: scikit-learn not installed!")
    
    print("\n=== Setup Complete ===")
    print("\nYou can now run training with:")
    print("  python src/train.py --data_dir dataset --epochs 100")
    print("\nOr with pretrained model:")
    print("  python src/train.py --data_dir dataset --epochs 100 --pretrained")
    
    return True

if __name__ == "__main__":
    test_setup()
