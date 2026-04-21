# AI Face Detection

A deep learning web application that detects whether a face image is real or AI-generated.

## Overview

This project uses a fine-tuned ResNet model trained on a large dataset of real and AI-generated face images. It exposes a REST API via FastAPI and includes a React frontend for easy image upload and prediction.

## Model

- **Architecture**: ResNet (transfer learning)
- **Input size**: 160x160 RGB
- **Task**: Binary classification (real vs fake)
- **Metrics**: 88.7% accuracy, 0.957 AUC on test set
- **Training data**: 
  - [140k Real and Fake Faces](https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces)
  - AI Face Detection Dataset

## Project Structure
ai-detection/
frontend/               # React frontend
src/
App.jsx
data/                   # Training datasets (not included in repo)
real-vs-fake/
AI-face-detection-Dataset/
splits/
best_model.keras        # Trained model weights
main.py                 # FastAPI backend
requirements.txt        # Python dependencies
training_log.csv        # Epoch-by-epoch training history
ai-detection.ipynb      # Training notebook

## Getting Started

### Backend

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

API will be available at `http://127.0.0.1:8000`
Interactive docs at `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

UI will be available at `http://localhost:3000`

## API

### `POST /predict`

Upload an image and receive a prediction.

**Request**: `multipart/form-data` with a `file` field containing a JPEG or PNG image.

**Response**:
```json
{
  "label": "fake",
  "confidence": 0.87,
  "raw_score": 0.042
}
```

## Training

The model was trained using TensorFlow/Keras with the following setup:

- Optimizer: Adam (lr=1e-4)
- Loss: Binary crossentropy
- Callbacks: EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
- Data augmentation via Keras image pipeline
- CPU parallelism: 12 threads

To retrain from scratch, open `ai-detection.ipynb` and run all cells.

## Requirements

- Python 3.11
- TensorFlow
- FastAPI
- Pillow
- Node.js (for frontend)
