"""
Medical RAG Data Processor
Processes CSV files and creates embeddings for vector database storage
"""
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple
import json
import re
from tqdm import tqdm
import config

class MedicalDataProcessor:
    def __init__(self):
        self.model = SentenceTransformer(config.EMBEDDING_MODEL)
        self.processed_documents = []
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if pd.isna(text) or text == "":
            return ""
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', str(text).strip())
        # Remove special characters but keep medical punctuation
        text = re.sub(r'[^\w\s\.\,\?\!\:\;\-\(\)]', ' ', text)
        return text
    
    def chunk_text(self, text: str, max_length: int = config.CHUNK_SIZE) -> List[str]:
        """Split text into chunks with overlap"""
        if len(text) <= max_length:
            return [text]
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + max_length
            if end >= len(text):
                chunks.append(text[start:])
                break
            
            # Find the last sentence boundary within the chunk
            chunk = text[start:end]
            last_period = chunk.rfind('.')
            last_question = chunk.rfind('?')
            last_exclamation = chunk.rfind('!')
            
            boundary = max(last_period, last_question, last_exclamation)
            if boundary > start + max_length // 2:  # Ensure chunk isn't too small
                end = start + boundary + 1
            
            chunks.append(text[start:end].strip())
            start = end - config.OVERLAP_SIZE
            
        return chunks
    
    def process_dialogues(self, file_path: str) -> List[Dict]:
        """Process MTS-Dialog training data"""
        print("Processing dialogue data...")
        df = pd.read_csv(file_path)
        documents = []
        
        for idx, row in tqdm(df.iterrows(), total=len(df)):
            dialogue = self.clean_text(row['dialogue'])
            section_text = self.clean_text(row.get('section_text', ''))
            section_header = self.clean_text(row.get('section_header', ''))
            
            if dialogue:
                # Create document with context
                content = f"Medical Dialogue:\n{dialogue}"
                if section_text:
                    content += f"\n\nContext: {section_text}"
                if section_header:
                    content += f"\nSection: {section_header}"
                
                chunks = self.chunk_text(content)
                for i, chunk in enumerate(chunks):
                    doc = {
                        "id": f"{config.DOC_TYPES['dialogue']}{idx}_{i}",
                        "document": chunk,
                        "metadata": {
                            "type": "dialogue",
                            "source_file": "MTS-Dialog-TrainingSet.csv",
                            "original_id": idx,
                            "chunk_index": i,
                            "section_header": section_header
                        }
                    }
                    documents.append(doc)
        
        return documents
    
    def process_disease_descriptions(self, file_path: str) -> List[Dict]:
        """Process disease description data"""
        print("Processing disease descriptions...")
        df = pd.read_csv(file_path)
        documents = []
        
        for idx, row in tqdm(df.iterrows(), total=len(df)):
            disease = self.clean_text(row['Disease'])
            description = self.clean_text(row['Description'])
            
            if disease and description:
                content = f"Disease: {disease}\n\nDescription: {description}"
                
                doc = {
                    "id": f"{config.DOC_TYPES['disease_desc']}{idx}",
                    "document": content,
                    "metadata": {
                        "type": "disease_description",
                        "source_file": "symptom_Description.csv",
                        "disease": disease,
                        "original_id": idx
                    }
                }
                documents.append(doc)
        
        return documents
    
    def process_precautions(self, file_path: str) -> List[Dict]:
        """Process disease precaution data"""
        print("Processing precautions...")
        df = pd.read_csv(file_path)
        documents = []
        
        for idx, row in tqdm(df.iterrows(), total=len(df)):
            disease = self.clean_text(row['Disease'])
            precautions = []
            
            for i in range(1, 5):
                precaution = self.clean_text(row.get(f'Precaution_{i}', ''))
                if precaution:
                    precautions.append(precaution)
            
            if disease and precautions:
                content = f"Disease: {disease}\n\nPrecautions:\n"
                content += "\n".join([f"• {p}" for p in precautions])
                
                doc = {
                    "id": f"{config.DOC_TYPES['precaution']}{idx}",
                    "document": content,
                    "metadata": {
                        "type": "precaution",
                        "source_file": "symptom_precaution.csv",
                        "disease": disease,
                        "precaution_count": len(precautions),
                        "original_id": idx
                    }
                }
                documents.append(doc)
        
        return documents
    
    def process_qna(self, file_path: str) -> List[Dict]:
        """Process Q&A data"""
        print("Processing Q&A data...")
        df = pd.read_csv(file_path)
        documents = []
        
        for idx, row in tqdm(df.iterrows(), total=len(df)):
            question = self.clean_text(row['Question'])
            answer = self.clean_text(row['Answer'])
            qtype = self.clean_text(row.get('qtype', ''))
            
            if question and answer:
                content = f"Q: {question}\n\nA: {answer}"
                
                chunks = self.chunk_text(content)
                for i, chunk in enumerate(chunks):
                    doc = {
                        "id": f"{config.DOC_TYPES['faq']}{idx}_{i}",
                        "document": chunk,
                        "metadata": {
                            "type": "faq",
                            "source_file": "trainQ&A.csv",
                            "question_type": qtype,
                            "original_id": idx,
                            "chunk_index": i
                        }
                    }
                    documents.append(doc)
        
        return documents

    def process_symptom_patterns(self, file_path: str) -> List[Dict]:
        """Process symptom-to-diagnosis training data"""
        print("Processing symptom patterns...")
        df = pd.read_csv(file_path)
        documents = []

        # Get symptom column names (all except 'prognosis')
        symptom_cols = [col for col in df.columns if col != 'prognosis']

        for idx, row in tqdm(df.iterrows(), total=len(df)):
            prognosis = self.clean_text(row['prognosis'])
            if not prognosis:
                continue

            # Get active symptoms (value = 1)
            active_symptoms = [col.replace('_', ' ') for col in symptom_cols if row[col] == 1]

            if active_symptoms:
                content = f"Diagnosis: {prognosis}\n\nSymptoms:\n"
                content += "\n".join([f"• {symptom}" for symptom in active_symptoms])
                content += f"\n\nThis pattern of {len(active_symptoms)} symptoms is associated with {prognosis}."

                doc = {
                    "id": f"{config.DOC_TYPES['symptom_pattern']}{idx}",
                    "document": content,
                    "metadata": {
                        "type": "symptom_pattern",
                        "source_file": "training_data.csv",
                        "diagnosis": prognosis,
                        "symptom_count": len(active_symptoms),
                        "symptoms": ", ".join(active_symptoms),  # Convert list to string
                        "original_id": idx
                    }
                }
                documents.append(doc)

        return documents

    def process_basic_medicines(self, file_path: str, max_records: int = 1000) -> List[Dict]:
        """Process basic medicine dataset (limited for efficiency)"""
        print(f"Processing basic medicine data (first {max_records} records)...")
        df = pd.read_csv(file_path)
        df = df.head(max_records)  # Limit to first N records for efficiency
        documents = []

        for idx, row in tqdm(df.iterrows(), total=len(df)):
            # Create comprehensive medicine information
            content = f"Medicine: {row['Name']}\n\n"
            content += f"Category: {row['Category']}\n"
            content += f"Dosage Form: {row['Dosage Form']}\n"
            content += f"Strength: {row['Strength']}\n"
            content += f"Manufacturer: {row['Manufacturer']}\n"
            content += f"Indication: {row['Indication']}\n"
            content += f"Classification: {row['Classification']}\n\n"
            content += f"This {row['Category'].lower()} medicine {row['Name']} is available as {row['Dosage Form'].lower()} "
            content += f"with strength {row['Strength']} manufactured by {row['Manufacturer']}. "
            content += f"It is indicated for {row['Indication'].lower()} and classified as {row['Classification'].lower()}."

            doc = {
                "id": f"{config.DOC_TYPES['medicine_basic']}{idx}",
                "document": content,
                "metadata": {
                    "type": "medicine_basic",
                    "source_file": "medicine_dataset.csv",
                    "medicine_name": row['Name'],
                    "category": row['Category'],
                    "dosage_form": row['Dosage Form'],
                    "strength": row['Strength'],
                    "manufacturer": row['Manufacturer'],
                    "indication": row['Indication'],
                    "classification": row['Classification'],
                    "original_id": idx
                }
            }
            documents.append(doc)

        print(f"Processed {len(documents)} documents from {file_path}")
        return documents

    def process_detailed_medicines(self, file_path: str, max_records: int = 1000) -> List[Dict]:
        """Process detailed Indian medicine dataset (limited for efficiency)"""
        print(f"Processing detailed medicine data (first {max_records} records)...")
        df = pd.read_csv(file_path)
        df = df.head(max_records)  # Limit to first N records
        documents = []

        for idx, row in tqdm(df.iterrows(), total=len(df)):
            # Create comprehensive medicine information
            content = f"Medicine: {row['name']}\n\n"

            if not pd.isna(row['short_composition1']):
                content += f"Composition: {row['short_composition1']}"
                if not pd.isna(row['short_composition2']):
                    content += f" + {row['short_composition2']}"
                content += "\n"

            if not pd.isna(row['salt_composition']):
                content += f"Salt Composition: {row['salt_composition']}\n"

            content += f"Type: {row['type']}\n"
            content += f"Pack Size: {row['pack_size_label']}\n"
            content += f"Manufacturer: {row['manufacturer_name']}\n"
            content += f"Price: ₹{row['price']}\n"
            content += f"Status: {'Discontinued' if row['Is_discontinued'] else 'Available'}\n\n"

            if not pd.isna(row['medicine_desc']):
                content += f"Description:\n{row['medicine_desc']}\n\n"

            if not pd.isna(row['side_effects']):
                content += f"Side Effects: {row['side_effects']}\n\n"

            if not pd.isna(row['drug_interactions']) and row['drug_interactions'] != '{"drug": [], "brand": [], "effect": []}':
                content += f"Drug Interactions: {row['drug_interactions']}\n"

            doc = {
                "id": f"{config.DOC_TYPES['medicine_detailed']}{idx}",
                "document": content,
                "metadata": {
                    "type": "medicine_detailed",
                    "source_file": "updated_indian_medicine_data.csv",
                    "medicine_name": row['name'],
                    "price": float(row['price']) if not pd.isna(row['price']) else 0.0,
                    "is_discontinued": bool(row['Is_discontinued']),
                    "manufacturer": row['manufacturer_name'],
                    "medicine_type": row['type'],
                    "pack_size": row['pack_size_label'],
                    "composition": row['short_composition1'] if not pd.isna(row['short_composition1']) else "",
                    "original_id": idx
                }
            }
            documents.append(doc)

        print(f"Processed {len(documents)} documents from {file_path}")
        return documents

    def generate_embeddings(self, documents: List[Dict]) -> List[Dict]:
        """Generate embeddings for all documents"""
        print("Generating embeddings...")

        # Extract texts for batch processing
        texts = [doc['document'] for doc in documents]

        # Generate embeddings in batches
        embeddings = []
        for i in tqdm(range(0, len(texts), config.BATCH_SIZE)):
            batch_texts = texts[i:i + config.BATCH_SIZE]
            batch_embeddings = self.model.encode(batch_texts, convert_to_tensor=False)
            embeddings.extend(batch_embeddings)

        # Add embeddings to documents
        for doc, embedding in zip(documents, embeddings):
            doc['embedding'] = embedding.tolist()

        return documents

    def process_all_files(self) -> List[Dict]:
        """Process all CSV files and return combined documents"""
        all_documents = []

        # Process each file type
        processors = [
            (config.CSV_FILES['dialogues'], self.process_dialogues),
            (config.CSV_FILES['descriptions'], self.process_disease_descriptions),
            (config.CSV_FILES['precautions'], self.process_precautions),
            (config.CSV_FILES['qna'], self.process_qna),
            (config.CSV_FILES['symptoms'], self.process_symptom_patterns),
            (config.CSV_FILES['medicines_basic'], self.process_basic_medicines),
            (config.CSV_FILES['medicines_detailed'], self.process_detailed_medicines)
        ]

        for file_path, processor_func in processors:
            try:
                documents = processor_func(file_path)
                all_documents.extend(documents)
                print(f"Processed {len(documents)} documents from {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
                continue

        print(f"\nTotal documents before embedding: {len(all_documents)}")

        # Generate embeddings for all documents
        all_documents = self.generate_embeddings(all_documents)

        self.processed_documents = all_documents
        return all_documents

    def save_processed_data(self, output_file: str = "processed_medical_data.json"):
        """Save processed documents to JSON file"""
        if not self.processed_documents:
            print("No processed documents to save. Run process_all_files() first.")
            return

        print(f"Saving {len(self.processed_documents)} documents to {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.processed_documents, f, indent=2, ensure_ascii=False)

        print(f"Data saved to {output_file}")

if __name__ == "__main__":
    processor = MedicalDataProcessor()
    documents = processor.process_all_files()
    processor.save_processed_data()

    print(f"\nProcessing complete!")
    print(f"Total documents: {len(documents)}")

    # Print sample documents
    print("\nSample documents:")
    for doc_type in config.DOC_TYPES.keys():
        sample = next((doc for doc in documents if doc['metadata']['type'] == doc_type), None)
        if sample:
            print(f"\n{doc_type.upper()}:")
            print(f"ID: {sample['id']}")
            print(f"Content: {sample['document'][:200]}...")
            print(f"Metadata: {sample['metadata']}")
