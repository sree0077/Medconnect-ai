#!/bin/bash

# Simple Medical RAG AI Service Startup Script
# Uses global Python installation (no virtual environment)

echo "🏥 Starting Medical RAG AI Service (Simple Mode)..."

# Check if we should skip dependency check
if [ "$SKIP_DEPS" = "1" ]; then
    echo "⚠️  Skipping dependency check (SKIP_DEPS=1)"
    PYTHON_CMD="python3"
else
    # Check if dependencies are available globally
    echo "🔍 Checking for required Python packages..."

# Function to check individual packages for better debugging
check_packages() {
    local python_cmd=$1
    local missing_packages=()

    echo "Testing packages with $python_cmd..."
    echo "Python path includes: ~/.local/lib/python3.10/site-packages"

    # Set PYTHONPATH to include user site-packages
    export PYTHONPATH="/home/sreeraj/.local/lib/python3.10/site-packages:$PYTHONPATH"

    # Check each package individually
    for package in flask chromadb google.generativeai pandas sentence_transformers; do
        if $python_cmd -c "import sys; sys.path.insert(0, '/home/sreeraj/.local/lib/python3.10/site-packages'); import $package" 2>/dev/null; then
            echo "  ✅ $package"
        else
            echo "  ❌ $package"
            missing_packages+=($package)
        fi
    done

    if [ ${#missing_packages[@]} -eq 0 ]; then
        echo "✅ All packages found with $python_cmd"
        return 0
    else
        echo "❌ Missing packages with $python_cmd: ${missing_packages[*]}"
        return 1
    fi
}

# Try different Python commands
PYTHON_CMD=""

if check_packages "python3"; then
    PYTHON_CMD="python3"
elif check_packages "python"; then
    PYTHON_CMD="python"
else
    echo ""
    echo "❌ Some required dependencies not found."
    echo ""
    echo "Based on your system, you have most packages installed but are missing Flask."
    echo "You have these packages already installed in ~/.local/lib/python3.10/site-packages:"
    echo "  ✅ chromadb==1.0.13"
    echo "  ✅ google-generativeai==0.8.5"
    echo "  ✅ pandas==2.3.0"
    echo "  ✅ sentence-transformers==5.0.0"
    echo ""
    echo "To install only the missing Flask package:"
    echo "  pip3 install --user Flask Flask-CORS python-dotenv"
    echo ""
    echo "Or skip dependency check entirely:"
    echo "  SKIP_DEPS=1 ./start.sh"
    exit 1
fi

echo "✅ Using $PYTHON_CMD for AI service"
fi

# Set environment variables
export FLASK_APP=app.py
export FLASK_DEBUG=true
export AI_SERVICE_PORT=5001

# Copy .env from backend if it exists and local .env doesn't exist
if [ -f "../backend/.env" ] && [ ! -f ".env" ]; then
    echo "📋 Copying environment variables from backend..."
    cp ../backend/.env .env
fi

# Start the service
echo "🚀 Starting AI service on port 5001 with $PYTHON_CMD..."
$PYTHON_CMD app.py
