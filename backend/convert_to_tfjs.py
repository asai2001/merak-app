"""
Convert Keras model to TensorFlow.js format.
Uses manual weight extraction to bypass tensorflowjs package issues.
"""
import os
import sys
import json
import struct
import numpy as np


def convert_model():
    print("=" * 60)
    print("Converting Keras model to TFJS Layers format")
    print("=" * 60)
    
    import tensorflow as tf
    
    model_path = 'models/best_model.h5'
    output_dir = '../web/public/tfjs_model'
    
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found: {model_path}")
        return False
    
    # Load model
    print(f"\nLoading model: {model_path}")
    model = tf.keras.models.load_model(model_path)
    print(f"Input shape: {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    print(f"Layers: {len(model.layers)}")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract weights and build topology
    weights_manifest = []
    weights_data = bytearray()
    weight_specs = []
    
    for layer in model.layers:
        layer_weights = layer.get_weights()
        if not layer_weights:
            continue
        
        weight_names = [w.name for w in layer.weights]
        
        for w_val, w_name in zip(layer_weights, weight_names):
            w_array = np.array(w_val, dtype=np.float32)
            
            spec = {
                'name': w_name,
                'shape': list(w_array.shape),
                'dtype': 'float32'
            }
            weight_specs.append(spec)
            
            # Append weight data
            weights_data.extend(w_array.tobytes())
    
    # Write weights binary file
    weights_bin_path = os.path.join(output_dir, 'group1-shard1of1.bin')
    with open(weights_bin_path, 'wb') as f:
        f.write(bytes(weights_data))
    
    weights_manifest.append({
        'paths': ['group1-shard1of1.bin'],
        'weights': weight_specs
    })
    
    # Build model topology
    model_config = json.loads(model.to_json())
    
    model_json = {
        'format': 'layers-model',
        'generatedBy': 'keras v' + tf.keras.__version__,
        'convertedBy': 'MerakApp custom converter',
        'modelTopology': model_config,
        'weightsManifest': weights_manifest
    }
    
    # Write model.json
    model_json_path = os.path.join(output_dir, 'model.json')
    with open(model_json_path, 'w') as f:
        json.dump(model_json, f)
    
    # Report results
    weights_size = os.path.getsize(weights_bin_path)
    json_size = os.path.getsize(model_json_path)
    
    print(f"\n{'=' * 60}")
    print(f"Conversion complete!")
    print(f"{'=' * 60}")
    print(f"  model.json: {json_size / 1024:.1f} KB")
    print(f"  weights:    {weights_size / (1024*1024):.1f} MB")
    print(f"  Total:      {(weights_size + json_size) / (1024*1024):.1f} MB")
    print(f"  Output dir: {os.path.abspath(output_dir)}")
    
    return True


if __name__ == '__main__':
    success = convert_model()
    sys.exit(0 if success else 1)
