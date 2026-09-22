# ResQGrid AI – Intelligent Disaster Modeling Microservice

FastAPI-powered machine learning and risk analysis microservice for real-time flood modeling, computer vision damage classification, and responder allocation scoring.

## Features
- **Flood Risk Prediction** (`POST /predict-risk`): Multi-variable hydrology risk scoring using elevation, rainfall, and drainage proximity.
- **Damage Assessment** (`POST /analyze-damage`): Image analysis for structural and flood damage severity.
- **Evacuation Priority Scoring** (`POST /evacuation-score`): Demographic vulnerability and water level hazard matrix.

## Quick Start

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows (or source venv/bin/activate on Unix)

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run AI Service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation available at: `http://localhost:8000/docs`
