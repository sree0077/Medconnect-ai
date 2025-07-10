"""
Setup script for Medical RAG System
Automates the complete setup process
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_files():
    """Check if required CSV files exist"""
    required_files = [
        "MTS-Dialog-TrainingSet.csv",
        "symptom_Description.csv", 
        "symptom_precaution.csv",
        "trainQ&A.csv",
        "training_data.csv"
    ]
    
    print("\n📁 Checking for required CSV files...")
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ Found: {file}")
        else:
            print(f"❌ Missing: {file}")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n⚠️ Missing {len(missing_files)} required files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure all CSV files are in the project directory before running setup.")
        return False
    
    return True

def setup_environment():
    """Setup Python environment and install dependencies"""
    print("\n🐍 Setting up Python environment...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        return False
    
    return True

def setup_env_file():
    """Setup environment file"""
    print("\n🔑 Setting up environment file...")
    
    if os.path.exists(".env"):
        print("✅ .env file already exists")
        return True
    
    if os.path.exists(".env.template"):
        # Copy template
        with open(".env.template", "r") as template:
            content = template.read()
        
        with open(".env", "w") as env_file:
            env_file.write(content)
        
        print("✅ Created .env file from template")
        print("⚠️ Please edit .env file and add your GEMINI_API_KEY")
        print("   Get your API key from: https://makersuite.google.com/app/apikey")
        return True
    else:
        print("❌ .env.template not found")
        return False

def process_data():
    """Process medical data and create embeddings"""
    print("\n📊 Processing medical data...")
    
    if not run_command("python medical_rag_processor.py", "Processing CSV files and generating embeddings"):
        return False
    
    return True

def setup_vector_db():
    """Setup vector database"""
    print("\n🗄️ Setting up vector database...")
    
    if not run_command("python vector_db_manager.py", "Loading data into ChromaDB"):
        return False
    
    return True

def run_tests():
    """Run system tests"""
    print("\n🧪 Running system tests...")
    
    if not run_command("python test_rag_system.py", "Running comprehensive tests"):
        return False
    
    return True

def main():
    """Main setup function"""
    print("🏥 MEDICAL RAG SYSTEM - AUTOMATED SETUP")
    print("=" * 50)
    
    steps = [
        ("Checking CSV files", check_files),
        ("Setting up environment", setup_environment),
        ("Setting up .env file", setup_env_file),
        ("Processing medical data", process_data),
        ("Setting up vector database", setup_vector_db),
        ("Running tests", run_tests)
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 Step: {step_name}")
        if not step_func():
            print(f"\n❌ Setup failed at step: {step_name}")
            print("Please check the errors above and try again.")
            return False
    
    print("\n" + "=" * 50)
    print("🎉 SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\nYour Medical RAG system is ready to use!")
    print("\nNext steps:")
    print("1. Edit .env file and add your GEMINI_API_KEY if you haven't already")
    print("2. Run 'python gemini_rag_client.py' for interactive chat")
    print("3. Integrate the system into your application")
    print("\nFor help, see README.md or run 'python test_rag_system.py'")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
