#!/bin/bash

echo "🏥 MedConnect AI - AI Consultation RAG Integration Setup"
echo "========================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "ai-model" ]; then
    echo "❌ Error: Please run this script from the medconnect-ai root directory"
    exit 1
fi

echo "✅ Found medconnect-ai project structure"

# Step 1: Set up AI Service
echo ""
echo "📦 Step 1: Setting up AI Service..."
cd ai-service

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    echo "Please install Python 3 and try again"
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

cd ..

# Step 2: Check if ChromaDB is set up
echo ""
echo "📊 Step 2: Checking RAG Database..."
if [ -d "ai-model/medical_chroma_db" ] && [ -f "ai-model/processed_medical_data.json" ]; then
    echo "✅ RAG database found - ready to use!"
else
    echo "⚠️  RAG database not found. Setting up..."
    cd ai-model
    
    # Activate virtual environment for ai-model setup
    if [ -d "../ai-service/venv" ]; then
        source ../ai-service/venv/bin/activate
    fi
    
    echo "🔧 Processing medical data and creating vector database..."
    python medical_rag_processor.py
    
    echo "🔧 Setting up vector database..."
    python vector_db_manager.py
    
    echo "🧪 Testing RAG system..."
    python test_rag_system.py
    
    cd ..
fi

# Step 3: Install frontend dependencies if needed
echo ""
echo "📦 Step 3: Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
cd ..

# Step 4: Install backend dependencies if needed
echo ""
echo "📦 Step 4: Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi
cd ..

# Step 5: Environment setup
echo ""
echo "🔧 Step 5: Environment Configuration..."
if [ ! -f "ai-service/.env" ]; then
    echo "🔧 Copying environment variables to AI service..."
    cp backend/.env ai-service/.env
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the integrated system:"
echo ""
echo "1. Start the AI Service (Terminal 1):"
echo "   cd ai-service && ./start.sh"
echo ""
echo "2. Start the Backend (Terminal 2):"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the Frontend (Terminal 3):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open your browser and navigate to the patient dashboard"
echo "   Click on 'AI Consultation' to use the new RAG-powered chat!"
echo ""
echo "📝 Notes:"
echo "- The AI service runs on port 5001"
echo "- Backend runs on port 5000"
echo "- Frontend runs on port 5173"
echo "- Make sure all three services are running for full functionality"
echo "- The Symptom Checker continues to use the original logic (unchanged)"
echo "- Only the AI Consultation feature uses the new RAG system"
echo ""
echo "🔍 Troubleshooting:"
echo "- If AI service fails to start, check that GEMINI_API_KEY is set in backend/.env"
echo "- If RAG responses seem slow, this is normal for the first few queries"
echo "- Check the console logs in each terminal for detailed error messages"
echo "- If AI Consultation shows 'Coming Soon', make sure the AI service is running"
