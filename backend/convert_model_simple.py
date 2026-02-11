import tensorflowjs as tfjs

try:
    print('Converting SavedModel to TensorFlow.js format...')
    
    model_path = 'models/saved_model'
    output_path = 'models/tfjs'
    
    print(f'Model path: {model_path}')
    print(f'Output path: {output_path}')
    
    tfjs.converters.save_tf_saved_model(
        model_path,
        output_path
    )
    
    print('Conversion completed successfully!')
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
