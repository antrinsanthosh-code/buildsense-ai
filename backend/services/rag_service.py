import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv

# Force load env first before anything else
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=dotenv_path, override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"Groq key loaded: {bool(GROQ_API_KEY)}")

import chromadb
from chromadb.utils import embedding_functions
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

# ChromaDB setup
chroma_client = chromadb.PersistentClient(path="./chroma_db")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name="kerala_builds",
    embedding_function=embedding_fn
)

# Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=GROQ_API_KEY,
    temperature=0.7
)

def seed_knowledge_base():
    """Seed ChromaDB with synthetic Kerala housing data"""
    builds = [
        {
            "id": "build_001",
            "text": "3 cent plot in Thrissur Kerala. Built 2BHK house 850 sqft. Layout: living room facing east, 2 bedrooms north side, kitchen west, small garden south. Total cost 18 lakhs. Sold for 24 lakhs.",
            "metadata": {"plot_size": "3 cents", "location": "Thrissur", "bhk": "2BHK", "sqft": 850, "cost": 1800000}
        },
        {
            "id": "build_002",
            "text": "4 cent plot in Palakkad Kerala. Built 3BHK house 1100 sqft. Layout: living room center, 3 bedrooms arranged around courtyard, kitchen east, garden with aquarium north. Total cost 26 lakhs. Sold for 34 lakhs.",
            "metadata": {"plot_size": "4 cents", "location": "Palakkad", "bhk": "3BHK", "sqft": 1100, "cost": 2600000}
        },
        {
            "id": "build_003",
            "text": "3.5 cent plot in Ernakulam Kerala. Built 2BHK house 920 sqft with attached garden and aquarium. Layout: open plan living dining, 2 bedrooms south facing, utility room east. Total cost 22 lakhs. Sold for 30 lakhs.",
            "metadata": {"plot_size": "3.5 cents", "location": "Ernakulam", "bhk": "2BHK", "sqft": 920, "cost": 2200000}
        },
        {
            "id": "build_004",
            "text": "3 cent corner plot in Kozhikode Kerala. Built 2BHK house 800 sqft. Corner plots allow more windows and ventilation. Layout: living room corner facing road, bedrooms inner side for privacy, garden on two sides. Total cost 17 lakhs. Sold for 23 lakhs.",
            "metadata": {"plot_size": "3 cents", "location": "Kozhikode", "bhk": "2BHK", "sqft": 800, "cost": 1700000}
        },
        {
            "id": "build_005",
            "text": "4 cent plot in Thrissur Kerala. Built 3BHK house 1200 sqft with large garden and decorative aquarium in living room. Premium finishing with curtains and woodwork. Total cost 32 lakhs. Sold for 42 lakhs.",
            "metadata": {"plot_size": "4 cents", "location": "Thrissur", "bhk": "3BHK", "sqft": 1200, "cost": 3200000}
        },
        {
            "id": "build_006",
            "text": "3 cent plot in Kannur Kerala. Built compact 2BHK house 780 sqft. Maximised space with built-in storage, modular kitchen, small but well designed garden. Total cost 16 lakhs. Sold for 21 lakhs.",
            "metadata": {"plot_size": "3 cents", "location": "Kannur", "bhk": "2BHK", "sqft": 780, "cost": 1600000}
        },
        {
            "id": "build_007",
            "text": "3.5 cent plot in Kochi Kerala. Built 2BHK house 950 sqft near highway. Good road access increases value. Layout: setback from road for privacy, parking space front, garden rear. Total cost 24 lakhs. Sold for 33 lakhs.",
            "metadata": {"plot_size": "3.5 cents", "location": "Kochi", "bhk": "2BHK", "sqft": 950, "cost": 2400000}
        },
        {
            "id": "build_008",
            "text": "4 cent plot in Malappuram Kerala. Built 3BHK house 1050 sqft. Vastu compliant layout with main door east facing, master bedroom southwest, kitchen southeast. Garden with coconut trees. Total cost 23 lakhs. Sold for 30 lakhs.",
            "metadata": {"plot_size": "4 cents", "location": "Malappuram", "bhk": "3BHK", "sqft": 1050, "cost": 2300000}
        },
    ]

    existing = collection.get()
    existing_ids = existing["ids"]

    for build in builds:
        if build["id"] not in existing_ids:
            collection.add(
                documents=[build["text"]],
                metadatas=[build["metadata"]],
                ids=[build["id"]]
            )

    print(f"Knowledge base seeded with {len(builds)} Kerala builds")

def get_similar_builds(plot_description: str, n_results: int = 3) -> list:
    """Retrieve similar past builds from ChromaDB"""
    results = collection.query(
        query_texts=[plot_description],
        n_results=n_results
    )
    return results["documents"][0] if results["documents"] else []

def generate_layout_suggestions(plot_analysis: dict, plot_size_cents: float, location: str) -> dict:
    """Use Groq + RAG to generate house layout suggestions"""

    plot_description = f"{plot_size_cents} cent plot in {location} Kerala with {plot_analysis.get('vegetation_percentage', 0)}% vegetation and {plot_analysis.get('orientation_estimate', 'unknown')} orientation"

    similar_builds = get_similar_builds(plot_description)
    context = "\n".join(similar_builds) if similar_builds else "No similar builds found"

    system_prompt = """You are BuildSense AI, an expert in Kerala small-plot house design. 
    You help small property developers maximise the value of 3-4 cent plots in Kerala.
    Always consider Kerala climate, Vastu principles, and budget-conscious buyers.
    Respond in JSON format only. No markdown, no explanation, just raw JSON."""

    user_prompt = f"""Based on these similar past builds:
{context}

Generate 2 house layout options for this plot:
- Plot size: {plot_size_cents} cents
- Location: {location}, Kerala  
- Vegetation: {plot_analysis.get('vegetation_percentage', 0)}%
- Orientation: {plot_analysis.get('orientation_estimate', 'unknown')}
- Plot notes: {plot_analysis.get('analysis_notes', [])}

Return JSON with this exact structure:
{{
  "layouts": [
    {{
      "option": 1,
      "name": "layout name",
      "bhk": "2BHK or 3BHK",
      "sqft": 850,
      "rooms": {{"living": "description", "bedrooms": "description", "kitchen": "description", "garden": "description", "aquarium": "placement"}},
      "estimated_cost_lakhs": 20,
      "selling_price_lakhs": 27,
      "key_features": ["feature1", "feature2"],
      "vastu_notes": "vastu compliance notes"
    }},
    {{
      "option": 2,
      "name": "layout name",
      "bhk": "2BHK or 3BHK",
      "sqft": 950,
      "rooms": {{"living": "description", "bedrooms": "description", "kitchen": "description", "garden": "description", "aquarium": "placement"}},
      "estimated_cost_lakhs": 25,
      "selling_price_lakhs": 33,
      "key_features": ["feature1", "feature2"],
      "vastu_notes": "vastu compliance notes"
    }}
  ]
}}"""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]

    response = llm.invoke(messages)

    text = response.content
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return {"error": "Could not generate layouts", "raw": text}

# Seed on import
seed_knowledge_base()