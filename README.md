# AI Face Detection

A full-stack deep learning web application that detects whether a face image is real or AI-generated.

🔗 **Live Demo**: https://ai-detection-coral.vercel.app/

## Overview

This project uses transfer learning on ResNet50 trained on 60,000+ real and AI-generated face images. It exposes a REST API via FastAPI and includes a React frontend for easy image upload and real-time prediction.

## Model

- **Architecture**: ResNet50 (transfer learning)
- **Input size**: 160x160 RGB
- **Task**: Binary classification (real vs fake)
- **Test Accuracy**: 88.7%
- **AUC**: 0.957
- **Training data**:
  - [140k Real and Fake Faces](https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces)
  - [AI Face Detection Dataset](https://www.kaggle.com/datasets/shahzaibshazoo/detect-ai-generated-faces-high-quality-dataset)

## Project Structure

ai-detection/
├── frontend/                       # React frontend
│   ├── public/
│   └── src/
│       └── App.jsx
├── data/                           # Training datasets (not included in repo)
│   ├── real-vs-fake/
│   │   ├── train/
│   │   │   ├── fake/
│   │   │   └── real/
│   │   └── test/
│   │       ├── fake/
│   │       └── real/
│   ├── AI-face-detection-Dataset/
│   │   ├── AI/
│   │   └── real/
│   └── splits/
│       ├── train/
│       ├── val/
│       └── test/
├── best_model.keras                # Trained model weights
├── main.py                         # FastAPI backend
├── requirements.txt                # Python dependencies
├── training_log.csv                # Epoch-by-epoch training history
├── ai-detection.ipynb              # Training notebook
└── runtime.txt                     # Python version for Render

## Tech Stack

- **Frontend**: React.js, deployed on Vercel
- **Backend**: FastAPI, deployed on Render
- **Model**: TensorFlow/Keras, ResNet50
- **Training**: Python, TensorFlow, NumPy, Pillow

## Getting Started Locally

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

## Deployment

- **Backend**: Render (Python web service, 1GB RAM, port 10000)
- **Frontend**: Vercel (connected to GitHub, auto-deploys on push)

## Training

The model was trained using TensorFlow/Keras with the following setup:

- Optimizer: Adam (lr=1e-4)
- Loss: Binary crossentropy
- Callbacks: EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
- Data augmentation via Keras image pipeline
- Data split: 70% train, 15% val, 15% test

To retrain from scratch, open `ai-detection.ipynb` and run all cells.

## Requirements

- Python 3.11
- TensorFlow
- FastAPI
- Pillow
- Node.js (for frontend)
