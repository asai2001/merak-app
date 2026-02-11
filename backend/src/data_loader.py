import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import os

def load_data(data_dir, img_size=(224, 224), batch_size=32, validation_split=0.2):
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.2,
        shear_range=0.15,
        brightness_range=[0.7, 1.3],
        fill_mode='nearest',
        validation_split=validation_split
    )
    
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    validation_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    return train_generator, validation_generator

def load_test_data(test_dir, img_size=(224, 224), batch_size=32):
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )
    
    return test_generator

def get_class_weights(data_dir, method='balanced'):
    fertil_count = len([f for f in os.listdir(os.path.join(data_dir, 'fertil')) if f.endswith('.jpg')])
    infertil_count = len([f for f in os.listdir(os.path.join(data_dir, 'infertil')) if f.endswith('.jpg')])
    
    total = fertil_count + infertil_count
    
    if method == 'aggressive':
        weight_fertil = 1.0
        weight_infertil = (fertil_count / infertil_count) * 1.5
    elif method == 'inverse':
        weight_fertil = 1.0 / (fertil_count / total)
        weight_infertil = 1.0 / (infertil_count / total)
    else:
        weight_fertil = total / (2 * fertil_count)
        weight_infertil = total / (2 * infertil_count)
    
    print(f"Class Weights ({method}):")
    print(f"  Fertil: {weight_fertil:.2f} (count: {fertil_count})")
    print(f"  Infertil: {weight_infertil:.2f} (count: {infertil_count})")
    print(f"  Ratio: {weight_infertil/weight_fertil:.2f}:1")
    
    class_weights = {
        0: weight_fertil, 
        1: weight_infertil
    }
    
    return class_weights

def get_class_mapping(data_dir):
    """Get class labels mapping"""
    fertil_count = len([f for f in os.listdir(os.path.join(data_dir, 'fertil')) if f.endswith('.jpg')])
    infertil_count = len([f for f in os.listdir(os.path.join(data_dir, 'infertil')) if f.endswith('.jpg')])
    
    print(f"\n=== Class Balance Analysis ===")
    print(f"Fertil images:   {fertil_count:4d} ({fertil_count/(fertil_count+infertil_count)*100:.1f}%)")
    print(f"Infertil images: {infertil_count:4d} ({infertil_count/(fertil_count+infertil_count)*100:.1f}%)")
    print(f"Total images:    {fertil_count+infertil_count:4d}")
    print(f"Class ratio:     {fertil_count}/{infertil_count} = {fertil_count/infertil_count:.2f}:1")
    
    imbalance_ratio = fertil_count / infertil_count
    if imbalance_ratio > 2.0:
        print(f"WARNING: Severe class imbalance detected!")
        print(f"Model will be biased toward 'fertil' class.")
        print(f"Recommendation: Add more 'infertil' images or use aggressive class weights.")
    
    return {
        'fertil_count': fertil_count,
        'infertil_count': infertil_count,
        'imbalance_ratio': imbalance_ratio,
        'is_imbalanced': imbalance_ratio > 2.0
    }
