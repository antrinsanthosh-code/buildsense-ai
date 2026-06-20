from fastapi import APIRouter, HTTPException, UploadFile, File
from services.plot_analyser import analyse_plot
from services.supabase_client import supabase
from pydantic import BaseModel
from typing import Optional
import shutil
import os

router = APIRouter(prefix="/plots", tags=["plots"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PlotCreate(BaseModel):
    project_id: str
    notes: Optional[str] = None

@router.post("/analyse")
async def analyse_plot_photo(file: UploadFile = File(...)):
    """Upload a plot photo and get AI analysis"""
    # Save uploaded file temporarily
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Analyse the plot
    result = analyse_plot(file_path)

    # Clean up temp file
    os.remove(file_path)

    return {
        "filename": file.filename,
        "analysis": result
    }

@router.get("/{project_id}")
def get_plots(project_id: str):
    response = supabase.table("plots").select("*").eq("project_id", project_id).execute()
    return response.data