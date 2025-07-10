"""
Test script for Medical RAG System
Tests data processing, vector database, and RAG functionality
"""
import os
import json
from medical_rag_processor import MedicalDataProcessor
from vector_db_manager import MedicalVectorDB, load_and_store_documents
from gemini_rag_client import MedicalRAGClient
import config

def test_data_processing():
    """Test CSV data processing and embedding generation"""
    print("=" * 60)
    print("TESTING DATA PROCESSING")
    print("=" * 60)
    
    processor = MedicalDataProcessor()
    
    # Test individual processors
    print("\n1. Testing individual file processors...")
    
    # Test dialogue processing
    try:
        dialogues = processor.process_dialogues(config.CSV_FILES['dialogues'])
        print(f"✅ Dialogues: {len(dialogues)} documents processed")
        if dialogues:
            print(f"   Sample: {dialogues[0]['document'][:100]}...")
    except Exception as e:
        print(f"❌ Dialogues failed: {e}")
    
    # Test disease descriptions
    try:
        descriptions = processor.process_disease_descriptions(config.CSV_FILES['descriptions'])
        print(f"✅ Disease descriptions: {len(descriptions)} documents processed")
        if descriptions:
            print(f"   Sample: {descriptions[0]['document'][:100]}...")
    except Exception as e:
        print(f"❌ Disease descriptions failed: {e}")
    
    # Test precautions
    try:
        precautions = processor.process_precautions(config.CSV_FILES['precautions'])
        print(f"✅ Precautions: {len(precautions)} documents processed")
        if precautions:
            print(f"   Sample: {precautions[0]['document'][:100]}...")
    except Exception as e:
        print(f"❌ Precautions failed: {e}")
    
    # Test Q&A
    try:
        qna = processor.process_qna(config.CSV_FILES['qna'])
        print(f"✅ Q&A: {len(qna)} documents processed")
        if qna:
            print(f"   Sample: {qna[0]['document'][:100]}...")
    except Exception as e:
        print(f"❌ Q&A failed: {e}")
    
    # Test symptom patterns
    try:
        symptoms = processor.process_symptom_patterns(config.CSV_FILES['symptoms'])
        print(f"✅ Symptom patterns: {len(symptoms)} documents processed")
        if symptoms:
            print(f"   Sample: {symptoms[0]['document'][:100]}...")
    except Exception as e:
        print(f"❌ Symptom patterns failed: {e}")
    
    print("\n2. Testing complete processing pipeline...")
    try:
        all_documents = processor.process_all_files()
        print(f"✅ Total documents processed: {len(all_documents)}")
        
        # Check document types
        type_counts = {}
        for doc in all_documents:
            doc_type = doc['metadata']['type']
            type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
        
        print("   Document type distribution:")
        for doc_type, count in type_counts.items():
            print(f"     {doc_type}: {count}")
        
        # Save processed data
        processor.save_processed_data("test_processed_data.json")
        print("✅ Data saved to test_processed_data.json")
        
        return True
        
    except Exception as e:
        print(f"❌ Complete processing failed: {e}")
        return False

def test_vector_database():
    """Test vector database operations"""
    print("\n" + "=" * 60)
    print("TESTING VECTOR DATABASE")
    print("=" * 60)
    
    # Check if processed data exists
    if not os.path.exists("test_processed_data.json"):
        print("❌ No processed data found. Run data processing test first.")
        return False
    
    try:
        # Test loading and storing documents
        print("\n1. Testing document storage...")
        success = load_and_store_documents("test_processed_data.json")
        if not success:
            print("❌ Failed to load and store documents")
            return False
        
        # Test vector database operations
        print("\n2. Testing database operations...")
        vector_db = MedicalVectorDB()
        
        # Get stats
        stats = vector_db.get_collection_stats()
        print(f"✅ Database stats: {stats['total_documents']} total documents")
        
        # Test search functionality
        print("\n3. Testing search functionality...")
        test_queries = [
            "chest pain",
            "diabetes symptoms", 
            "fever treatment",
            "blood pressure medication"
        ]
        
        for query in test_queries:
            results = vector_db.search_similar(query, n_results=3)
            print(f"✅ Query '{query}': {len(results)} results")
            if results:
                best_result = results[0]
                print(f"   Best match (score: {best_result['similarity_score']:.3f}): {best_result['document'][:80]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Vector database test failed: {e}")
        return False

def test_rag_system():
    """Test complete RAG system with Gemini"""
    print("\n" + "=" * 60)
    print("TESTING RAG SYSTEM")
    print("=" * 60)
    
    # Check API key
    if not config.GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY not set. Please add it to your .env file")
        print("   You can get an API key from: https://makersuite.google.com/app/apikey")
        return False
    
    try:
        print("\n1. Initializing RAG client...")
        rag_client = MedicalRAGClient()
        print("✅ RAG client initialized successfully")
        
        print("\n2. Testing retrieval functionality...")
        test_query = "chest pain symptoms"
        retrieved_docs = rag_client.retrieve_relevant_context(test_query)
        print(f"✅ Retrieved {len(retrieved_docs)} documents for '{test_query}'")
        
        print("\n3. Testing complete RAG pipeline...")
        test_questions = [
            "What should I do if I have chest pain?",
            "What are the symptoms of diabetes?",
            "How can I treat a fever at home?",
            "What precautions should I take for hypertension?"
        ]
        
        for question in test_questions:
            print(f"\n   Testing: {question}")
            try:
                result = rag_client.chat(question)
                print(f"   ✅ Response generated ({len(result['response'])} chars)")
                print(f"   ✅ Used {result['num_sources']} sources")
                print(f"   Preview: {result['response'][:150]}...")
            except Exception as e:
                print(f"   ❌ Failed: {e}")
        
        print("\n4. Testing specialized medical advice function...")
        try:
            result = rag_client.get_medical_advice("chest pain and shortness of breath")
            print(f"✅ Medical advice generated ({len(result['response'])} chars)")
            print(f"✅ Used {result['num_sources']} sources")
        except Exception as e:
            print(f"❌ Medical advice failed: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ RAG system test failed: {e}")
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print("🏥 MEDICAL RAG SYSTEM - COMPREHENSIVE TESTING")
    print("=" * 60)
    
    # Test 1: Data Processing
    processing_success = test_data_processing()
    
    # Test 2: Vector Database
    if processing_success:
        db_success = test_vector_database()
    else:
        print("\n⚠️ Skipping vector database test due to processing failure")
        db_success = False
    
    # Test 3: RAG System
    if db_success:
        rag_success = test_rag_system()
    else:
        print("\n⚠️ Skipping RAG system test due to database failure")
        rag_success = False
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Data Processing: {'✅ PASSED' if processing_success else '❌ FAILED'}")
    print(f"Vector Database: {'✅ PASSED' if db_success else '❌ FAILED'}")
    print(f"RAG System: {'✅ PASSED' if rag_success else '❌ FAILED'}")
    
    if all([processing_success, db_success, rag_success]):
        print("\n🎉 ALL TESTS PASSED! Your Medical RAG system is ready to use.")
        print("\nNext steps:")
        print("1. Run 'python gemini_rag_client.py' for interactive chat")
        print("2. Integrate the RAG client into your application")
        print("3. Customize prompts and parameters as needed")
    else:
        print("\n⚠️ Some tests failed. Please check the errors above.")
    
    return all([processing_success, db_success, rag_success])

if __name__ == "__main__":
    run_all_tests()
