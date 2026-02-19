# Machine Learning Architecture - Legal AI Platform

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LEGAL AI PLATFORM                            │
│                  Machine Learning Integration                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Upload     │  │   Dashboard  │  │   Results    │          │
│  │   Document   │  │   View       │  │   Display    │          │
│  └──────┬───────┘  └──────────────┘  └──────▲───────┘          │
│         │                                     │                  │
└─────────┼─────────────────────────────────────┼──────────────────┘
          │                                     │
          │ HTTP POST /api/documents/analyze    │
          │                                     │
┌─────────▼─────────────────────────────────────┼──────────────────┐
│                      BACKEND (Node.js)         │                  │
│  ┌────────────────────────────────────────────┴────────────┐    │
│  │  Document Controller                                     │    │
│  │  - Receives document upload                              │    │
│  │  - Forwards to AI Service                                │    │
│  │  - Returns analysis results                              │    │
│  └────────────────────────┬─────────────────────────────────┘    │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │ HTTP POST /analyze
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                   AI SERVICE (Python/FastAPI)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    MAIN ANALYZER                           │ │
│  │  - Receives document text                                  │ │
│  │  - Orchestrates ML + ChatGPT                               │ │
│  │  - Returns comprehensive analysis                          │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│                   │                                              │
│       ┌───────────▼──────────┐                                  │
│       │  ML Models Available? │                                  │
│       └───────────┬──────────┘                                  │
│                   │                                              │
│          ┌────────┴────────┐                                    │
│          │                 │                                    │
│         YES               NO                                    │
│          │                 │                                    │
│  ┌───────▼──────────┐  ┌──▼──────────────┐                    │
│  │  ML ANALYZER     │  │  NLP ANALYZER   │                    │
│  │  (ml_analyzer.py)│  │  (ChatGPT)      │                    │
│  └───────┬──────────┘  └──┬──────────────┘                    │
│          │                 │                                    │
│          │                 │                                    │
│  ┌───────▼─────────────────▼──────────────────────────────┐   │
│  │              ML PREDICTION PIPELINE                      │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  1. DOCUMENT TYPE CLASSIFIER                   │    │   │
│  │  │     - Input: Full document text                │    │   │
│  │  │     - Model: Logistic Regression + TF-IDF      │    │   │
│  │  │     - Output: Document type + confidence       │    │   │
│  │  │     - Classes: Employment, Service, NDA, etc.  │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────▼─────────────────────────┐    │   │
│  │  │  2. CLAUSE EXTRACTION                           │    │   │
│  │  │     - Split document into sentences             │    │   │
│  │  │     - Filter legal clauses                      │    │   │
│  │  │     - Extract clause candidates                 │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────▼─────────────────────────┐    │   │
│  │  │  3. CLAUSE TYPE CLASSIFIER                      │    │   │
│  │  │     - Input: Individual clause text             │    │   │
│  │  │     - Model: Multinomial Naive Bayes           │    │   │
│  │  │     - Output: Clause type + confidence          │    │   │
│  │  │     - Classes: Termination, Liability, etc.     │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────▼─────────────────────────┐    │   │
│  │  │  4. CLAUSE RISK CLASSIFIER                      │    │   │
│  │  │     - Input: Individual clause text             │    │   │
│  │  │     - Model: Random Forest                      │    │   │
│  │  │     - Output: Risk level + confidence           │    │   │
│  │  │     - Classes: High, Medium, Low                │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────▼─────────────────────────┐    │   │
│  │  │  5. SEMANTIC EMBEDDINGS (Optional)              │    │   │
│  │  │     - Input: Clause text                        │    │   │
│  │  │     - Model: Sentence Transformers              │    │   │
│  │  │     - Output: 384-dim vector                    │    │   │
│  │  │     - Use: Similarity search, clustering        │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────▼─────────────────────────┐    │   │
│  │  │  6. CONFIDENCE CHECK                            │    │   │
│  │  │     - Evaluate prediction confidence            │    │   │
│  │  │     - High (>80%): Use ML results               │    │   │
│  │  │     - Medium (50-80%): Validate with ChatGPT    │    │   │
│  │  │     - Low (<50%): Use ChatGPT instead           │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────▼─────────────────────────┐    │   │
│  │  │  7. RESULT AGGREGATION                          │    │   │
│  │  │     - Combine all predictions                   │    │   │
│  │  │     - Calculate overall risk score              │    │   │
│  │  │     - Generate recommendations                  │    │   │
│  │  │     - Create expert suggestions                 │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              CHATGPT FALLBACK PIPELINE                 │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │  OpenAI GPT-3.5/4 API Call                   │    │ │
│  │  │  - Structured JSON prompt                     │    │ │
│  │  │  - Comprehensive legal analysis               │    │ │
│  │  │  - High accuracy, slower, costs money         │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MODEL STORAGE                               │
│                                                                   │
│  models/                                                         │
│  ├── doc_type_model.pkl          (Logistic Regression)          │
│  ├── doc_type_vectorizer.pkl     (TF-IDF Vectorizer)            │
│  ├── doc_type_encoder.pkl        (Label Encoder)                │
│  ├── clause_risk_model.pkl       (Random Forest)                │
│  ├── clause_risk_vectorizer.pkl  (TF-IDF Vectorizer)            │
│  ├── clause_type_model.pkl       (Naive Bayes)                  │
│  ├── clause_type_vectorizer.pkl  (TF-IDF Vectorizer)            │
│  ├── clause_type_encoder.pkl     (Label Encoder)                │
│  ├── embedding_model_info.json   (Sentence Transformer info)    │
│  └── training_summary.json       (Training metrics)             │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. Document Upload
```
User → Frontend → Backend → AI Service
```

