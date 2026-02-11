import os
from model import create_cnn_model, create_pretrained_model, compile_model
from data_loader import load_data, get_class_weights, get_class_mapping
from utils import plot_training_history, create_callbacks

def train_model(data_dir, epochs=100, batch_size=32, img_size=(224, 224), learning_rate=0.0001, use_pretrained=False, class_weight_method='aggressive', fine_tune_layers=20):
    """
    Train CNN model
    
    Args:
        data_dir: Path to training data directory
        epochs: Number of training epochs
        batch_size: Batch size for training
        img_size: Target image size
        learning_rate: Learning rate for optimizer
        use_pretrained: Use pretrained model (EfficientNetB0)
        class_weight_method: Method for calculating class weights ('balanced', 'aggressive', 'inverse')
    
    Returns:
        Training history and trained model
    """
    os.makedirs('models', exist_ok=True)
    os.makedirs('output', exist_ok=True)
    
    print("=== Peacock Egg Fertility Detection Training ===\n")
    
    print("Loading data...")
    train_generator, val_generator = load_data(
        data_dir=data_dir,
        img_size=img_size,
        batch_size=batch_size,
        validation_split=0.2
    )
    
    print(f"\nDataset Summary:")
    print(f"  Training samples: {train_generator.samples}")
    print(f"  Validation samples: {val_generator.samples}")
    print(f"  Classes: {train_generator.class_indices}")
    print(f"  Number of classes: {train_generator.num_classes}")
    
    num_classes = train_generator.num_classes
    
    print("\n=== Class Balance Analysis ===")
    balance_info = get_class_mapping(data_dir)
    
    if balance_info['is_imbalanced']:
        print("\nIMPORTANT: Using aggressive class weights to handle imbalance!")
        print("This will give more weight to the minority class (infertil).")
        print("For best results, collect more infertil egg images.")
    
    print(f"\nCalculating class weights (method: {class_weight_method})...")
    class_weights = get_class_weights(data_dir, method=class_weight_method)
    
    print("\nCreating model...")
    if use_pretrained:
        print("Using pretrained EfficientNetB0 model with fine-tuning (recommended for imbalanced datasets)...")
        model = create_pretrained_model(input_shape=(img_size[0], img_size[1], 3), num_classes=num_classes, fine_tune_layers=fine_tune_layers)
        
        print("\nUnfreezing last layers for fine-tuning...")
        base_model = model.layers[0]
        for i, layer in enumerate(base_model.layers[-fine_tune_layers:]):
            layer.trainable = True
            print(f"  Unfrozen: {layer.name} (layer {i - fine_tune_layers})")
    else:
        print("Using custom CNN model...")
        model = create_cnn_model(input_shape=(img_size[0], img_size[1], 3), num_classes=num_classes)
    
    model = compile_model(model, learning_rate=learning_rate)
    
    print(model.summary())
    
    print("\n=== Starting Training ===")
    print(f"Configuration:")
    print(f"  - Epochs: {epochs}")
    print(f"  - Batch Size: {batch_size}")
    print(f"  - Learning Rate: {learning_rate}")
    print(f"  - Model: {'EfficientNetB0 (pretrained)' if use_pretrained else 'Custom CNN'}")
    print(f"  - Class Weight Method: {class_weight_method}")
    
    callbacks = create_callbacks(model_save_path='models/best_model.h5', patience=15)
    
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )
    
    print("\n=== Training Completed ===")
    
    print("\nFinal Metrics:")
    final_train_acc = max(history.history['accuracy'])
    final_val_acc = max(history.history['val_accuracy'])
    print(f"  Best Training Accuracy: {final_train_acc:.2%}")
    print(f"  Best Validation Accuracy: {final_val_acc:.2%}")
    print(f"  Overfitting Gap: {(final_train_acc - final_val_acc)*100:.2f}%")
    
    if final_val_acc < 0.70:
        print("\nWARNING: Validation accuracy is low (<70%)")
        print("Consider:")
        print("  1. Adding more infertil images (currently highly imbalanced)")
        print("  2. Using more aggressive data augmentation")
        print("  3. Training for more epochs")
        print("  4. Using pretrained model with fine-tuning")
    elif final_val_acc < 0.80:
        print("\nNOTICE: Validation accuracy is moderate (70-80%)")
        print("Can be improved by:")
        print("  1. Adding more infertil images")
        print("  2. Fine-tuning the model")
    else:
        print(f"\nGood accuracy achieved ({final_val_acc:.2%})!")
    
    plot_training_history(history, save_path='output/training_history.png')
    
    return history, model

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train CNN model for peacock egg fertility classification')
    parser.add_argument('--data_dir', type=str, default='dataset', help='Path to dataset directory')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--img_size', type=int, nargs=2, default=[224, 224], help='Image size')
    parser.add_argument('--learning_rate', type=float, default=0.0001, help='Learning rate')
    parser.add_argument('--pretrained', action='store_true', help='Use pretrained model (EfficientNetB0)')
    parser.add_argument('--class_weights', type=str, default='aggressive', 
                       choices=['balanced', 'aggressive', 'inverse'],
                       help='Class weight calculation method (default: aggressive for imbalanced datasets)')
    parser.add_argument('--fine_tune', type=int, default=20, 
                       help='Number of layers to unfreeze for fine-tuning pretrained models (default: 20)')
    
    args = parser.parse_args()
    
    print(f"\n{'='*60}")
    print("Peacock Egg Fertility Detection - Model Training")
    print(f"{'='*60}\n")
    
    history, model = train_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        img_size=tuple(args.img_size),
        learning_rate=args.learning_rate,
        use_pretrained=args.pretrained,
        class_weight_method=args.class_weights,
        fine_tune_layers=args.fine_tune
    )
