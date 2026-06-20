from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.rag_service import generate_layout_suggestions
from services.supabase_client import supabase

router = APIRouter(prefix="/layouts", tags=["layouts"])

class LayoutRequest(BaseModel):
    project_id: str
    plot_size_cents: float
    location: str
    plot_analysis: Optional[dict] = {}

@router.post("/generate")
def generate_layouts(request: LayoutRequest):
    """Generate AI layout suggestions using RAG + Gemini"""
    result = generate_layout_suggestions(
        plot_analysis=request.plot_analysis,
        plot_size_cents=request.plot_size_cents,
        location=request.location
    )
    return result

@router.get("/{project_id}")
def get_layouts(project_id: str):
    response = supabase.table("layouts").select("*").eq("project_id", project_id).execute()
    return response.data