"""
Flask API service for Medical RAG System
Exposes the RAG functionality as REST endpoints for the main application
"""
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# Add user site-packages to Python path for globally installed packages
user_site_packages = '/home/sreeraj/.local/lib/python3.10/site-packages'
if user_site_packages not in sys.path:
    sys.path.insert(0, user_site_packages)

# Add the ai-model directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai-model'))

try:
    from gemini_rag_client import MedicalRAGClient
    from vector_db_manager import MedicalVectorDB
except ImportError as e:
    print(f"Error importing RAG modules: {e}")
    print("Make sure the ai-model directory is properly set up")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global RAG client instance
rag_client = None

def initialize_rag_client():
    """Initialize the RAG client with error handling"""
    global rag_client
    try:
        logger.info("Initializing Medical RAG Client...")
        rag_client = MedicalRAGClient()
        logger.info("RAG Client initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize RAG client: {e}")
        return False

# Initialize RAG client on startup (Flask 3.0+ compatible)
def startup():
    """Initialize services on startup"""
    if not initialize_rag_client():
        logger.error("Failed to start AI service - RAG client initialization failed")

# Call startup function immediately
startup()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Medical RAG AI Service',
        'timestamp': datetime.now().isoformat(),
        'rag_client_ready': rag_client is not None
    })

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """
    Main chat endpoint using RAG
    Expects: { "message": "user question", "conversation_history": [...] }
    """
    try:
        if not rag_client:
            return jsonify({'error': 'AI service not initialized'}), 500
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        conversation_history = data.get('conversation_history', [])
        
        logger.info(f"Processing chat message: {user_message[:100]}...")
        
        # Use RAG with conversation history
        if conversation_history:
            result = rag_client.chat_with_history(conversation_history, user_message)
        else:
            result = rag_client.chat(user_message)
        
        response = {
            'response': result['response'],
            'sources_used': result['num_sources'],
            'timestamp': datetime.now().isoformat(),
            'conversation_id': data.get('conversation_id'),
            'metadata': {
                'retrieved_documents': len(result.get('retrieved_documents', [])),
                'context_length': len(result.get('context_used', ''))
            }
        }
        
        logger.info(f"Chat response generated successfully with {result['num_sources']} sources")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': 'Failed to process chat message',
            'details': str(e) if app.debug else 'Internal server error'
        }), 500



@app.route('/api/ai/search', methods=['POST'])
def search_knowledge_base():
    """
    Search the medical knowledge base
    Expects: { "query": "search query", "doc_type": "optional document type" }
    """
    try:
        if not rag_client:
            return jsonify({'error': 'AI service not initialized'}), 500
        
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query'].strip()
        doc_type = data.get('doc_type')
        
        logger.info(f"Searching knowledge base for: {query[:100]}...")
        
        # Search knowledge base
        results = rag_client.search_knowledge_base(query, doc_type)
        
        response = {
            'results': results,
            'total_results': len(results),
            'query': query,
            'doc_type_filter': doc_type,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Knowledge base search completed with {len(results)} results")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return jsonify({
            'error': 'Failed to search knowledge base',
            'details': str(e) if app.debug else 'Internal server error'
        }), 500

@app.route('/api/ai/stats', methods=['GET'])
def get_stats():
    """Get database and system statistics"""
    try:
        if not rag_client:
            return jsonify({'error': 'AI service not initialized'}), 500
        
        # Get vector database statistics
        stats = rag_client.vector_db.get_collection_stats()
        
        response = {
            'database_stats': stats,
            'service_info': {
                'status': 'operational',
                'timestamp': datetime.now().isoformat(),
                'embedding_model': 'all-MiniLM-L6-v2',
                'ai_model': 'Gemini 1.5 Flash'
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({
            'error': 'Failed to get statistics',
            'details': str(e) if app.debug else 'Internal server error'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Set debug mode based on environment
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('AI_SERVICE_PORT', 5001))
    
    logger.info(f"Starting Medical RAG AI Service on port {port}")
    logger.info(f"Debug mode: {debug_mode}")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
