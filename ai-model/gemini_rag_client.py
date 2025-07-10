"""
Gemini RAG Client for Medical AI Assistant
Integrates vector database search with Gemini API for medical consultations
"""
import google.generativeai as genai
from vector_db_manager import MedicalVectorDB
import config
from typing import List, Dict, Optional
import json

class MedicalRAGClient:
    def __init__(self, api_key: str = None):
        # Initialize Gemini API
        api_key = api_key or config.GEMINI_API_KEY
        if not api_key:
            raise ValueError("Gemini API key not provided. Set GEMINI_API_KEY in config or .env file")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Initialize vector database
        self.vector_db = MedicalVectorDB()
        
        # System prompt for medical assistant
        self.system_prompt = """You are an experienced doctor responding to a patient. Based on the medical knowledge and doctor-patient conversations provided, respond exactly like a real doctor would - with empathy, medical expertise, and practical advice.

COMMUNICATION STYLE (Learn from the examples below):
- Use the same tone, language patterns, and approach as the doctors in the conversation examples
- Be conversational and natural like the doctors in the examples
- Ask follow-up questions when doctors do in similar situations
- Use similar phrasing and medical explanations as shown in the examples
- Be direct but empathetic, matching the doctor's communication style

CRITICAL RULES:
- Do NOT start with formal greetings like "Hello, nice to meet you"
- Study how doctors in the examples start their responses and follow that pattern
- Focus on the medical issue immediately, like doctors do
- Use natural, conversational language as shown in the examples

RESPONSE GUIDELINES:
1. **Follow Doctor Examples**: Mirror the communication style from the doctor-patient conversations provided
2. **For Symptom Relief**: Suggest treatments and medications as doctors do in the examples
3. **For Medical Questions**: Explain conditions and treatments using similar language patterns as the example doctors
4. **For Prescriptions**: Provide detailed prescriptions when appropriate, following the format used by doctors in examples

DOCTOR-PATIENT CONVERSATION EXAMPLES (Study these communication patterns):
{context}

CURRENT PATIENT QUESTION: {question}

Respond exactly like the doctors in the conversation examples above would respond to this question. Use their natural, conversational style and approach."""
    
    def retrieve_relevant_context(self, query: str, n_results: int = config.TOP_K_RESULTS,
                                doc_types: Optional[List[str]] = None) -> List[Dict]:
        """Retrieve relevant documents from vector database"""
        return self.vector_db.search_similar(query, n_results, doc_types)
    
    def format_context(self, retrieved_docs: List[Dict]) -> str:
        """Format retrieved documents into context string"""
        if not retrieved_docs:
            return "No relevant information found in the knowledge base."

        context_parts = []
        dialogue_examples = []
        medicine_info = []
        medical_info = []

        for i, doc in enumerate(retrieved_docs, 1):
            doc_type = doc['metadata']['type']
            similarity = doc['similarity_score']
            content = doc['document']

            if doc_type == 'dialogue':
                dialogue_examples.append(f"[Doctor-Patient Conversation Example {len(dialogue_examples)+1}]:\n{content}")
            elif doc_type in ['medicine_basic', 'medicine_detailed']:
                medicine_info.append(f"[Medicine Information {len(medicine_info)+1}]:\n{content}")
            else:
                medical_info.append(f"[Medical Reference {len(medical_info)+1} - {doc_type.title()}]:\n{content}")

        # Put dialogue examples first to teach the AI how doctors communicate
        if dialogue_examples:
            context_parts.append("=== DOCTOR-PATIENT CONVERSATION EXAMPLES (Study these communication patterns carefully) ===")
            context_parts.append("Learn how these doctors respond naturally and conversationally:")
            context_parts.extend(dialogue_examples)
            context_parts.append("\n=== END OF CONVERSATION EXAMPLES ===")
            context_parts.append("Now respond to the current patient using the same natural, conversational style as the doctors above.")

        # Prioritize medicine information for prescriptions
        if medicine_info:
            context_parts.append("\n=== AVAILABLE MEDICINES FOR PRESCRIPTION ===")
            context_parts.extend(medicine_info)

        if medical_info:
            context_parts.append("\n=== ADDITIONAL MEDICAL INFORMATION ===")
            context_parts.extend(medical_info)

        return "\n\n".join(context_parts)
    
    def generate_response(self, question: str, context: str) -> str:
        """Generate response using Gemini API"""
        try:
            prompt = self.system_prompt.format(context=context, question=question)
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"Error generating response: {e}"
    
    def chat(self, user_question: str, doc_types: Optional[List[str]] = None,
             n_results: int = config.TOP_K_RESULTS) -> Dict:
        """Main chat function that combines retrieval and generation"""

        # Step 1: Retrieve relevant context with smart prioritization
        print(f"Searching for relevant information...")

        # Check if question is about medicine/treatment/relief
        medicine_keywords = ['medicine', 'medication', 'drug', 'treatment', 'relief', 'cure', 'tablet', 'syrup', 'prescription', 'dosage']
        is_medicine_query = any(keyword in user_question.lower() for keyword in medicine_keywords)

        # ALWAYS prioritize doctor-patient conversation examples for natural communication
        dialogue_docs = self.retrieve_relevant_context(user_question, 3, ['dialogue'])

        if is_medicine_query:
            # For medicine queries: dialogue examples + medicine info + other medical info
            medicine_docs = self.retrieve_relevant_context(user_question, 3, ['medicine_basic', 'medicine_detailed'])
            other_docs = self.retrieve_relevant_context(user_question, 2, ['faq', 'symptom_pattern', 'precaution'])
            retrieved_docs = dialogue_docs + medicine_docs + other_docs
        else:
            # For general queries: dialogue examples + relevant medical information
            other_docs = self.retrieve_relevant_context(user_question, 4, ['faq', 'symptom_pattern', 'precaution', 'disease_description'])
            retrieved_docs = dialogue_docs + other_docs

        # Step 2: Format context
        context = self.format_context(retrieved_docs)

        # Step 3: Generate response
        print(f"Generating response...")
        response = self.generate_response(user_question, context)
        
        # Return complete result
        return {
            'question': user_question,
            'response': response,
            'retrieved_documents': retrieved_docs,
            'context_used': context,
            'num_sources': len(retrieved_docs)
        }
    
    def chat_with_history(self, conversation_history: List[Dict], 
                         current_question: str) -> Dict:
        """Chat with conversation history for context"""
        
        # Combine current question with recent history for better retrieval
        history_context = ""
        if conversation_history:
            recent_messages = conversation_history[-3:]  # Last 3 exchanges
            history_context = " ".join([
                f"{msg.get('question', '')} {msg.get('response', '')}" 
                for msg in recent_messages
            ])
        
        # Enhanced query for retrieval
        enhanced_query = f"{history_context} {current_question}".strip()
        
        return self.chat(enhanced_query)
    
    def get_medical_advice(self, symptoms: str, additional_info: str = "") -> Dict:
        """Specialized function for symptom-based queries"""
        
        # Focus on symptom-related document types
        relevant_types = ['symptom_pattern', 'disease_description', 'precaution', 'faq']
        
        query = f"symptoms: {symptoms}"
        if additional_info:
            query += f" additional information: {additional_info}"
        
        result = self.chat(query, doc_types=relevant_types, n_results=7)
        
        # Add medical disclaimer
        disclaimer = "\n\n⚠️ MEDICAL DISCLAIMER: This information is for educational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment."
        
        result['response'] += disclaimer
        return result
    
    def search_knowledge_base(self, query: str, doc_type: str = None) -> List[Dict]:
        """Search the knowledge base directly without generating a response"""
        doc_types = [doc_type] if doc_type else None
        return self.retrieve_relevant_context(query, n_results=10, doc_types=doc_types)

