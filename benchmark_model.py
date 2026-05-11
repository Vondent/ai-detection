"""
Model-only inference benchmark — measures just model.predict(), no network or HTTP.

Usage:
  python benchmark_model.py
  python benchmark_model.py --n 500
"""

import argparse
import time
from pathlib import Path

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = "best_model.keras"
IMAGE_DIRS = ["data/real", "data/fake"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def preprocess(path: Path) -> np.ndarray:
    img = Image.open(path).convert("RGB").resize((160, 160))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)


def percentile(data: list[float], p: float) -> float:
    sorted_data = sorted(data)
    idx = (p / 100) * (len(sorted_data) - 1)
    lower = int(idx)
    upper = min(lower + 1, len(sorted_data) - 1)
    frac = idx - lower
    return sorted_data[lower] + frac * (sorted_data[upper] - sorted_data[lower])


def run(n: int):
    images = [
        p for d in IMAGE_DIRS for p in Path(d).iterdir()
        if p.suffix.lower() in IMAGE_EXTENSIONS
    ]
    if not images:
        print("No test images found.")
        return

    print(f"Loading model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)

    print(f"Preprocessing {min(n, len(images))} images...")
    arrays = [preprocess(images[i % len(images)]) for i in range(n)]

    # Warmup — run 3 predictions before measuring
    print("Warming up...", end=" ", flush=True)
    for arr in arrays[:3]:
        model.predict(arr, verbose=0)
    print("done\n")

    # Measure only model.predict()
    latencies = []
    print(f"Running {n} predictions ", end="", flush=True)
    for i, arr in enumerate(arrays):
        start = time.perf_counter()
        model.predict(arr, verbose=0)
        latencies.append((time.perf_counter() - start) * 1000)
        if (i + 1) % 50 == 0:
            print(".", end="", flush=True)
    print(" done\n")

    p50 = percentile(latencies, 50)
    p95 = percentile(latencies, 95)
    p99 = percentile(latencies, 99)

    print("=" * 45)
    print(f"  Samples:    {len(latencies)}")
    print(f"  Min:        {min(latencies):.1f} ms")
    print(f"  Mean:       {sum(latencies)/len(latencies):.1f} ms")
    print(f"  p50:        {p50:.1f} ms")
    print(f"  p95:        {p95:.1f} ms")
    print(f"  p99:        {p99:.1f} ms")
    print(f"  Max:        {max(latencies):.1f} ms")
    print("=" * 45)
    print(f"\nResume line:")
    print(f'  "Achieved p95 model inference latency of {p95:.0f}ms on CPU (ResNet50, no GPU)"')


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=200, help="Number of predictions to measure")
    args = parser.parse_args()
    run(args.n)
