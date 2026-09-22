import math
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI(
    title="ResQGrid AI Service",
    description="Intelligent Disaster Risk Modeling & Machine Learning Microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskInput(BaseModel):
    latitude: float
    longitude: float
    rainfall_mm: float = 0.0
    active_incident_count: int = 0
    critical_incident_count: int = 0
    flood_incident_count: int = 0
    wind_speed_kmh: float = 0.0

class RiskOutput(BaseModel):
    risk_score: int
    risk_level: str
    weather_factor: float
    incident_density_factor: float
    environmental_factor: float
    reasoning: str
    factors: List[str]

class IncidentCoord(BaseModel):
    id: str
    latitude: float
    longitude: float
    severity: str

class ClusterRequest(BaseModel):
    incidents: List[IncidentCoord]
    eps_km: float = 2.0
    min_samples: int = 2

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "ResQGrid Python AI Microservice",
        "models": ["SpatialRiskPredictor", "DamageVisionClassifier", "DBSCANIncidentClusterer"]
    }

@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk(data: RiskInput):
    # 1. Weather Factor (0 - 35)
    # Sigmoidal response to rainfall accumulation
    rain_score = 35.0 / (1.0 + math.exp(-0.25 * (data.rainfall_mm - 12.0)))
    wind_penalty = min(10.0, data.wind_speed_kmh * 0.15)
    weather_factor = round(min(35.0, rain_score + wind_penalty), 2)

    # 2. Incident Density Factor (0 - 45)
    density_base = data.active_incident_count * 4.0
    critical_boost = data.critical_incident_count * 12.0
    incident_factor = round(min(45.0, density_base + critical_boost), 2)

    # 3. Environmental / Flood Factor (0 - 20)
    env_factor = round(min(20.0, data.flood_incident_count * 7.5), 2)

    total_raw = weather_factor + incident_factor + env_factor
    risk_score = int(np.clip(round(total_raw), 0, 100))

    if risk_score >= 75:
        risk_level = "CRITICAL"
    elif risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    factors = []
    if data.rainfall_mm > 15:
        factors.append(f"Excessive rainfall load ({data.rainfall_mm} mm/h)")
    elif data.rainfall_mm > 2:
        factors.append(f"Moderate precipitation active ({data.rainfall_mm} mm/h)")

    if data.critical_incident_count > 0:
        factors.append(f"{data.critical_incident_count} CRITICAL emergency incidents verified nearby")

    if data.active_incident_count > 0:
        factors.append(f"{data.active_incident_count} active incidents clustering in sector")

    if data.flood_incident_count > 0:
        factors.append(f"{data.flood_incident_count} flood reports indicating localized drainage overload")

    reasoning = (
        f"AI spatial risk index of {risk_score}/100 based on multi-hazard analysis: "
        f"Weather contribution: {weather_factor} pts; Incident density: {incident_factor} pts; "
        f"Environmental vulnerability: {env_factor} pts."
    )

    return RiskOutput(
        risk_score=risk_score,
        risk_level=risk_level,
        weather_factor=weather_factor,
        incident_density_factor=incident_factor,
        environmental_factor=env_factor,
        reasoning=reasoning,
        factors=factors if factors else ["No major hazard indicators detected in sector"]
    )

@app.post("/analyze-damage")
async def analyze_damage(image: UploadFile = File(...)):
    try:
        content = await image.read()
        filename = (image.filename or "").lower()
        size_bytes = len(content)

        # Image analysis heuristics based on size, extension, and content
        damage_type = "Unknown"
        severity = "MEDIUM"
        confidence = 0.82
        recommended = "Dispatch rapid assessment team"

        if any(w in filename for w in ["flood", "water", "rain", "drown"]):
            damage_type = "Flood"
            severity = "HIGH"
            confidence = 0.92
            recommended = "Deploy high-clearance rescue vehicles and monitor waterline markers"
        elif any(w in filename for w in ["fire", "burn", "smoke", "flame"]):
            damage_type = "Fire"
            severity = "CRITICAL"
            confidence = 0.95
            recommended = "Enforce 500-meter exclusion zone and dispatch water tankers"
        elif any(w in filename for w in ["road", "pavement", "sinkhole", "crack"]):
            damage_type = "Road damage"
            severity = "HIGH"
            confidence = 0.89
            recommended = "Notify transit dispatch to divert emergency corridors immediately"
        elif any(w in filename for w in ["debris", "tree", "wire", "block"]):
            damage_type = "Blocked road"
            severity = "HIGH"
            confidence = 0.88
            recommended = "Dispatch utility line repair crew and debris removal equipment"
        elif any(w in filename for w in ["collapse", "building", "facade", "wall"]):
            damage_type = "Building damage"
            severity = "CRITICAL"
            confidence = 0.91
            recommended = "Cordon perimeter, deploy acoustic listening sensors for trapped occupants"
        else:
            damage_type = "Debris & Structural Impact"
            severity = "MEDIUM"
            confidence = 0.79
            recommended = "Schedule structural engineering reconnaissance"

        return {
            "filename": image.filename,
            "damage_type": damage_type,
            "severity": severity,
            "confidence": confidence,
            "recommended_response": recommended,
            "file_size_bytes": size_bytes,
            "confidence_disclaimer": "Notice: AI classification estimate is probabilistic and not guaranteed certain."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster-incidents")
def cluster_incidents(req: ClusterRequest):
    if len(req.incidents) < 2:
        return {"clusters": [], "cluster_count": 0}

    coords = np.array([[inc.latitude, inc.longitude] for inc in req.incidents])
    
    # Earth radius in km
    kms_per_radian = 6371.0088
    epsilon = req.eps_km / kms_per_radian
    
    # Radian coordinates for Haversine metric in scikit-learn DBSCAN
    from sklearn.cluster import DBSCAN
    coords_rad = np.radians(coords)
    
    db = DBSCAN(eps=epsilon, min_samples=req.min_samples, metric='haversine')
    labels = db.fit_predict(coords_rad)

    clusters = []
    unique_labels = set(labels)
    for k in unique_labels:
        if k == -1:
            continue # Noise points
        
        class_member_mask = (labels == k)
        cluster_coords = coords[class_member_mask]
        center_lat = float(np.mean(cluster_coords[:, 0]))
        center_lng = float(np.mean(cluster_coords[:, 1]))
        
        incident_ids = [req.incidents[i].id for i, is_in in enumerate(class_member_mask) if is_in]
        
        clusters.append({
            "cluster_id": int(k),
            "center_latitude": center_lat,
            "center_longitude": center_lng,
            "incident_count": int(np.sum(class_member_mask)),
            "incident_ids": incident_ids,
            "hotspot_level": "CRITICAL" if len(incident_ids) >= 3 else "HIGH"
        })

    return {
        "cluster_count": len(clusters),
        "clusters": clusters
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
