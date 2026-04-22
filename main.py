import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-vercel-app.vercel.app",  # ← add your Vercel URL here
        "*"  # or just use wildcard to allow everything
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("best_model.keras")

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((160, 160))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img_array = preprocess_image(image_bytes)
    
    prediction = model.predict(img_array)[0][0]
    threshold = 0.193

    label = "real" if prediction >= threshold else "fake"

    if label == "real":
        confidence = (prediction - threshold) / (1.0 - threshold)
    else:
        confidence = (threshold - prediction) / threshold

    confidence_scaled = float(np.clip(confidence * 5, 0, 1))

    return JSONResponse({
        "label": label,
        "confidence": round(confidence_scaled * 100, 2),
        "raw_score": float(prediction)
    })

@app.get("/")
def root():
    return {"message": "AI Face Detection API is running"}