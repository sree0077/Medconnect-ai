"""
Configuration settings for the Medical RAG System
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Vector Database Settings
CHROMA_DB_PATH = "./medical_chroma_db"
COLLECTION_NAME = "medical_knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# API Keys (set these in your .env file)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Data Processing Settings
CHUNK_SIZE = 512  # Maximum characters per chunk
OVERLAP_SIZE = 50  # Character overlap between chunks
BATCH_SIZE = 100  # Batch size for embedding generation

# RAG Settings
TOP_K_RESULTS = 5  # Number of similar documents to retrieve
SIMILARITY_THRESHOLD = 0.7  # Minimum similarity score

# File paths
CSV_FILES = {
    "dialogues": "MTS-Dialog-TrainingSet.csv",
    "descriptions": "symptom_Description.csv",
    "precautions": "symptom_precaution.csv",
    "qna": "trainQ&A.csv",
    "symptoms": "training_data.csv",
    "medicines_basic": "medicine_dataset.csv",
    "medicines_detailed": "updated_indian_medicine_data.csv"
}

# Document type prefixes
DOC_TYPES = {
    "dialogue": "dialogue_",
    "disease_desc": "disease_desc_",
    "precaution": "precaution_",
    "faq": "faq_",
    "symptom_pattern": "symptom_",
    "medicine_basic": "medicine_basic_",
    "medicine_detailed": "medicine_detailed_"
}
