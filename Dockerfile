# Build React frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build FastAPI backend
FROM python:3.11-slim
WORKDIR /app

# Copy backend files
COPY main.py .
COPY requirements.txt .
COPY best_model.keras .

# Copy built React frontend
COPY --from=frontend-build /app/frontend/build ./static

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]