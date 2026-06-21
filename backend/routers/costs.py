from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import json
from pathlib import Path

router = APIRouter(prefix="/costs", tags=["costs"])

# Load model on startup
MODEL_PATH   = Path(__file__).parent.parent / "models" / "cost_predictor.pkl"
FEATURE_PATH = Path(__file__).parent.parent / "models" / "features.json"

try:
    model    = joblib.load(MODEL_PATH)
    features = json.load(open(FEATURE_PATH))
    print("Cost prediction model loaded successfully")
except Exception as e:
    print(f"Warning: Could not load model: {e}")
    model = None
    features = []

class CostPredictionRequest(BaseModel):
    total_sqft      : float
    bath            : float
    bhk             : int
    plot_size_cents : float
    has_garden      : int
    has_aquarium    : int
    finishing_level : int

class CostPredictionResponse(BaseModel):
    predicted_cost_lakhs  : float
    price_range_min_lakhs : float
    price_range_max_lakhs : float
    breakdown             : dict
    input_summary         : dict

@router.post("/predict", response_model=CostPredictionResponse)
def predict_cost(request: CostPredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    input_data = pd.DataFrame([{
        'total_sqft'      : request.total_sqft,
        'bath'            : request.bath,
        'bhk'             : request.bhk,
        'plot_size_cents' : request.plot_size_cents,
        'has_garden'      : request.has_garden,
        'has_aquarium'    : request.has_aquarium,
        'finishing_level' : request.finishing_level
    }])

    predicted = float(model.predict(input_data)[0])
    margin    = predicted * 0.10

    breakdown = {
        "structure_lakhs" : round(request.total_sqft * 0.018, 2),
        "finishing_lakhs" : round(request.finishing_level * 3.5, 2),
        "garden_lakhs"    : round(request.has_garden * 1.8, 2),
        "aquarium_lakhs"  : round(request.has_aquarium * 1.2, 2),
        "labour_lakhs"    : round(predicted * 0.15, 2),
        "materials_lakhs" : round(predicted * 0.45, 2),
    }

    return CostPredictionResponse(
        predicted_cost_lakhs  = round(predicted, 2),
        price_range_min_lakhs = round(predicted - margin, 2),
        price_range_max_lakhs = round(predicted + margin, 2),
        breakdown             = breakdown,
        input_summary         = {
            "sqft"            : request.total_sqft,
            "bhk"             : request.bhk,
            "plot_cents"      : request.plot_size_cents,
            "has_garden"      : bool(request.has_garden),
            "has_aquarium"    : bool(request.has_aquarium),
            "finishing_level" : request.finishing_level
        }
    )

@router.get("/health")
def model_health():
    return {
        "model_loaded" : model is not None,
        "features"     : features
    }