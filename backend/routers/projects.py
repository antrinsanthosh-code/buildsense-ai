from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.supabase_client import supabase

router =  APIRouter(prefix="/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    name: str
    plot_size_cents: Optional[float] = None
    location: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None

@router.get("/")
def get_projects():
    response= supabase.table("projects").select("*").execute()
    return response.data

@router.get("/{project_id}")
def get_project(project_id: str):
    response = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return response.data[0]

@router.post("/")
def create_project(project: ProjectCreate):
    response = supabase.table("projects").insert(project.model_dump()).execute()
    return response.data[0]

@router.patch("/{project_id}")
def update_project(project_id: str, project: ProjectUpdate):
    data = {k: v for k, v in project.model_dump().items() if v is not None}
    response = supabase.table("projects").update(data).eq("id", project_id).execute()
    return response.data[0]

@router.delete("/{project_id}")
def delete_project(project_id: str):
    supabase.table("projects").delete().eq("id", project_id).execute()
    return {"message": "Project deleted"}

