import os
import numpy as np
from utils import plot_confusion_matrix, calculate_metrics, save_metrics
from data_loader import load_test_data

def evaluate_model(model_path, test_dir, batch_size=32, img_size=(224, 224)):
    """
    Evaluate the trained model on test data
    
    Args:
        model_path: Path to trained model file
        test_dir: Path to test data directory
        batch_size: Batch size for evaluation
        img_size: Target image size
    
    Returns:
        Dictionary of evaluation metrics
    """
    import tensorflow as tf
    
    os.makedirs('output', exist_ok=True)
    
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    print("Loading test data...")
    test_generator = load_test_data(
        test_dir=test_dir,
        img_size=img_size,
        batch_size=batch_size
    )
    
    print(f"Test samples: {test_generator.samples}")
    
    print("\nEvaluating model...")
    test_loss, test_acc, test_precision, test_recall = model.evaluate(test_generator, verbose=1)
    
    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}")
    print(f"Test Precision: {test_precision:.4f}")
    print(f"Test Recall: {test_recall:.4f}")
    
    predictions = model.predict(test_generator)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_generator.classes
    
    class_names = list(test_generator.class_indices.keys())
    
    plot_confusion_matrix(
        y_true=y_true,
        y_pred=y_pred,
        class_names=class_names,
        save_path='output/confusion_matrix.png'
    )
    
    metrics = calculate_metrics(y_true, y_pred)
    save_metrics(metrics, save_path='output/metrics.txt')
    
    return metrics

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Evaluate CNN model for peacock egg classification')
    parser.add_argument('--model_path', type=str, default='models/best_model.h5', help='Path to model file')
    parser.add_argument('--test_dir', type=str, default='dataset', help='Path to test data directory')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--img_size', type=int, nargs=2, default=[224, 224], help='Image size')
    
    args = parser.parse_args()
    
    metrics = evaluate_model(
        model_path=args.model_path,
        test_dir=args.test_dir,
        batch_size=args.batch_size,
        img_size=tuple(args.img_size)
    )