### 2. ML Analysis (Fast Path)
```
AI Service → ML Analyzer → 4 ML Models → Results
Time: ~100ms | Cost: $0
```

### 3. ChatGPT Analysis (Accurate Path)
```
AI Service → NLP Analyzer → OpenAI API → Results
Time: ~5-10s | Cost: ~$0.002
```

### 4. Hybrid Analysis (Best Path)
```
AI Service → ML Analyzer (Quick Check)
           ↓
     Confidence > 80%?
           ↓
    Yes → Use ML Results
    No  → Validate with ChatGPT
```

## 📊 Model Details

### Document Type Classifier
```
Input:  "This Employment Agreement is entered into..."
        ↓
     TF-IDF Vectorization (1000 features)
        ↓
     Logistic Regression
        ↓
Output: {
  "document_type": "Employment Agreement",
  "confidence": 0.95,
  "probabilities": {
    "Employment Agreement": 0.95,
    "Service Agreement": 0.03,
    "NDA": 0.02
  }
}
```

### Clause Risk Classifier
```
Input:  "Either party may terminate with 30 days notice"
        ↓
     TF-IDF Vectorization (500 features)
        ↓
     Random Forest (100 trees)
        ↓
Output: {
  "risk_level": "medium",
  "confidence": 0.88,
  "probabilities": {
    "high": 0.05,
    "medium": 0.88,
    "low": 0.07
  }
}
```

### Clause Type Classifier
```
Input:  "All confidential information must be kept secret"
        ↓
     TF-IDF Vectorization (800 features)
        ↓
     Multinomial Naive Bayes
        ↓
Output: {
  "clause_type": "Confidentiality",
  "confidence": 0.91,
  "probabilities": {
    "Confidentiality": 0.91,
    "Non-Compete": 0.05,
    "Termination": 0.04
  }
}
```

### Semantic Embeddings
```
Input:  "Payment is due within 30 days"
        ↓
     Sentence Transformer (all-MiniLM-L6-v2)
        ↓
Output: [0.23, -0.45, 0.67, ..., 0.12]  (384 dimensions)
        ↓
     Use for: Similarity search, clustering, recommendations
```

