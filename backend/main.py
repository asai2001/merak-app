from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import tensorflow as tf
import io
from typing import Dict

app = FastAPI(title="Peacock Egg Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

def load_model():
    global model
    model_path = "models/peacock_egg_classifier.tflite"
    try:
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        model = interpreter
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")

def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    image_array = np.array(image, dtype=np.float32) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

@app.on_event("startup")
async def startup_event():
    load_model()

@app.get("/")
async def root():
    return {"message": "Peacock Egg Detector API"}

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)) -> Dict:
    if model is None:
        return {"error": "Model not loaded"}
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image = image.convert("RGB")
        
        input_data = preprocess_image(image)
        
        input_details = model.get_input_details()
        output_details = model.get_output_details()
        
        model.set_tensor(input_details[0]['index'], input_data)
        model.invoke()
        
        output_data = model.get_tensor(output_details[0]['index'])
        probabilities = output_data[0]
        
        fertile_prob = float(probabilities[0])
        infertile_prob = float(probabilities[1])
        
        prediction = "fertile" if fertile_prob > infertile_prob else "infertile"
        confidence = max(fertile_prob, infertile_prob)
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "probabilities": {
                "fertile": fertile_prob,
                "infertile": infertile_prob
            }
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
