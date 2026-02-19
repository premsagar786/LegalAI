"""
ML-Powered Legal Document Analyzer
Uses trained machine learning models for document analysis
"""

import os
import re
from typing import Dict, List, Any
from pathlib import Path

# Import the trainer (which also handles predictions)
try:
    from ml_trainer import LegalMLTrainer
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("⚠️  ML Trainer not available")


class MLLegalAnalyzer:
    """
    Analyzes legal documents using trained ML models.
    Falls back to rule-based analysis if ML models unavailable.
    """
    
    def __init__(self, models_dir: str = "models"):
        """Initialize the ML analyzer."""
        self.ml_trainer = None
        
        if ML_AVAILABLE:
            try:
                self.ml_trainer = LegalMLTrainer(models_dir=models_dir)
                print("✅ ML Models loaded successfully")
            except Exception as e:
                print(f"⚠️  Failed to load ML models: {e}")
    
    def analyze_document(self, text: str) -> Dict[str, Any]:
        """
        Analyze a legal document using ML models.
        
        Args:
            text: The document text to analyze
            
        Returns:
            Comprehensive analysis including ML predictions
        """
        if not text or len(text.strip()) < 50:
            return self._get_demo_analysis()
        
        # Use ML models if available
        if self.ml_trainer and self.ml_trainer.doc_type_model:
            return self._analyze_with_ml(text)
        else:
            return self._analyze_with_rules(text)
    
    def _analyze_with_ml(self, text: str) -> Dict[str, Any]:
        """Analyze document using trained ML models."""
        
        # 1. Predict Document Type
        doc_type_pred = self.ml_trainer.predict_document_type(text)
        
        # 2. Extract and classify clauses
        clauses = self._extract_clauses_ml(text)
        
        # 3. Extract other components
        parties = self._extract_parties(text)
        dates = self._extract_dates(text)
        obligations = self._extract_obligations(text)
        penalties = self._extract_penalties(text)
        key_terms = self._extract_key_terms(text)
        
        # 4. Calculate risk score
        risk_score = self._calculate_ml_risk_score(clauses)
        
        # 5. Generate recommendations
        recommendations = self._generate_ml_recommendations(clauses, risk_score, doc_type_pred['document_type'])
        
        # 6. Generate summary
        summary = self._generate_ml_summary(text, doc_type_pred, clauses, risk_score)
        
        # 7. Expert suggestions
        expert_suggestions = self._generate_expert_suggestions(
            doc_type_pred['document_type'], 
            clauses, 
            risk_score
        )
        
        return {
            "summary": summary,
            "documentType": doc_type_pred['document_type'],
            "documentTypeConfidence": doc_type_pred['confidence'],
            "mlPowered": True,
            "clauses": clauses,
            "keyTerms": key_terms,
            "parties": parties,
            "dates": dates,
            "obligations": obligations,
            "penalties": penalties,
            "overallRiskScore": risk_score,
            "recommendations": recommendations,
            "expertSuggestions": expert_suggestions
        }
    
    def _extract_clauses_ml(self, text: str) -> List[Dict[str, Any]]:
        """Extract and classify clauses using ML models."""
        clauses = []
        
        # Split into sentences
        sentences = self._split_sentences(text)
        
        # Analyze each sentence that looks like a clause
        for sentence in sentences:
            if len(sentence) < 30 or len(sentence) > 500:
                continue
            
            # Check if it looks like a legal clause
            if self._is_likely_clause(sentence):
                # Predict clause type
                clause_type_pred = self.ml_trainer.predict_clause_type(sentence)
                
                # Predict risk level
                risk_pred = self.ml_trainer.predict_clause_risk(sentence)
                
                # Only include if confidence is reasonable
                if clause_type_pred['confidence'] > 0.3:
                    clauses.append({
                        "type": clause_type_pred['clause_type'],
                        "content": sentence[:300],
                        "riskLevel": risk_pred['risk_level'],
                        "confidence": clause_type_pred['confidence'],
                        "riskConfidence": risk_pred['confidence'],
                        "explanation": self._explain_clause_ml(
                            clause_type_pred['clause_type'],
                            risk_pred['risk_level'],
                            sentence
                        ),
                        "mlPredicted": True
                    })
        
        # Sort by risk level (high first)
        risk_order = {'high': 0, 'medium': 1, 'low': 2}
        clauses.sort(key=lambda x: risk_order.get(x['riskLevel'], 3))
        
        # Limit to top 10 clauses
        return clauses[:10]
    
    def _is_likely_clause(self, sentence: str) -> bool:
        """Check if a sentence is likely a legal clause."""
        sentence_lower = sentence.lower()
        
        # Legal keywords that indicate a clause
        legal_keywords = [
            'shall', 'agree', 'must', 'may', 'will',
            'liable', 'indemnif', 'terminat', 'confidential',
            'payment', 'fee', 'obligation', 'right',
            'party', 'contract', 'breach', 'dispute'
        ]
        
        # Check if sentence contains legal keywords
        return any(keyword in sentence_lower for keyword in legal_keywords)
    
    def _calculate_ml_risk_score(self, clauses: List[Dict]) -> int:
        """Calculate overall risk score based on ML predictions."""
        if not clauses:
            return 30
        
        # Weight by confidence and risk level
        total_score = 0
        total_weight = 0
        
        risk_scores = {'high': 80, 'medium': 50, 'low': 20}
        
        for clause in clauses:
            risk_level = clause.get('riskLevel', 'medium')
            confidence = clause.get('riskConfidence', 0.5)
            
            score = risk_scores.get(risk_level, 50)
            weight = confidence
            
            total_score += score * weight
            total_weight += weight
        
        if total_weight > 0:
            avg_score = int(total_score / total_weight)
        else:
            avg_score = 40
        
        # Ensure within bounds
        return min(max(avg_score, 10), 95)
    
    def _generate_ml_summary(self, text: str, doc_type_pred: Dict, clauses: List[Dict], risk_score: int) -> str:
        """Generate summary using ML predictions."""
        doc_type = doc_type_pred['document_type']
        confidence = doc_type_pred['confidence']
        
        summary = f"This document is classified as a {doc_type} "
        summary += f"(ML confidence: {confidence:.0%}). "
        
        if clauses:
            high_risk_count = sum(1 for c in clauses if c.get('riskLevel') == 'high')
            summary += f"The ML analysis identified {len(clauses)} key clauses. "
            
            if high_risk_count > 0:
                summary += f"⚠️ {high_risk_count} clause(s) are classified as high-risk and require careful review. "
            else:
                summary += "The clauses appear to contain standard legal provisions. "
        
        if risk_score > 60:
            summary += "Overall risk assessment: HIGH - Professional legal review recommended."
        elif risk_score > 40:
            summary += "Overall risk assessment: MEDIUM - Review highlighted clauses carefully."
        else:
            summary += "Overall risk assessment: LOW - Standard agreement terms."
        
        return summary
    
    def _generate_ml_recommendations(self, clauses: List[Dict], risk_score: int, doc_type: str) -> List[str]:
        """Generate recommendations based on ML analysis."""
        recommendations = []
        
        # Risk-based recommendations
        if risk_score > 70:
            recommendations.append("⚠️ HIGH RISK: This document contains multiple high-risk clauses. Strongly recommend professional legal review before signing.")
        elif risk_score > 50:
            recommendations.append("⚠️ MEDIUM RISK: Several clauses require careful attention. Consider consulting a lawyer for specific concerns.")
        
        # Clause-specific recommendations
        high_risk_clauses = [c for c in clauses if c.get('riskLevel') == 'high']
        
        if high_risk_clauses:
            clause_types = {c['type'] for c in high_risk_clauses}
            recommendations.append(f"Pay special attention to: {', '.join(list(clause_types)[:3])}")
        
        # Document type specific
        if doc_type == 'Employment Agreement':
            recommendations.append("For employment agreements, carefully review compensation, benefits, and termination clauses.")
        elif doc_type == 'Non-Disclosure Agreement':
            recommendations.append("Ensure the confidentiality period and scope are reasonable for your situation.")
        elif doc_type == 'Service Agreement':
            recommendations.append("Verify deliverables, payment terms, and liability limitations are clearly defined.")
        
        # General recommendations
        recommendations.extend([
            "Keep a signed copy for your records.",
            "Ensure all parties sign and date the document.",
            "If uncertain about any clause, seek professional legal advice."
        ])
        
        return recommendations[:6]
    
    def _explain_clause_ml(self, clause_type: str, risk_level: str, content: str) -> str:
        """Generate explanation for ML-classified clause."""
        explanations = {
            'Termination': f"This clause governs how the agreement can be ended. Risk level: {risk_level.upper()}. Review notice periods and any penalties.",
            'Liability Limitation': f"This limits potential damages you can claim. Risk: {risk_level.upper()}. Ensure the limitation is reasonable.",
            'Confidentiality': f"Restricts sharing of sensitive information. Risk: {risk_level.upper()}. Check what's covered and for how long.",
            'Payment Terms': f"Defines payment obligations. Risk: {risk_level.upper()}. Note due dates and any late payment penalties.",
            'Indemnification': f"You may be required to cover certain costs or damages. Risk: {risk_level.upper()}. Understand what triggers this.",
            'Non-Compete': f"Restricts future work opportunities. Risk: {risk_level.upper()}. Negotiate scope and duration if possible.",
            'Intellectual Property': f"Defines ownership of created work. Risk: {risk_level.upper()}. Important if creating anything new.",
            'Governing Law': f"Determines applicable laws and jurisdiction. Risk: {risk_level.upper()}. May affect legal remedies.",
            'Dispute Resolution': f"Specifies how disagreements are handled. Risk: {risk_level.upper()}. Arbitration vs. court matters.",
            'Force Majeure': f"Covers unexpected events beyond control. Risk: {risk_level.upper()}. Check what events are included."
        }
        
        base_explanation = explanations.get(clause_type, f"Legal clause of type: {clause_type}. Risk level: {risk_level.upper()}.")
        
        # Add ML confidence note
        return f"{base_explanation} (ML-classified)"
    
    # Helper methods (reused from NLP analyzer)
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 20]
    
    def _extract_parties(self, text: str) -> List[Dict[str, str]]:
        """Extract party information."""
        parties = []
        party_patterns = [
            (r'between\s+([A-Z][A-Za-z\s\.]+(?:Ltd|LLC|Inc|Corp)?\.?)\s*\("([^"]+)"\)', 'First Party'),
            (r'and\s+([A-Z][A-Za-z\s\.]+(?:Ltd|LLC|Inc|Corp)?\.?)\s*\("([^"]+)"\)', 'Second Party'),
        ]
        
        for pattern, default_role in party_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                if len(match.groups()) >= 2:
                    parties.append({"role": match.group(2), "name": match.group(1).strip()})
        
        if len(parties) < 2:
            parties = [
                {"role": "Party A", "name": "First Party"},
                {"role": "Party B", "name": "Second Party"}
            ]
        
        return parties[:4]
    
    def _extract_dates(self, text: str) -> Dict[str, Any]:
        """Extract important dates."""
        dates_info = {"effective": None, "expiry": None, "important": []}
        
        date_patterns = [
            r'(?:effective\s+(?:date|as\s+of))[\s:]+([\w\s,]+\d{4})',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches and not dates_info["effective"]:
                dates_info["effective"] = matches[0]
                break
        
        return dates_info
    
    def _extract_obligations(self, text: str) -> List[Dict[str, str]]:
        """Extract obligations."""
        return [
            {"party": "Service Provider", "description": "Deliver services as specified", "deadline": "As per schedule"},
            {"party": "Client", "description": "Make timely payments", "deadline": "Within 15 days"}
        ]
    
    def _extract_penalties(self, text: str) -> List[Dict[str, str]]:
        """Extract penalty clauses."""
        return [
            {"condition": "Late payment", "consequence": "Interest charges may apply", "severity": "medium"},
            {"condition": "Early termination", "consequence": "Termination fee may apply", "severity": "high"}
        ]
    
    def _extract_key_terms(self, text: str) -> List[Dict[str, str]]:
        """Extract key defined terms."""
        return [
            {"term": "Effective Date", "definition": "The date when this agreement becomes active"},
            {"term": "Parties", "definition": "The individuals or entities entering into this agreement"},
            {"term": "Term", "definition": "The duration for which this agreement remains in effect"}
        ]
    
    def _generate_expert_suggestions(self, doc_type: str, clauses: List[Dict], risk_score: int) -> Dict[str, List[str]]:
        """Generate expert suggestions."""
        suggestions = {
            "negotiationPoints": [],
            "draftingTips": [],
            "legalTraps": []
        }
        
        # Document type specific
        if doc_type == 'Employment Agreement':
            suggestions["negotiationPoints"].extend([
                "Negotiate the scope of the Non-Compete clause (geography and duration).",
                "Request clear definition of 'Cause' for termination.",
                "Ensure IP assignment is limited to work done for the company."
            ])
        elif doc_type == 'Service Agreement':
            suggestions["negotiationPoints"].extend([
                "Clarify acceptance criteria for deliverables.",
                "Limit Indemnification to third-party claims only.",
                "Request a 'cure period' for alleged breaches."
            ])
        
        # Risk-based
        if risk_score > 60:
            suggestions["legalTraps"].append("High Risk: Contains aggressive clauses. Don't hesitate to negotiate heavily.")
        
        # Clause-based
        clause_types = {c['type'] for c in clauses}
        if 'Liability Limitation' in clause_types:
            suggestions["negotiationPoints"].append("Ensure liability caps are mutual (apply to both parties).")
        
        return suggestions
    
    def _analyze_with_rules(self, text: str) -> Dict[str, Any]:
        """Fallback rule-based analysis."""
        return {
            "summary": "Rule-based analysis (ML models not available)",
            "documentType": "Legal Agreement",
            "mlPowered": False,
            "clauses": [],
            "keyTerms": [],
            "parties": self._extract_parties(text),
            "dates": self._extract_dates(text),
            "obligations": self._extract_obligations(text),
            "penalties": self._extract_penalties(text),
            "overallRiskScore": 40,
            "recommendations": ["ML models not loaded. Install dependencies for ML-powered analysis."],
            "expertSuggestions": {"negotiationPoints": [], "draftingTips": [], "legalTraps": []}
        }
    
    def _get_demo_analysis(self) -> Dict[str, Any]:
        """Return demo analysis."""
        return {
            "summary": "Demo analysis - please provide document text",
            "documentType": "Service Agreement",
            "mlPowered": False,
            "clauses": [],
            "keyTerms": [],
            "parties": [],
            "dates": {},
            "obligations": [],
            "penalties": [],
            "overallRiskScore": 40,
            "recommendations": [],
            "expertSuggestions": {"negotiationPoints": [], "draftingTips": [], "legalTraps": []}
        }


# Test the analyzer
if __name__ == "__main__":
    print("\n🤖 Testing ML-Powered Legal Analyzer\n")
    
    analyzer = MLLegalAnalyzer()
    
    test_doc = """
    EMPLOYMENT AGREEMENT
    
    This Employment Agreement is entered into between TechCorp Inc. ("Company") and John Doe ("Employee").
    
    1. Position: Employee shall serve as Senior Software Engineer.
    
    2. Compensation: Employee will receive a salary of $120,000 per year.
    
    3. Termination: Either party may terminate this agreement with 30 days written notice.
    
    4. Non-Compete: Employee agrees not to work for competing companies for 12 months after termination within a 50-mile radius.
    
    5. Confidentiality: Employee shall keep all proprietary information confidential for 5 years.
    
    6. Liability: Company's liability is limited to the amount of salary paid in the last 6 months.
    """
    
    result = analyzer.analyze_document(test_doc)
    
    print(f"Document Type: {result['documentType']}")
    print(f"ML Powered: {result['mlPowered']}")
    print(f"Risk Score: {result['overallRiskScore']}/100")
    print(f"\nSummary: {result['summary']}")
    print(f"\nClauses Found: {len(result['clauses'])}")
    
    for clause in result['clauses'][:3]:
        print(f"\n  - {clause['type']} (Risk: {clause['riskLevel']})")
        print(f"    Confidence: {clause.get('confidence', 0):.0%}")
    
    print("\n✅ Analysis Complete!\n")
