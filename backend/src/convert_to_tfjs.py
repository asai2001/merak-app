import tensorflow as tf
import os

def convert_to_tensorflowjs(h5_model_path='models/best_model.h5', output_dir='web/public/models'):
    """
    Convert Keras model to TensorFlow.js format
    
    Args:
        h5_model_path: Path to trained Keras model (.h5 file)
        output_dir: Directory to save TensorFlow.js model
    """
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(h5_model_path):
        print(f"ERROR: Model file '{h5_model_path}' not found!")
        print("Please train the model first using: python src/train.py")
        return False
    
    print(f"Loading model from {h5_model_path}...")
    model = tf.keras.models.load_model(h5_model_path)
    
    print(f"Model loaded successfully!")
    print(f"Input shape: {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    
    print(f"\nConverting model to TensorFlow.js format...")
    
    try:
        import tensorflowjs as tfjs
        
        tfjs.converters.save_keras_model(model, output_dir)
        
        print(f"\nModel converted successfully!")
        print(f"Saved to: {output_dir}/")
        print(f"\nFiles created:")
        for file in os.listdir(output_dir):
            print(f"  - {file}")
        
        return True
        
    except ImportError:
        print("ERROR: tensorflowjs not installed!")
        print("Install with: pip install tensorflowjs")
        return False
    except Exception as e:
        print(f"ERROR: Conversion failed - {e}")
        return False

def convert_to_tflite(h5_model_path='models/best_model.h5', output_path='models/model.tflite'):
    """
    Convert Keras model to TFLite format for mobile deployment
    
    Args:
        h5_model_path: Path to trained Keras model (.h5 file)
        output_path: Path to save TFLite model
    """
    if not os.path.exists(h5_model_path):
        print(f"ERROR: Model file '{h5_model_path}' not found!")
        return False
    
    print(f"Loading model from {h5_model_path}...")
    model = tf.keras.models.load_model(h5_model_path)
    
    print(f"\nConverting model to TFLite format...")
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float32]
    
    tflite_model = converter.convert()
    
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"TFLite model saved to: {output_path}")
    
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Model size: {size_kb:.2f} KB")
    
    return True

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert model for deployment')
    parser.add_argument('--input', type=str, default='models/best_model.h5', help='Path to input model')
    parser.add_argument('--format', type=str, choices=['tfjs', 'tflite', 'both'], default='both', help='Output format')
    parser.add_argument('--output_dir', type=str, default='models/tfjs', help='Output directory for TFJS')
    parser.add_argument('--tflite_output', type=str, default='models/model.tflite', help='Output path for TFLite')
    
    args = parser.parse_args()
    
    if args.format in ['tfjs', 'both']:
        print("=== Converting to TensorFlow.js ===")
        convert_to_tensorflowjs(args.input, args.output_dir)
    
    if args.format in ['tflite', 'both']:
        print("\n=== Converting to TFLite ===")
        convert_to_tflite(args.input, args.tflite_output)
