import os

def check_dataset():
    print("=" * 60)
    print("DATASET CHECK")
    print("=" * 60)
    
    dataset_path = "dataset"
    
    if not os.path.exists(dataset_path):
        print(f"[X] Dataset folder not found: {dataset_path}")
        return False
    
    print(f"[OK] Dataset folder found: {dataset_path}")
    
    # Check for class folders
    classes = ['fertil', 'infertil']
    class_counts = {}
    
    for class_name in classes:
        class_path = os.path.join(dataset_path, class_name)
        if os.path.exists(class_path):
            images = [f for f in os.listdir(class_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            class_counts[class_name] = len(images)
            print(f"[OK] {class_name}: {len(images)} images")
        else:
            print(f"[X] {class_name}: folder not found")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    total = sum(class_counts.values())
    print(f"Total images: {total}")
    
    if total > 0:
        print(f"Images per class:")
        for class_name, count in class_counts.items():
            print(f"  {class_name}: {count}")
        
        if total < 100:
            print("\n[!] Warning: Dataset is small (<100 images)")
            print("   Consider adding more images or using data augmentation.")
        elif total < 500:
            print("\n[i] Dataset is moderate (100-500 images)")
            print("   Data augmentation is recommended during training.")
        else:
            print("\n[OK] Dataset size is good!")
        
        return True
    else:
        print("\n[X] No images found in dataset!")
        return False

if __name__ == "__main__":
    check_dataset()
