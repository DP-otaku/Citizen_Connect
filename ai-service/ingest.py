import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

documents = [
    Document(
        page_content="NDRF (National Disaster Response Force) 2010 Guidelines: The NDRF is a specialized force constituted for the purpose of specialist response to a threatening disaster situation or disaster. It is the apex body for disaster management in India.",
        metadata={"source": "ndrf_guidelines"}
    ),
    Document(
        page_content="SDRF (State Disaster Response Force) norms: Each state in India is required to constitute its own SDRF to rapidly respond to local disasters. They coordinate closely with the NDRF during severe calamities.",
        metadata={"source": "sdrf_norms"}
    ),
    Document(
        page_content="Disaster Relief Circular 2023: In the event of floods, immediate financial assistance of ₹10,000 should be provided to affected families. For earthquake damage, structural engineers must verify safety before families return to their homes.",
        metadata={"source": "relief_circular"}
    ),
    Document(
        page_content="Reporting protocol: Citizens should report disasters using the official portal. Once a report is marked as 'VERIFIED' by a state officer, an SDRF team is dispatched within 2 hours.",
        metadata={"source": "reporting_protocol"}
    ),
    Document(
        page_content="Cyber Security Protocol during disasters: Ensure all communication over the platform is secure. Officer level users have the authority to verify reports.",
        metadata={"source": "cyber_security"}
    )
]

def main():
    print("Initializing embedding model (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("Splitting documents...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(documents)
    
    print(f"Creating Chroma vector store at ./chroma_db with {len(splits)} chunks...")
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    vectorstore.persist()
    print("✅ Ingestion complete! The database has been saved to ./chroma_db")

if __name__ == "__main__":
    main()