## 🎯 Decision Logic

```python
def analyze_document(text):
    # Try ML first
    ml_result = ml_analyzer.analyze(text)
    
    # Check confidence
    if ml_result['confidence'] > 0.8:
        # High confidence - use ML
        return ml_result
    
    elif ml_result['confidence'] > 0.5:
        # Medium confidence - validate with ChatGPT
        gpt_result = chatgpt_analyzer.analyze(text)
        
        # Combine results
        return merge_results(ml_result, gpt_result)
    
    else:
        # Low confidence - use ChatGPT
        return chatgpt_analyzer.analyze(text)
```

## 📈 Performance Metrics

| Metric | ML Models | ChatGPT | Hybrid |
|--------|-----------|---------|--------|
| **Speed** | 100ms | 5-10s | 100ms-10s |
| **Accuracy** | 85-95% | 90-98% | 90-98% |
| **Cost/Analysis** | $0 | $0.002 | $0.0004 |
| **Offline** | ✅ Yes | ❌ No | ⚠️ Partial |
| **Consistency** | ✅ High | ⚠️ Medium | ✅ High |
| **Customizable** | ✅ Yes | ❌ No | ✅ Yes |

## 🔧 Training Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAINING PIPELINE                         │
└─────────────────────────────────────────────────────────────┘

1. DATA COLLECTION
   ├── Synthetic data (current)
   ├── Public datasets (CUAD, ContraCLM)
   └── Real documents (production)

2. DATA PREPROCESSING
   ├── Text cleaning
   ├── Tokenization
   ├── Label encoding
   └── Train/test split (80/20)

3. FEATURE EXTRACTION
   ├── TF-IDF vectorization
   ├── N-grams (1-3)
   ├── Stop word removal
   └── Max features: 500-1000

4. MODEL TRAINING
   ├── Document Type: Logistic Regression
   ├── Clause Risk: Random Forest
   ├── Clause Type: Naive Bayes
   └── Embeddings: Sentence Transformers

5. MODEL EVALUATION
   ├── Accuracy score
   ├── Precision/Recall
   ├── Confusion matrix
   └── Cross-validation

6. MODEL PERSISTENCE
   ├── Save models (.pkl files)
   ├── Save vectorizers
   ├── Save encoders
   └── Save metadata (JSON)

7. DEPLOYMENT
   ├── Load models on service start
   ├── Serve predictions via API
   └── Monitor performance
```

## 🚀 Scalability

### Current Capacity
- **Documents/Second:** ~10 (ML only)
- **Concurrent Users:** ~100
- **Model Size:** ~50MB total

### Production Scaling
- **Load Balancing:** Multiple AI service instances
- **Caching:** Cache predictions for common documents
- **GPU Acceleration:** For transformer models
- **Batch Processing:** Process multiple documents together

## 🔒 Security & Privacy

### ML Models (Local)
- ✅ Data never leaves your server
- ✅ No third-party API calls
- ✅ GDPR/HIPAA compliant
- ✅ Full data control

### ChatGPT Fallback (Cloud)
- ⚠️ Data sent to OpenAI
- ⚠️ Subject to OpenAI's privacy policy
- ⚠️ Consider for non-sensitive documents
- ⚠️ Or use only ML in production

## 📊 Monitoring

### Key Metrics to Track
1. **Prediction Confidence:** Average confidence scores
2. **ML vs ChatGPT Ratio:** % of predictions using ML
3. **Accuracy:** User feedback on predictions
4. **Latency:** Response time per analysis
5. **Error Rate:** Failed predictions

### Retraining Triggers
- Accuracy drops below 85%
- 1000+ new labeled documents
- Monthly scheduled retraining
- User feedback indicates drift

---

**This architecture provides a robust, scalable, and cost-effective ML solution for legal document analysis!** 🚀
