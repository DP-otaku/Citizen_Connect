import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq

app = FastAPI(title="Citizen Connect AI Service")

# Request Model
class QuestionRequest(BaseModel):
    question: str

retriever = None
llm = None

@app.on_event("startup")
def startup_event():
    global retriever, llm
    try:
        print("Loading embeddings...")
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        print("Loading ChromaDB...")
        if not os.path.exists("./chroma_db"):
            print("WARNING: ./chroma_db not found. Did you run ingest.py?")
            
        vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
        
        print("Connecting to Groq API...")
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is missing")
            
        llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama-3.1-8b-instant")
        
        print("✅ AI Service Ready with Groq API!")
    except Exception as e:
        print(f"❌ Failed to initialize AI components: {e}")

@app.post("/api/ai/ask")
async def ask_question(request: QuestionRequest):
    if retriever is None or llm is None:
        raise HTTPException(status_code=503, detail="AI Service is currently unavailable. Check server logs.")
    
    try:
        docs = retriever.invoke(request.question)
        context = "\n\n".join([doc.page_content for doc in docs])
        sources = list(set([doc.metadata.get("source", "Unknown") for doc in docs]))
        
        prompt = f"""You are a helpful AI assistant for the Citizen Connect Disaster Management platform.
Use the following pieces of context to answer the question at the end. 
If you don't know the answer based on the context, just say that you don't know.
Keep the answer concise and helpful.

Context:
{context}

Question: {request.question}
Answer:"""
        
        response = llm.invoke(prompt)
        
        return {
            "answer": response.content,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "provider": "Groq"}
