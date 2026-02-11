from http.server import BaseHTTPRequestHandler
import json
import base64
import os
import io
import numpy as np
from PIL import Image

# Load model once (reused across invocations)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'peacock_egg_classifier.tflite')
interpreter = None


def get_interpreter():
    global interpreter
    if interpreter is None:
        try:
            from tflite_runtime.interpreter import Interpreter
        except ImportError:
            try:
                from ai_edge_litert.interpreter import Interpreter
            except ImportError:
                import tensorflow as tf
                Interpreter = tf.lite.Interpreter

        interpreter = Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
    return interpreter


def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    image = image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            # Decode base64 image
            image_b64 = data.get('image', '')
            if ',' in image_b64:
                image_b64 = image_b64.split(',')[1]

            image_bytes = base64.b64decode(image_b64)
            input_data = preprocess_image(image_bytes)

            # Run inference
            model = get_interpreter()
            input_details = model.get_input_details()
            output_details = model.get_output_details()

            model.set_tensor(input_details[0]['index'], input_data)
            model.invoke()

            output_data = model.get_tensor(output_details[0]['index'])
            probs = output_data[0]

            fertile_prob = float(probs[0])
            infertile_prob = float(probs[1])

            prediction = "fertile" if fertile_prob > infertile_prob else "infertile"
            confidence = max(fertile_prob, infertile_prob)

            result = {
                "prediction": prediction,
                "confidence": confidence,
                "probabilities": {
                    "fertile": fertile_prob,
                    "infertile": infertile_prob
                }
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
