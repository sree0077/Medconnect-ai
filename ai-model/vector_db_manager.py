"""
Vector Database Manager for Medical RAG System
Handles ChromaDB operations for storing and retrieving medical documents
"""
import chromadb
from chromadb.config import Settings
import json
import numpy as np
from typing import List, Dict, Optional, Tuple
import config
import os

class MedicalVectorDB:
    def __init__(self, db_path: str = config.CHROMA_DB_PATH, collection_name: str = config.COLLECTION_NAME):
        self.db_path = db_path
        self.collection_name = collection_name
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=db_path,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Get or create collection
        try:
            self.collection = self.client.get_collection(name=collection_name)
            print(f"Loaded existing collection '{collection_name}' with {self.collection.count()} documents")
        except:
            self.collection = self.client.create_collection(
                name=collection_name,
                metadata={"description": "Medical knowledge base for RAG system"}
            )
            print(f"Created new collection '{collection_name}'")
    
    def add_documents(self, documents: List[Dict]) -> bool:
        """Add documents to the vector database"""
        try:
            print(f"Adding {len(documents)} documents to vector database...")
            
            # Prepare data for ChromaDB
            ids = []
            embeddings = []
            metadatas = []
            documents_text = []
            
            for doc in documents:
                ids.append(doc['id'])
                embeddings.append(doc['embedding'])
                metadatas.append(doc['metadata'])
                documents_text.append(doc['document'])
            
            # Add to collection in batches
            batch_size = config.BATCH_SIZE
            for i in range(0, len(documents), batch_size):
                end_idx = min(i + batch_size, len(documents))
                
                self.collection.add(
                    ids=ids[i:end_idx],
                    embeddings=embeddings[i:end_idx],
                    metadatas=metadatas[i:end_idx],
                    documents=documents_text[i:end_idx]
                )
                
                print(f"Added batch {i//batch_size + 1}/{(len(documents) + batch_size - 1)//batch_size}")
            
            print(f"Successfully added {len(documents)} documents to the database")
            return True
            
        except Exception as e:
            print(f"Error adding documents to database: {e}")
            return False
    
    def search_similar(self, query: str, n_results: int = config.TOP_K_RESULTS, 
                      doc_types: Optional[List[str]] = None) -> List[Dict]:
        """Search for similar documents"""
        try:
            # Build where clause for filtering by document type
            where_clause = None
            if doc_types:
                where_clause = {"type": {"$in": doc_types}}
            
            # Perform similarity search
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_clause,
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    result = {
                        'id': results['ids'][0][i],
                        'document': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'similarity_score': 1 - results['distances'][0][i]  # Convert distance to similarity
                    }
                    formatted_results.append(result)
            
            return formatted_results
            
        except Exception as e:
            print(f"Error searching database: {e}")
            return []
    
    def get_document_by_id(self, doc_id: str) -> Optional[Dict]:
        """Retrieve a specific document by ID"""
        try:
            results = self.collection.get(
                ids=[doc_id],
                include=['documents', 'metadatas']
            )
            
            if results['documents']:
                return {
                    'id': doc_id,
                    'document': results['documents'][0],
                    'metadata': results['metadatas'][0]
                }
            return None
            
        except Exception as e:
            print(f"Error retrieving document {doc_id}: {e}")
            return None
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the collection"""
        try:
            count = self.collection.count()
            
            # Get sample of documents to analyze types
            sample_results = self.collection.get(
                limit=min(1000, count),
                include=['metadatas']
            )
            
            # Count document types
            type_counts = {}
            if sample_results['metadatas']:
                for metadata in sample_results['metadatas']:
                    doc_type = metadata.get('type', 'unknown')
                    type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
            
            return {
                'total_documents': count,
                'document_types': type_counts,
                'collection_name': self.collection_name,
                'db_path': self.db_path
            }
            
        except Exception as e:
            print(f"Error getting collection stats: {e}")
            return {}
    
    def delete_collection(self) -> bool:
        """Delete the entire collection"""
        try:
            self.client.delete_collection(name=self.collection_name)
            print(f"Deleted collection '{self.collection_name}'")
            return True
        except Exception as e:
            print(f"Error deleting collection: {e}")
            return False
    
    def reset_database(self) -> bool:
        """Reset the entire database"""
        try:
            self.client.reset()
            print("Database reset successfully")
            
            # Recreate collection
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"description": "Medical knowledge base for RAG system"}
            )
            return True
        except Exception as e:
            print(f"Error resetting database: {e}")
            return False

def load_and_store_documents(json_file: str = "processed_medical_data.json") -> bool:
    """Load processed documents from JSON and store in vector database"""
    if not os.path.exists(json_file):
        print(f"File {json_file} not found. Please run medical_rag_processor.py first.")
        return False
    
    print(f"Loading documents from {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        documents = json.load(f)
    
    print(f"Loaded {len(documents)} documents")
    
    # Initialize vector database
    vector_db = MedicalVectorDB()
    
    # Store documents
    success = vector_db.add_documents(documents)
    
    if success:
        stats = vector_db.get_collection_stats()
        print("\nDatabase Statistics:")
        print(f"Total documents: {stats['total_documents']}")
        print("Document types:")
        for doc_type, count in stats['document_types'].items():
            print(f"  {doc_type}: {count}")
    
    return success

if __name__ == "__main__":
    # Load and store documents
    success = load_and_store_documents()
    
    if success:
        print("\nTesting search functionality...")
        vector_db = MedicalVectorDB()
        
        # Test searches
        test_queries = [
            "chest pain symptoms",
            "diabetes treatment",
            "fever and headache",
            "blood pressure medication"
        ]
        
        for query in test_queries:
            print(f"\nSearching for: '{query}'")
            results = vector_db.search_similar(query, n_results=3)
            
            for i, result in enumerate(results, 1):
                print(f"  {i}. Score: {result['similarity_score']:.3f}")
                print(f"     Type: {result['metadata']['type']}")
                print(f"     Content: {result['document'][:100]}...")
                print()
    else:
        print("Failed to load and store documents")
