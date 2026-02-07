from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import rag_core
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]

try:
    INDEX_DIR = rag_core.initialize_corpus()
except Exception as e:
    print(f"Failed to initialize corpus: {e}")
    INDEX_DIR = "index"

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        key_file = ".groq_key"
        if os.path.exists(key_file):
            with open(key_file, "r") as f:
                api_key = f.read().strip()
        
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured on server")

    answer, hits = rag_core.generate_answer(api_key, INDEX_DIR, req.query, req.history)
    
    sources = []
    for h in hits:
        sources.append({
            "title": h['source'],
            "snippet": h['text'][:200] + "..."
        })

    return ChatResponse(answer=answer, sources=sources)

@app.get("/health")
def health():
    return {"status": "ok"}
