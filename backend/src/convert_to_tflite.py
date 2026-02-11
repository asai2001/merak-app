import os
import tensorflow as tf

def convert_to_tflite(model_path, output_path='models/peacock_egg_classifier.tflite', quantization=None):
    """
    Convert Keras model to TFLite format
    
    Args:
        model_path: Path to Keras model (.h5 file)
        output_path: Path to save TFLite model
        quantization: Type of quantization (None, 'float16', 'dynamic', 'full_integer')
    
    Returns:
        Path to saved TFLite model
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    print("Converting model to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    if quantization == 'float16':
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
    elif quantization == 'dynamic':
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
    elif quantization == 'full_integer':
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    
    tflite_model = converter.convert()
    
    print(f"Saving TFLite model to {output_path}...")
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"Model converted successfully!")
    print(f"TFLite model size: {len(tflite_model) / (1024 * 1024):.2f} MB")
    
    return output_path

def convert_to_tfjs(tflite_path, output_dir):
    """
    Convert TFLite model to TensorFlow.js format
    
    Args:
        tflite_path: Path to TFLite model
        output_dir: Directory to save TFJS model
    
    Returns:
        Path to saved TFJS model
    """
    print(f"Converting TFLite to TFJS...")
    
    try:
        import tensorflowjs as tfjs
        tfjs_converter = tfjs.converters
        
        os.makedirs(output_dir, exist_ok=True)
        
        tfjs_converter.convert(
            tf_lite_model=tflite_path,
            output_dir=output_dir
        )
        
        print(f"TFJS model saved to {output_dir}")
        return output_dir
    except ImportError:
        print("tensorflowjs not installed. Install with: pip install tensorflowjs")
        return None

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert Keras model to TFLite/TFJS format')
    parser.add_argument('--model_path', type=str, default='models/best_model.h5', help='Path to Keras model')
    parser.add_argument('--output_tflite', type=str, default='models/peacock_egg_classifier.tflite', help='Output TFLite path')
    parser.add_argument('--quantization', type=str, default=None, 
                        choices=[None, 'float16', 'dynamic', 'full_integer'], help='Quantization type')
    parser.add_argument('--convert_to_tfjs', action='store_true', help='Convert to TFJS format')
    parser.add_argument('--tfjs_output', type=str, default='../web/public/models/peacock_egg_classifier_tfjs', 
                        help='TFJS output directory')
    
    args = parser.parse_args()
    
    tflite_path = convert_to_tflite(
        model_path=args.model_path,
        output_path=args.output_tflite,
        quantization=args.quantization
    )
    
    if args.convert_to_tfjs:
        convert_to_tfjs(tflite_path, args.tfjs_output)
