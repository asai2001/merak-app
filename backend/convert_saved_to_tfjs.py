import tensorflowjs as tfjs

model_path = 'models/saved_model'
output_path = 'models/tfjs'

try:
    tfjs.converters.save_tf_saved_model(
        model_path, 
        output_path
    )
    print(f'Model converted successfully to: {output_path}')
    print('Conversion completed!')
except Exception as e:
    print(f'Error during conversion: {e}')
    print('Trying alternative conversion method...')
    
    try:
        import tensorflow as tf
        model = tf.saved_model.load(model_path)
        print('Loaded SavedModel successfully')
        print(f'Signatures: {list(model.signatures.keys())}')
    except Exception as e2:
        print(f'Alternative method also failed: {e2}')
