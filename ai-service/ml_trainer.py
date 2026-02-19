"""
Legal Document ML Trainer
Trains custom machine learning models on legal documents
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import datetime
from pathlib import Path

# ML Libraries
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score
    from sklearn.preprocessing import LabelEncoder
    import joblib
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn not available. Install with: pip install scikit-learn")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("⚠️  sentence-transformers not available. Install with: pip install sentence-transformers")


class LegalMLTrainer:
    """
    Trains and manages ML models for legal document analysis.
    
    Models trained:
    1. Document Type Classifier - Classifies document types
    2. Clause Risk Classifier - Predicts risk level of clauses
    3. Clause Type Classifier - Identifies clause types
    4. Semantic Embeddings - For similarity search
    """
    
    def __init__(self, models_dir: str = "models"):
        """Initialize the trainer."""
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        
        # Model storage
        self.doc_type_model = None
        self.doc_type_vectorizer = None
        self.doc_type_encoder = None
        
        self.clause_risk_model = None
        self.clause_risk_vectorizer = None
        
        self.clause_type_model = None
        self.clause_type_vectorizer = None
        self.clause_type_encoder = None
        
        self.embedding_model = None
        
        # Load existing models if available
        self.load_models()
    
    def create_synthetic_training_data(self) -> Dict[str, pd.DataFrame]:
        """
        Create synthetic training data for demonstration.
        In production, this would be replaced with real legal documents.
        """
        
        # 1. Document Type Training Data
        doc_type_data = {
            'text': [
                # Employment Agreements
                "This Employment Agreement is entered into between the Employer and Employee. The Employee agrees to work full-time for a salary of $80,000 per year. The employment term is indefinite with a 30-day notice period.",
                "Employment Contract: The Company hereby employs the Employee as a Software Engineer. Compensation includes base salary, benefits, and stock options. Non-compete clause applies for 12 months.",
                "This agreement governs the employment relationship. Employee will receive health insurance, paid time off, and retirement benefits. Termination requires cause or 60 days notice.",
                
                # Service Agreements
                "Service Agreement between Client and Consultant. The Consultant will provide software development services for a fee of $150/hour. Payment due within 15 days of invoice.",
                "This Consulting Agreement outlines the services to be provided. Deliverables include system design, implementation, and testing. Independent contractor status applies.",
                "Professional Services Contract: Provider agrees to deliver marketing services. Scope includes strategy, content creation, and analytics. Monthly retainer of $5,000.",
                
                # NDAs
                "Non-Disclosure Agreement: Both parties agree to keep confidential information secret. Proprietary data and trade secrets must not be disclosed to third parties.",
                "Confidentiality Agreement between the Disclosing Party and Receiving Party. All confidential information shall remain secret for 5 years after disclosure.",
                "This NDA protects sensitive business information. Recipient agrees not to use confidential data for any purpose other than the intended business relationship.",
                
                # Lease Agreements
                "Residential Lease Agreement: Landlord leases the premises to Tenant for monthly rent of $2,000. Lease term is 12 months with security deposit of $4,000.",
                "Commercial Lease: Tenant shall pay rent of $10,000 per month for office space. Lease includes utilities, parking, and maintenance. Term is 3 years.",
                "Rental Agreement for apartment located at 123 Main St. Rent due on 1st of each month. Pets not allowed. Tenant responsible for minor repairs.",
                
                # Sales Agreements
                "Purchase Agreement for the sale of goods. Buyer agrees to purchase 1000 units at $50 per unit. Delivery within 30 days. Payment on delivery.",
                "Sales Contract: Seller agrees to sell the property for $500,000. Buyer to pay 20% down payment. Closing date is 60 days from signing.",
                "Asset Purchase Agreement: Buyer purchases all business assets including inventory, equipment, and goodwill for total price of $1,000,000.",
            ],
            'document_type': [
                'Employment Agreement', 'Employment Agreement', 'Employment Agreement',
                'Service Agreement', 'Service Agreement', 'Service Agreement',
                'Non-Disclosure Agreement', 'Non-Disclosure Agreement', 'Non-Disclosure Agreement',
                'Lease Agreement', 'Lease Agreement', 'Lease Agreement',
                'Sales Agreement', 'Sales Agreement', 'Sales Agreement'
            ]
        }
        
        # 2. Clause Risk Training Data
        clause_risk_data = {
            'clause_text': [
                # High Risk
                "The Company may terminate this agreement at any time without cause and without notice.",
                "Employee waives all rights to sue the Company for any reason whatsoever.",
                "Unlimited liability for any damages arising from breach of this agreement.",
                "Non-compete clause prohibits working in the same industry for 5 years worldwide.",
                "Automatic renewal with no option to cancel unless 6 months advance notice given.",
                
                # Medium Risk
                "Liability is limited to the amount paid under this agreement in the last 12 months.",
                "Either party may terminate with 30 days written notice.",
                "Indemnification required for third-party claims arising from services provided.",
                "Non-compete restricted to 50-mile radius for 12 months after termination.",
                "Late payment subject to 1.5% monthly interest charge.",
                
                # Low Risk
                "This agreement may be terminated by mutual written consent of both parties.",
                "Standard confidentiality obligations apply to both parties equally.",
                "Payment due within 30 days of invoice date.",
                "Governing law shall be the laws of the State of California.",
                "Disputes shall be resolved through good faith negotiation first.",
            ],
            'risk_level': [
                'high', 'high', 'high', 'high', 'high',
                'medium', 'medium', 'medium', 'medium', 'medium',
                'low', 'low', 'low', 'low', 'low'
            ]
        }
        
        # 3. Clause Type Training Data
        clause_type_data = {
            'clause_text': [
                # Termination
                "Either party may terminate this agreement with 30 days written notice.",
                "This agreement may be terminated for cause upon material breach.",
                "Automatic termination occurs if either party files for bankruptcy.",
                
                # Liability Limitation
                "In no event shall the Company be liable for indirect or consequential damages.",
                "Maximum liability under this agreement is limited to $100,000.",
                "Company's liability shall not exceed the fees paid in the last 6 months.",
                
                # Confidentiality
                "All proprietary information must be kept confidential for 5 years.",
                "Recipient agrees not to disclose trade secrets to any third party.",
                "Confidential information includes customer lists, pricing, and business plans.",
                
                # Payment Terms
                "Payment is due within 15 days of invoice date.",
                "Client shall pay a monthly retainer of $5,000.",
                "Late payments subject to 1.5% interest per month.",
                
                # Indemnification
                "Provider shall indemnify Client against third-party claims.",
                "Each party agrees to hold the other harmless from negligence claims.",
                "Indemnification covers legal fees and damages from breach.",
                
                # Non-Compete
                "Employee shall not compete with Company for 12 months after termination.",
                "Non-compete applies within 50-mile radius of Company offices.",
                "Restriction includes working for competitors or starting competing business.",
            ],
            'clause_type': [
                'Termination', 'Termination', 'Termination',
                'Liability Limitation', 'Liability Limitation', 'Liability Limitation',
                'Confidentiality', 'Confidentiality', 'Confidentiality',
                'Payment Terms', 'Payment Terms', 'Payment Terms',
                'Indemnification', 'Indemnification', 'Indemnification',
                'Non-Compete', 'Non-Compete', 'Non-Compete'
            ]
        }
        
        return {
            'document_types': pd.DataFrame(doc_type_data),
            'clause_risks': pd.DataFrame(clause_risk_data),
            'clause_types': pd.DataFrame(clause_type_data)
        }
    
    def train_document_type_classifier(self, training_data: pd.DataFrame) -> Dict[str, Any]:
        """Train a model to classify document types."""
        if not SKLEARN_AVAILABLE:
            return {"error": "scikit-learn not available"}
        
        print("🎓 Training Document Type Classifier...")
        
        # Prepare data
        X = training_data['text']
        y = training_data['document_type']
        
        # Encode labels
        self.doc_type_encoder = LabelEncoder()
        y_encoded = self.doc_type_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
        
        # Vectorize text
        self.doc_type_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            stop_words='english'
        )
        X_train_vec = self.doc_type_vectorizer.fit_transform(X_train)
        X_test_vec = self.doc_type_vectorizer.transform(X_test)
        
        # Train model
        self.doc_type_model = LogisticRegression(max_iter=1000, random_state=42)
        self.doc_type_model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = self.doc_type_model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Save model
        self._save_model('doc_type_model', self.doc_type_model)
        self._save_model('doc_type_vectorizer', self.doc_type_vectorizer)
        self._save_model('doc_type_encoder', self.doc_type_encoder)
        
        print(f"✅ Document Type Classifier trained! Accuracy: {accuracy:.2%}")
        
        return {
            "model": "Document Type Classifier",
            "accuracy": accuracy,
            "classes": self.doc_type_encoder.classes_.tolist()
        }
    
    def train_clause_risk_classifier(self, training_data: pd.DataFrame) -> Dict[str, Any]:
        """Train a model to predict clause risk levels."""
        if not SKLEARN_AVAILABLE:
            return {"error": "scikit-learn not available"}
        
        print("🎓 Training Clause Risk Classifier...")
        
        # Prepare data
        X = training_data['clause_text']
        y = training_data['risk_level']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Vectorize text
        self.clause_risk_vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            stop_words='english'
        )
        X_train_vec = self.clause_risk_vectorizer.fit_transform(X_train)
        X_test_vec = self.clause_risk_vectorizer.transform(X_test)
        
        # Train model
        self.clause_risk_model = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
        self.clause_risk_model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = self.clause_risk_model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Save model
        self._save_model('clause_risk_model', self.clause_risk_model)
        self._save_model('clause_risk_vectorizer', self.clause_risk_vectorizer)
        
        print(f"✅ Clause Risk Classifier trained! Accuracy: {accuracy:.2%}")
        
        return {
            "model": "Clause Risk Classifier",
            "accuracy": accuracy,
            "classes": ['high', 'medium', 'low']
        }
    
    def train_clause_type_classifier(self, training_data: pd.DataFrame) -> Dict[str, Any]:
        """Train a model to identify clause types."""
        if not SKLEARN_AVAILABLE:
            return {"error": "scikit-learn not available"}
        
        print("🎓 Training Clause Type Classifier...")
        
        # Prepare data
        X = training_data['clause_text']
        y = training_data['clause_type']
        
        # Encode labels
        self.clause_type_encoder = LabelEncoder()
        y_encoded = self.clause_type_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
        
        # Vectorize text
        self.clause_type_vectorizer = TfidfVectorizer(
            max_features=800,
            ngram_range=(1, 3),
            stop_words='english'
        )
        X_train_vec = self.clause_type_vectorizer.fit_transform(X_train)
        X_test_vec = self.clause_type_vectorizer.transform(X_test)
        
        # Train model
        self.clause_type_model = MultinomialNB(alpha=0.1)
        self.clause_type_model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = self.clause_type_model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Save model
        self._save_model('clause_type_model', self.clause_type_model)
        self._save_model('clause_type_vectorizer', self.clause_type_vectorizer)
        self._save_model('clause_type_encoder', self.clause_type_encoder)
        
        print(f"✅ Clause Type Classifier trained! Accuracy: {accuracy:.2%}")
        
        return {
            "model": "Clause Type Classifier",
            "accuracy": accuracy,
            "classes": self.clause_type_encoder.classes_.tolist()
        }
    
    def train_embedding_model(self) -> Dict[str, Any]:
        """Load pre-trained sentence transformer for semantic embeddings."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            return {"error": "sentence-transformers not available"}
        
        print("🎓 Loading Sentence Transformer Model...")
        
        # Load pre-trained model optimized for legal/semantic similarity
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Save reference
        model_info = {
            "model_name": "all-MiniLM-L6-v2",
            "embedding_dim": 384,
            "loaded_at": datetime.now().isoformat()
        }
        
        with open(self.models_dir / 'embedding_model_info.json', 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print("✅ Embedding Model loaded!")
        
        return model_info
    
    def train_all_models(self) -> Dict[str, Any]:
        """Train all ML models."""
        print("\n" + "="*60)
        print("🚀 Starting ML Model Training for Legal Documents")
        print("="*60 + "\n")
        
        # Create synthetic training data
        print("📊 Creating synthetic training data...")
        training_data = self.create_synthetic_training_data()
        print(f"✅ Created {len(training_data)} datasets\n")
        
        results = {}
        
        # Train each model
        results['document_type'] = self.train_document_type_classifier(
            training_data['document_types']
        )
        print()
        
        results['clause_risk'] = self.train_clause_risk_classifier(
            training_data['clause_risks']
        )
        print()
        
        results['clause_type'] = self.train_clause_type_classifier(
            training_data['clause_types']
        )
        print()
        
        results['embeddings'] = self.train_embedding_model()
        print()
        
        # Save training summary
        summary = {
            "trained_at": datetime.now().isoformat(),
            "models": results,
            "status": "success"
        }
        
        with open(self.models_dir / 'training_summary.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        print("="*60)
        print("✅ All Models Trained Successfully!")
        print("="*60)
        print(f"\n📁 Models saved in: {self.models_dir.absolute()}\n")
        
        return summary
    
    def _save_model(self, name: str, model: Any):
        """Save a model to disk."""
        path = self.models_dir / f"{name}.pkl"
        joblib.dump(model, path)
        print(f"   💾 Saved: {name}")
    
    def load_models(self):
        """Load trained models from disk."""
        try:
            self.doc_type_model = self._load_model('doc_type_model')
            self.doc_type_vectorizer = self._load_model('doc_type_vectorizer')
            self.doc_type_encoder = self._load_model('doc_type_encoder')
            
            self.clause_risk_model = self._load_model('clause_risk_model')
            self.clause_risk_vectorizer = self._load_model('clause_risk_vectorizer')
            
            self.clause_type_model = self._load_model('clause_type_model')
            self.clause_type_vectorizer = self._load_model('clause_type_vectorizer')
            self.clause_type_encoder = self._load_model('clause_type_encoder')
            
            # Load embedding model if info exists
            info_path = self.models_dir / 'embedding_model_info.json'
            if info_path.exists() and SENTENCE_TRANSFORMERS_AVAILABLE:
                with open(info_path, 'r') as f:
                    info = json.load(f)
                self.embedding_model = SentenceTransformer(info['model_name'])
            
            print("✅ Loaded existing ML models")
        except Exception as e:
            print(f"ℹ️  No existing models found: {e}")
    
    def _load_model(self, name: str) -> Any:
        """Load a model from disk."""
        path = self.models_dir / f"{name}.pkl"
        if path.exists():
            return joblib.load(path)
        return None
    
    def predict_document_type(self, text: str) -> Dict[str, Any]:
        """Predict document type for given text."""
        if not self.doc_type_model:
            return {"error": "Model not trained"}
        
        # Vectorize
        text_vec = self.doc_type_vectorizer.transform([text])
        
        # Predict
        prediction = self.doc_type_model.predict(text_vec)[0]
        probabilities = self.doc_type_model.predict_proba(text_vec)[0]
        
        # Decode
        doc_type = self.doc_type_encoder.inverse_transform([prediction])[0]
        
        # Get confidence
        confidence = float(max(probabilities))
        
        return {
            "document_type": doc_type,
            "confidence": confidence,
            "all_probabilities": {
                self.doc_type_encoder.inverse_transform([i])[0]: float(prob)
                for i, prob in enumerate(probabilities)
            }
        }
    
    def predict_clause_risk(self, clause_text: str) -> Dict[str, Any]:
        """Predict risk level for a clause."""
        if not self.clause_risk_model:
            return {"error": "Model not trained"}
        
        # Vectorize
        text_vec = self.clause_risk_vectorizer.transform([clause_text])
        
        # Predict
        prediction = self.clause_risk_model.predict(text_vec)[0]
        probabilities = self.clause_risk_model.predict_proba(text_vec)[0]
        
        # Get confidence
        confidence = float(max(probabilities))
        
        return {
            "risk_level": prediction,
            "confidence": confidence,
            "probabilities": {
                "high": float(probabilities[0]) if len(probabilities) > 0 else 0,
                "low": float(probabilities[1]) if len(probabilities) > 1 else 0,
                "medium": float(probabilities[2]) if len(probabilities) > 2 else 0
            }
        }
    
    def predict_clause_type(self, clause_text: str) -> Dict[str, Any]:
        """Predict clause type."""
        if not self.clause_type_model:
            return {"error": "Model not trained"}
        
        # Vectorize
        text_vec = self.clause_type_vectorizer.transform([clause_text])
        
        # Predict
        prediction = self.clause_type_model.predict(text_vec)[0]
        probabilities = self.clause_type_model.predict_proba(text_vec)[0]
        
        # Decode
        clause_type = self.clause_type_encoder.inverse_transform([prediction])[0]
        
        # Get confidence
        confidence = float(max(probabilities))
        
        return {
            "clause_type": clause_type,
            "confidence": confidence,
            "all_probabilities": {
                self.clause_type_encoder.inverse_transform([i])[0]: float(prob)
                for i, prob in enumerate(probabilities)
            }
        }
    
    def get_semantic_embedding(self, text: str) -> np.ndarray:
        """Get semantic embedding for text."""
        if not self.embedding_model:
            return None
        
        return self.embedding_model.encode(text)


# CLI for training
if __name__ == "__main__":
    print("\n🤖 Legal Document ML Trainer\n")
    
    trainer = LegalMLTrainer()
    
    # Train all models
    results = trainer.train_all_models()
    
    # Test predictions
    print("\n" + "="*60)
    print("🧪 Testing Predictions")
    print("="*60 + "\n")
    
    test_text = "This Employment Agreement is entered into between Company and Employee for software development services."
    
    print("Test Text:", test_text[:100] + "...\n")
    
    doc_type_pred = trainer.predict_document_type(test_text)
    print(f"📄 Document Type: {doc_type_pred['document_type']} (confidence: {doc_type_pred['confidence']:.2%})")
    
    test_clause = "Either party may terminate this agreement with 30 days written notice."
    clause_risk_pred = trainer.predict_clause_risk(test_clause)
    print(f"⚠️  Clause Risk: {clause_risk_pred['risk_level']} (confidence: {clause_risk_pred['confidence']:.2%})")
    
    clause_type_pred = trainer.predict_clause_type(test_clause)
    print(f"📋 Clause Type: {clause_type_pred['clause_type']} (confidence: {clause_type_pred['confidence']:.2%})")
    
    print("\n✅ Training Complete!\n")
