from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, plots, layouts, costs

app = FastAPI(
    title="BuildSense AI",
    description="AI-Powered Spatial Intelligence Platform for Property Developers",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(plots.router)
app.include_router(layouts.router)
app.include_router(costs.router)

@app.get("/")
def root():
    return {"message": "BuildSense AI backend is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "0.1.0"}