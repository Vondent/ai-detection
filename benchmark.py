"""
Inference latency benchmark for the AI face detection API.

Usage:
  # Against local backend
  python benchmark.py

  # Against deployed backend
  python benchmark.py --url https://your-backend-url.com --n 200
"""

import argparse
import time
import statistics
from pathlib import Path
import requests

DEFAULT_URL = "http://localhost:8000"
IMAGE_DIRS = ["data/real", "data/fake"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
WARMUP_REQUESTS = 3


def send_request(url: str, image_path: Path, timeout: int = 30) -> float:
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    start = time.perf_counter()
    resp = requests.post(
        f"{url}/predict",
        files={"file": (image_path.name, image_bytes, "image/jpeg")},
        timeout=timeout,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000

    resp.raise_for_status()
    return elapsed_ms


def percentile(data: list[float], p: float) -> float:
    sorted_data = sorted(data)
    idx = (p / 100) * (len(sorted_data) - 1)
    lower = int(idx)
    upper = lower + 1
    if upper >= len(sorted_data):
        return sorted_data[-1]
    frac = idx - lower
    return sorted_data[lower] + frac * (sorted_data[upper] - sorted_data[lower])


def run_benchmark(url: str, n: int):
    images = [
        p for d in IMAGE_DIRS for p in Path(d).iterdir()
        if p.suffix.lower() in IMAGE_EXTENSIONS
    ]
    if not images:
        print("No test images found. Make sure data/real/ and data/fake/ exist.")
        return

    print(f"Target:  {url}/predict")
    print(f"Images:  {[str(i) for i in images]}")
    print(f"Requests: {WARMUP_REQUESTS} warmup + {n} measured\n")

    # Warmup — not measured (cold start skew); use long timeout for cold starts
    print("Warming up (may take ~60s if server is cold)...", end=" ", flush=True)
    for i in range(WARMUP_REQUESTS):
        send_request(url, images[i % len(images)], timeout=120)
    print("done\n")

    # Measured requests
    latencies = []
    errors = 0
    print(f"Running {n} requests ", end="", flush=True)
    for i in range(n):
        try:
            ms = send_request(url, images[i % len(images)])
            latencies.append(ms)
        except Exception as e:
            errors += 1
        if (i + 1) % 20 == 0:
            print(".", end="", flush=True)
    print(f" done\n")

    if not latencies:
        print("All requests failed.")
        return

    p50  = percentile(latencies, 50)
    p95  = percentile(latencies, 95)
    p99  = percentile(latencies, 99)
    mean = statistics.mean(latencies)
    mn   = min(latencies)
    mx   = max(latencies)

    print("=" * 45)
    print(f"  Requests:   {len(latencies)} succeeded, {errors} failed")
    print(f"  Min:        {mn:.1f} ms")
    print(f"  Mean:       {mean:.1f} ms")
    print(f"  p50:        {p50:.1f} ms")
    print(f"  p95:        {p95:.1f} ms")
    print(f"  p99:        {p99:.1f} ms")
    print(f"  Max:        {mx:.1f} ms")
    print("=" * 45)
    print(f"\nResume line:")
    print(f'  "Achieved p95 inference latency of {p95:.0f}ms on deployed backend"')


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL, help="Backend base URL")
    parser.add_argument("--n", type=int, default=100, help="Number of measured requests")
    args = parser.parse_args()

    run_benchmark(args.url.rstrip("/"), args.n)