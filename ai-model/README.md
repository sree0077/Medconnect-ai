# Medical RAG System 🏥

A comprehensive Retrieval-Augmented Generation (RAG) system for medical AI assistance, combining multiple medical datasets with vector search and Gemini AI for intelligent health consultations.

## 📋 Overview

This system processes 5 different medical CSV files, creates embeddings, stores them in a vector database (ChromaDB), and provides intelligent responses using Google's Gemini API with relevant context retrieval.

### Data Sources
- **MTS-Dialog-TrainingSet.csv**: Doctor-patient conversations (11,458 dialogues)
- **symptom_Description.csv**: Disease descriptions (42 diseases)
- **symptom_precaution.csv**: Disease precautions (42 diseases)
- **trainQ&A.csv**: Medical Q&A pairs (10,523 entries)
- **training_data.csv**: Symptom-to-diagnosis patterns (4,921 cases, 132 symptoms)

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### 2. Setup API Key

```bash
# Copy the template and add your Gemini API key
cp .env.template .env
# Edit .env and add your GEMINI_API_KEY
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### 3. Process Data and Setup Vector Database

```bash
# Process all CSV files and create embeddings
python medical_rag_processor.py

# Load processed data into ChromaDB
python vector_db_manager.py
```

### 4. Test the System

```bash
# Run comprehensive tests
python test_rag_system.py
```

### 5. Start Interactive Chat

```bash
# Launch interactive medical assistant
python gemini_rag_client.py
```

## 📁 File Structure

```
medical-rag-system/
├── config.py                    # Configuration settings
├── medical_rag_processor.py     # Data processing and embedding generation
├── vector_db_manager.py         # ChromaDB operations
├── gemini_rag_client.py         # RAG client with Gemini integration
├── test_rag_system.py          # Comprehensive testing suite
├── requirements.txt            # Python dependencies
├── .env.template              # Environment variables template
├── README.md                  # This file
└── medical_chroma_db/         # ChromaDB storage (created automatically)
```

## 🔧 System Architecture

### Data Processing Pipeline
1. **CSV Parsing**: Reads and cleans medical data from 5 CSV files
2. **Text Chunking**: Splits long documents with overlap for better retrieval
3. **Embedding Generation**: Uses `all-MiniLM-L6-v2` for semantic embeddings
4. **Vector Storage**: Stores in ChromaDB with metadata and document types

### Document Types
- `dialogue`: Doctor-patient conversations
- `disease_description`: Disease information and descriptions
- `precaution`: Disease prevention and care instructions
- `faq`: Medical Q&A pairs
- `symptom_pattern`: Symptom-to-diagnosis mappings

### RAG Pipeline
1. **Query Processing**: User question analysis
2. **Vector Search**: Semantic similarity search in ChromaDB
3. **Context Retrieval**: Top-K relevant documents
4. **Response Generation**: Gemini API with medical context
5. **Safety Filtering**: Medical disclaimers and safety guidelines

## 💻 Usage Examples

### Basic Chat
```python
from gemini_rag_client import MedicalRAGClient

rag_client = MedicalRAGClient()
result = rag_client.chat("What should I do for chest pain?")
print(result['response'])
```

### Symptom-Based Consultation
```python
result = rag_client.get_medical_advice(
    symptoms="fever, headache, body aches",
    additional_info="symptoms for 2 days"
)
print(result['response'])
```

### Search Knowledge Base
```python
results = rag_client.search_knowledge_base("diabetes treatment")
for doc in results:
    print(f"Type: {doc['metadata']['type']}")
    print(f"Content: {doc['document'][:200]}...")
```

## ⚙️ Configuration

Edit `config.py` to customize:

```python
# Vector Database Settings
CHROMA_DB_PATH = "./medical_chroma_db"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# RAG Settings
TOP_K_RESULTS = 5
SIMILARITY_THRESHOLD = 0.7
CHUNK_SIZE = 512
```

## 🧪 Testing

The system includes comprehensive tests:

```bash
python test_rag_system.py
```

Tests cover:
- ✅ Data processing from all CSV files
- ✅ Embedding generation
- ✅ Vector database operations
- ✅ Similarity search functionality
- ✅ RAG pipeline with Gemini API
- ✅ Medical advice generation

## 📊 Database Statistics

After processing, you'll have approximately:
- **Total Documents**: ~25,000+ embedded documents
- **Document Types**: 5 different medical knowledge types
- **Vector Dimensions**: 384 (MiniLM-L6-v2)
- **Storage**: Local ChromaDB (~500MB)

## 🔒 Safety Features

- **Medical Disclaimers**: Automatic safety warnings
- **Professional Advice**: Recommends consulting healthcare providers
- **Context-Based**: Only responds with relevant medical information
- **No Diagnosis**: Avoids definitive medical diagnoses
- **Dosage Safety**: No specific medication dosage recommendations

## 🚨 Important Medical Disclaimer

⚠️ **This system is for educational and informational purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.**

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Error**
   ```
   Error: GEMINI_API_KEY not set
   ```
   Solution: Add your Gemini API key to `.env` file

2. **Missing CSV Files**
   ```
   Error: File not found
   ```
   Solution: Ensure all 5 CSV files are in the project directory

3. **Memory Issues**
   ```
   Error: Out of memory during embedding
   ```
   Solution: Reduce `BATCH_SIZE` in `config.py`

4. **ChromaDB Issues**
   ```
   Error: Collection already exists
   ```
   Solution: Delete `medical_chroma_db/` folder and restart

## 🔄 Extending the System

### Adding New Data Sources
1. Create a new processor method in `MedicalDataProcessor`
2. Add file path to `config.CSV_FILES`
3. Update document type in `config.DOC_TYPES`
4. Reprocess data

### Using Different Embedding Models
```python
# In config.py
EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"  # Better quality
# or
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L12-v2"  # Larger model
```

### Integrating with OpenAI
```python
# Alternative to Gemini - modify gemini_rag_client.py
import openai
openai.api_key = config.OPENAI_API_KEY
```

## 📈 Performance Optimization

- **Batch Processing**: Embeddings generated in configurable batches
- **Efficient Storage**: ChromaDB with optimized indexing
- **Chunking Strategy**: Overlapping chunks for better context
- **Caching**: Vector embeddings cached in database
- **Memory Management**: Streaming processing for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Sentence Transformers**: For embedding models
- **ChromaDB**: For vector database functionality
- **Google Gemini**: For AI response generation
- **Medical Datasets**: Various open-source medical datasets