def interactive_medical_chat():
    """Interactive chat interface for testing"""
    print("🏥 Medical AI Assistant (Powered by Gemini + RAG)")
    print("Type 'quit' to exit, 'help' for commands")
    print("-" * 50)
    
    try:
        rag_client = MedicalRAGClient()
        conversation_history = []
        
        while True:
            user_input = input("\n👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye! Stay healthy!")
                break
            
            if user_input.lower() == 'help':
                print("""
Available commands:
- Just type your medical question naturally
- 'symptoms: [describe symptoms]' for symptom-based advice
- 'search: [query]' to search knowledge base only
- 'stats' to see database statistics
- 'quit' to exit
                """)
                continue
            
            if user_input.lower() == 'stats':
                stats = rag_client.vector_db.get_collection_stats()
                print(f"\n📊 Database Stats:")
                print(f"Total documents: {stats['total_documents']}")
                for doc_type, count in stats['document_types'].items():
                    print(f"  {doc_type}: {count}")
                continue
            
            if user_input.lower().startswith('search:'):
                query = user_input[7:].strip()
                results = rag_client.search_knowledge_base(query)
                print(f"\n🔍 Found {len(results)} relevant documents:")
                for i, doc in enumerate(results[:5], 1):
                    print(f"{i}. [{doc['metadata']['type']}] Score: {doc['similarity_score']:.3f}")
                    print(f"   {doc['document'][:150]}...")
                continue
            
            if user_input.lower().startswith('symptoms:'):
                symptoms = user_input[9:].strip()
                result = rag_client.get_medical_advice(symptoms)
            else:
                result = rag_client.chat_with_history(conversation_history, user_input)
            
            print(f"\n🤖 Medical Assistant:")
            print(result['response'])
            print(f"\n📚 Sources used: {result['num_sources']}")
            
            # Add to conversation history
            conversation_history.append({
                'question': user_input,
                'response': result['response']
            })
            
            # Keep only recent history
            if len(conversation_history) > 10:
                conversation_history = conversation_history[-10:]
    
    except Exception as e:
        print(f"Error initializing chat: {e}")
        print("Make sure you have:")
        print("1. Set GEMINI_API_KEY in your .env file")
        print("2. Run the data processing and vector DB setup first")

if __name__ == "__main__":
    interactive_medical_chat()
