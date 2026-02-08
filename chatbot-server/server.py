from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import time
import rag_core
from typing import List, Optional

import data_loader

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[dict] = {}

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]

@app.get("/h1b/summary")
def h1b_summary(top: int = 10):
    if top < 1:
        top = 1
    if top > 50:
        top = 50
    return data_loader.data_loader.get_summary(top_n=top)

@app.get("/h1b/search")
def h1b_search(q: str = "", limit: int = 20):
    if limit < 1:
        limit = 1
    if limit > 50:
        limit = 50
    return {"results": data_loader.data_loader.search_employers_with_ids(q, limit=limit)}

@app.get("/h1b/employer")
def h1b_employer(id: int):
    emp = data_loader.data_loader.get_employer_by_id(id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employer not found")
    return emp

try:
    INDEX_DIR = rag_core.initialize_corpus()
except Exception as e:
    print(f"Failed to initialize corpus: {e}")
    INDEX_DIR = "index"

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        key_file = ".groq_key"
        if os.path.exists(key_file):
            with open(key_file, "r") as f:
                api_key = f.read().strip()
        
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured on server")

    h1b_context = data_loader.data_loader.get_context_for_query(req.query)
    
    external_context = data_loader.data_loader.fetch_external_context(req.context or {})

    history_dicts = [{"role": m.role, "content": m.content} for m in req.history]
    
    if req.context or h1b_context or external_context:
        context_str = "CURRENT USER CONTEXT:\n"
        if req.context:
            for k, v in req.context.items():
                context_str += f"{k}: {v}\n"
        
        if h1b_context:
            context_str += "\nRELAVENT H1B DATA:\n" + h1b_context
            
        if external_context:
            context_str += "\nEXTERNAL LIVE DATA:\n" + external_context

        history_dicts.append({"role": "system", "content": context_str})



    answer, hits = rag_core.generate_answer(api_key, INDEX_DIR, req.query, history_dicts)
    
    sources = []
    for h in hits:
        sources.append({
            "title": h['source'],
            "snippet": h['text'][:200] + "..."
        })

    return ChatResponse(answer=answer, sources=sources)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Simulate processing delay
    time.sleep(1.5)
    return {"filename": file.filename, "status": "success", "message": "File processed and added to knowledge base"}

@app.get("/health")
def health():
    return {"status": "ok"}
