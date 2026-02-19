"""
NLP Analyzer Module
Performs legal document analysis using NLP techniques
"""

import re
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import random

# Try to import NLP libraries
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

try:
    import nltk
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.corpus import stopwords
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class NLPAnalyzer:
    """Analyzes legal documents using NLP techniques."""
    
    # Legal clause patterns (kept for fallback)
    CLAUSE_PATTERNS = {
        'Liability Limitation': [
            r'liability\s+shall\s+(not\s+)?be\s+limited',
            r'in\s+no\s+event\s+shall.*liable',
            r'limit(ed|ation)?\s+of\s+liability',
            r'shall\s+not\s+be\s+liable\s+for',
            r'maximum\s+liability'
        ],
        'Indemnification': [
            r'indemnif(y|ication)',
            r'hold\s+harmless',
            r'defend\s+and\s+indemnify'
        ],
        'Termination': [
            r'terminat(e|ion)',
            r'cancel(lation)?',
            r'may\s+terminate',
            r'termination\s+for\s+cause'
        ],
        'Confidentiality': [
            r'confidential(ity)?',
            r'non-disclosure',
            r'proprietary\s+information',
            r'trade\s+secret'
        ],
        'Non-Compete': [
            r'non-?compete',
            r'non-?competition',
            r'shall\s+not\s+compete',
            r'competing\s+business'
        ],
        'Intellectual Property': [
            r'intellectual\s+property',
            r'patent',
            r'trademark',
            r'copyright',
            r'ownership\s+of.*work'
        ],
        'Payment Terms': [
            r'payment',
            r'compensation',
            r'fee(s)?',
            r'invoice',
            r'due\s+within'
        ],
        'Governing Law': [
            r'governing\s+law',
            r'jurisdiction',
            r'governed\s+by',
            r'laws\s+of'
        ],
        'Dispute Resolution': [
            r'dispute\s+resolution',
            r'arbitration',
            r'mediation',
            r'litigation'
        ],
        'Force Majeure': [
            r'force\s+majeure',
            r'act\s+of\s+god',
            r'beyond.*control'
        ]
    }
    
    # Risk indicators (kept for fallback)
    HIGH_RISK_PATTERNS = [
        r'unlimited\s+liability',
        r'waive.*right',
        r'non-?compete.*\d+\s*(year|month)',
        r'automatic\s+renewal',
        r'sole\s+discretion',
        r'terminate\s+without\s+(cause|notice)',
        r'penalty',
        r'liquidated\s+damages'
    ]
    
    MEDIUM_RISK_PATTERNS = [
        r'liability.*limited\s+to',
        r'advance\s+notice',
        r'early\s+termination',
        r'material\s+breach',
        r'cure\s+period'
    ]
    
    def __init__(self):
        """Initialize NLP analyzer."""
        self._nlp = None
        self._available = False
        self.openai_client = None
        
        # Initialize OpenAI if key is present
        api_key = os.getenv("OPENAI_API_KEY")
        if OPENAI_AVAILABLE and api_key and not api_key.startswith("YOUR_"):
            try:
                self.openai_client = OpenAI(api_key=api_key)
                print("OpenAI Client Initialized")
            except Exception as e:
                print(f"Failed to initialize OpenAI: {e}")
        
        # Try to load spaCy model
        if SPACY_AVAILABLE:
            try:
                self._nlp = spacy.load("en_core_web_sm")
                self._available = True
            except Exception:
                try:
                    # Try downloading the model
                    import subprocess
                    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
                    self._nlp = spacy.load("en_core_web_sm")
                    self._available = True
                except Exception:
                    pass
        
        # Download NLTK data if available
        if NLTK_AVAILABLE:
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                try:
                    nltk.download('punkt', quiet=True)
                    nltk.download('stopwords', quiet=True)
                except Exception:
                    pass
    
    def is_available(self) -> bool:
        """Return whether NLP is available."""
        return self._available or True  # Always return True, we have fallback
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze legal document text.
        
        Args:
            text: The document text to analyze
            
        Returns:
            Analysis results including clauses, risks, and recommendations
        """
        if not text or len(text.strip()) < 50:
            return self.get_demo_analysis()
            
        # Try OpenAI Analysis first
        if self.openai_client:
            try:
                print("Attempting OpenAI analysis...")
                return self._analyze_with_gpt(text)
            except Exception as e:
                print(f"OpenAI analysis failed, falling back to local NLP: {e}")
        
        # Fallback to local NLP
        return self._analyze_local(text)

    def _analyze_with_gpt(self, text: str) -> Dict[str, Any]:
        """Analyze document using OpenAI GPT."""
        
        prompt = f"""
        You are an expert legal AI assistant. Analyze the following legal document text and provide a structured JSON response.
        
        Text to analyze:
        {text[:15000]}  # Limit text length to avoid token limits
        
        Return a JSON object with this EXACT structure:
        {{
            "summary": "Brief summary of the document",
            "documentType": "Type of document (e.g. Service Agreement, NDA)",
            "clauses": [
                {{
                    "type": "Clause Type (e.g. Termination, Liability)",
                    "content": "Exact text of the clause from document",
                    "riskLevel": "high/medium/low",
                    "explanation": "Why this is risky or what it means"
                }}
            ],
            "keyTerms": [
                {{ "term": "Term Name", "definition": "Definition found in text" }}
            ],
            "parties": [
                {{ "role": "Party Role (e.g. Client)", "name": "Party Name" }}
            ],
            "dates": {{
                "effective": "Date string or null",
                "expiry": "Date string or null",
                "important": [ {{ "description": "desc", "date": "date" }} ]
            }},
            "obligations": [
                {{ "party": "Role", "description": "Obligation description", "deadline": "Deadline or null" }}
            ],
            "penalties": [
                {{ "condition": "Condition triggering penalty", "consequence": "Consequence", "severity": "high/medium/low" }}
            ],
            "overallRiskScore": 50,  # 0-100 integer
            "recommendations": ["List of string recommendations"],
            "expertSuggestions": {{
                "negotiationPoints": ["Point 1", "Point 2"],
                "draftingTips": ["Tip 1", "Tip 2"],
                "legalTraps": ["Trap 1", "Trap 2"]
            }}
        }}
        
        IMPORTANT: Ensure valid JSON output. Do not include markdown formatting (like ```json).
        """
        
        response = self.openai_client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content": "You are a legal expert AI. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)

    def _analyze_local(self, text: str) -> Dict[str, Any]:
        """Local regex-based analysis (fallback)."""
        # Normalize text
        text = self._normalize_text(text)
        
        # Extract various components
        clauses = self._extract_clauses(text)
        parties = self._extract_parties(text)
        dates = self._extract_dates(text)
        obligations = self._extract_obligations(text)
        penalties = self._extract_penalties(text)
        key_terms = self._extract_key_terms(text)
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(text, clauses)
        
        # Generate summary and recommendations
        summary = self._generate_summary(text, clauses)
        doc_type = self._identify_document_type(text)
        recommendations = self._generate_recommendations(clauses, risk_score)
        
        # Generate expert suggestions
        expert_suggestions = self._generate_expert_suggestions(doc_type, clauses, risk_score)
        
        return {
            "summary": summary,
            "documentType": doc_type,
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
        
    def _generate_expert_suggestions(self, doc_type: str, clauses: List[Dict], risk_score: int) -> Dict[str, List[str]]:
        """Generate expert legal suggestions based on document context."""
        suggestions = {
            "negotiationPoints": [],
            "draftingTips": [],
            "legalTraps": []
        }
        
        # 1. Document Type Advice
        if doc_type == 'Employment Agreement':
            suggestions["negotiationPoints"].extend([
                "Request a clear definition of 'Cause' for termination to protect your severance.",
                "Negotiate the scope of the Non-Compete clause (geography and duration).",
                "Ensure IP assignment is limited to work done specifically for the company."
            ])
            suggestions["legalTraps"].append("Watch out for broad 'Moral Rights' waivers that are irrevocable.")
            
        elif doc_type == 'Service Agreement':
            suggestions["negotiationPoints"].extend([
                "Clarify the acceptance criteria for deliverables to avoid payment disputes.",
                "Limit the 'Indemnification' clause to third-party claims only.",
                "Request a 'cure period' for any alleged breach before termination."
            ])
            suggestions["draftingTips"].append("Clearly state that you are an Independent Contractor, not an employee.")

        elif doc_type == 'Non-Disclosure Agreement':
            suggestions["negotiationPoints"].append("Ensure the definition of 'Confidential Information' is not overly broad.")
            suggestions["draftingTips"].append("Add a 'residuals' clause allowing use of general knowledge/skills.")
            suggestions["legalTraps"].append("Check if the NDA has no expiration date (perpetual confidentiality).")

        # 2. Clause-Specific Advice
        clause_types = {c['type'] for c in clauses}
        
        if 'Liability Limitation' in clause_types:
            suggestions["negotiationPoints"].append("Ensure liability caps are mutual (apply to both parties).")
        else:
            suggestions["draftingTips"].append("Consider adding a Liability Limitation clause to protect yourself from excessive damages.")

        if 'Dispute Resolution' not in clause_types:
            suggestions["draftingTips"].append("Add a Dispute Resolution clause to specify Arbitration vs. Litigation in advance.")

        if 'Force Majeure' not in clause_types:
            suggestions["legalTraps"].append("Missing Force Majeure clause: You might be liable even during a natural disaster.")

        # 3. Risk-Based Advice
        if risk_score > 60:
            suggestions["legalTraps"].append("High Risk Document: Contains multiple aggressive clauses favored by the counterparty.")
            suggestions["negotiationPoints"].append("This looks like a standard 'pro-party' template. Don't be afraid to redline heavily.")

        # Fallbacks if empty
        if not suggestions["negotiationPoints"]:
            suggestions["negotiationPoints"].append("Ask for clear payment terms (Net 15 vs Net 30).")
        
        return suggestions
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for analysis."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Normalize quotes
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace(''', "'").replace(''', "'")
        return text.strip()
    
    def _extract_clauses(self, text: str) -> List[Dict[str, str]]:
        """Extract and classify clauses from the document."""
        clauses = []
        text_lower = text.lower()
        
        # Split into sentences for analysis
        sentences = self._split_sentences(text)
        
        for clause_type, patterns in self.CLAUSE_PATTERNS.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text_lower)
                for match in matches:
                    # Find the sentence containing this match
                    start_pos = match.start()
                    containing_sentence = self._find_containing_sentence(text, start_pos, sentences)
                    
                    if containing_sentence:
                        # Determine risk level
                        risk_level = self._assess_clause_risk(containing_sentence, clause_type)
                        
                        # Generate explanation
                        explanation = self._explain_clause(clause_type, containing_sentence, risk_level)
                        
                        # Avoid duplicates
                        if not any(c['content'][:50] == containing_sentence[:50] for c in clauses):
                            clauses.append({
                                "type": clause_type,
                                "content": containing_sentence[:300],
                                "riskLevel": risk_level,
                                "explanation": explanation
                            })
                            break
        
        # Ensure we have at least some clauses for demo
        if len(clauses) < 3:
            clauses.extend(self._get_demo_clauses()[:3 - len(clauses)])
        
        return clauses[:10]  # Limit to 10 clauses
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        if NLTK_AVAILABLE:
            try:
                return sent_tokenize(text)
            except Exception:
                pass
        
        # Fallback: simple sentence splitting
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _find_containing_sentence(self, text: str, position: int, sentences: List[str]) -> Optional[str]:
        """Find the sentence containing a given position."""
        current_pos = 0
        for sentence in sentences:
            end_pos = current_pos + len(sentence)
            if current_pos <= position <= end_pos:
                return sentence
            current_pos = end_pos + 1
        return sentences[0] if sentences else None
    
    def _assess_clause_risk(self, content: str, clause_type: str) -> str:
        """Assess the risk level of a clause."""
        content_lower = content.lower()
        
        # Check for high risk patterns
        for pattern in self.HIGH_RISK_PATTERNS:
            if re.search(pattern, content_lower):
                return "high"
        
        # Check for medium risk patterns
        for pattern in self.MEDIUM_RISK_PATTERNS:
            if re.search(pattern, content_lower):
                return "medium"
        
        # Clause type based risk
        high_risk_types = ['Non-Compete', 'Liability Limitation', 'Indemnification']
        if clause_type in high_risk_types:
            return "medium"
        
        return "low"
    
    def _explain_clause(self, clause_type: str, content: str, risk_level: str) -> str:
        """Generate an explanation for a clause."""
        explanations = {
            'Liability Limitation': "This clause limits what you can claim if something goes wrong. " +
                ("Review carefully as it may significantly restrict your rights." if risk_level != "low" else 
                 "Standard limitation clause."),
            'Indemnification': "You may be required to cover costs or damages. " +
                "Understand what situations trigger this obligation.",
            'Termination': "Defines how and when the agreement can be ended. " +
                "Check notice periods and any penalties for early termination.",
            'Confidentiality': "Restricts sharing of sensitive information. " +
                "Ensure you understand what information is covered.",
            'Non-Compete': "Restricts your ability to work with competitors or start similar businesses. " +
                ("This is a significant restriction - negotiate if possible." if risk_level == "high" else
                 "Review the scope and duration carefully."),
            'Intellectual Property': "Defines ownership of created work and ideas. " +
                "Important if you're creating anything during the agreement.",
            'Payment Terms': "Specifies when and how payments are made. " +
                "Note any penalties for late payments.",
            'Governing Law': "Determines which laws apply and where disputes are resolved. " +
                "May affect your ability to seek legal remedies.",
            'Dispute Resolution': "Specifies how disagreements will be handled. " +
                "Arbitration may limit your options compared to court.",
            'Force Majeure': "Covers unexpected events beyond control. " +
                "Check what events are included and the consequences."
        }
        
        return explanations.get(clause_type, "Review this clause carefully before signing.")
    
    def _extract_parties(self, text: str) -> List[Dict[str, str]]:
        """Extract party information from the document."""
        parties = []
        
        # Common party patterns
        party_patterns = [
            (r'between\s+([A-Z][A-Za-z\s\.]+(?:Ltd|LLC|Inc|Corp|Pvt|Private|Limited)?\.?)\s*\("([^"]+)"\)', 'First Party'),
            (r'and\s+([A-Z][A-Za-z\s\.]+(?:Ltd|LLC|Inc|Corp|Pvt|Private|Limited)?\.?)\s*\("([^"]+)"\)', 'Second Party'),
            (r'"(Provider|Service Provider|Consultant|Contractor)"\s*(?:shall mean|refers to)', 'Service Provider'),
            (r'"(Client|Customer|Company|Employer)"\s*(?:shall mean|refers to)', 'Client')
        ]
        
        for pattern, default_role in party_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                if len(match.groups()) >= 2:
                    parties.append({
                        "role": match.group(2),
                        "name": match.group(1).strip()
                    })
                elif len(match.groups()) >= 1:
                    parties.append({
                        "role": default_role,
                        "name": match.group(1).strip()
                    })
        
        # Ensure at least 2 parties
        if len(parties) < 2:
            parties = [
                {"role": "Party A", "name": "First Party"},
                {"role": "Party B", "name": "Second Party"}
            ]
        
        return parties[:4]
    
    def _extract_dates(self, text: str) -> Dict[str, Any]:
        """Extract important dates from the document."""
        dates_info = {
            "effective": None,
            "expiry": None,
            "important": []
        }
        
        # Date patterns
        date_patterns = [
            r'(?:effective\s+(?:date|as\s+of))[:\s]+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})',
            r'(?:commenc\w+\s+on)[:\s]+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})',
            r'(?:dated?|as\s+of)[:\s]+(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\w+\s+\d{1,2},?\s+\d{4})'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if not dates_info["effective"]:
                    dates_info["effective"] = match
                    break
        
        # Look for term/duration
        term_pattern = r'(?:term|period)\s+of\s+(\d+)\s*(month|year|day)s?'
        term_match = re.search(term_pattern, text, re.IGNORECASE)
        if term_match:
            dates_info["important"].append({
                "description": f"Agreement term: {term_match.group(1)} {term_match.group(2)}s",
                "date": None
            })
        
        return dates_info
    
    def _extract_obligations(self, text: str) -> List[Dict[str, str]]:
        """Extract obligations from the document."""
        obligations = []
        
        obligation_patterns = [
            (r'(provider|service provider|consultant)\s+(?:shall|agrees?\s+to|will)\s+([^.]+\.)', 'Service Provider'),
            (r'(client|customer|company)\s+(?:shall|agrees?\s+to|will)\s+([^.]+\.)', 'Client'),
            (r'(?:party\s+a)\s+(?:shall|agrees?\s+to|will)\s+([^.]+\.)', 'Party A'),
            (r'(?:party\s+b)\s+(?:shall|agrees?\s+to|will)\s+([^.]+\.)', 'Party B')
        ]
        
        for pattern, party in obligation_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                obligation_text = match.group(2) if len(match.groups()) > 1 else match.group(1)
                if len(obligation_text) > 20 and len(obligation_text) < 200:
                    obligations.append({
                        "party": party,
                        "description": obligation_text.strip()[:150],
                        "deadline": None
                    })
        
        # Fallback demo obligations
        if len(obligations) < 2:
            obligations = [
                {"party": "Service Provider", "description": "Deliver services as specified in the agreement", "deadline": "As per schedule"},
                {"party": "Client", "description": "Make timely payments as per the payment terms", "deadline": "Within 15 days of invoice"}
            ]
        
        return obligations[:5]
    
    def _extract_penalties(self, text: str) -> List[Dict[str, str]]:
        """Extract penalty clauses from the document."""
        penalties = []
        
        penalty_patterns = [
            r'(late\s+payment)[^.]*(\d+%[^.]*interest[^.]*\.)',
            r'(early\s+termination)[^.]*(?:require|result\s+in)[^.]*(\d+[^.]*(?:month|fee|penalty)[^.]*\.)',
            r'(breach)[^.]*(?:result\s+in|liable\s+for)[^.]*([^.]+\.)',
            r'(failure\s+to)[^.]*(?:result\s+in|subject\s+to)[^.]*([^.]+\.)'
        ]
        
        for pattern in penalty_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                condition = match.group(1).strip()
                consequence = match.group(2).strip() if len(match.groups()) > 1 else "Penalty applies"
                
                # Determine severity
                severity = "medium"
                if any(word in consequence.lower() for word in ['terminate', 'immediate', 'all fees']):
                    severity = "high"
                elif any(word in consequence.lower() for word in ['interest', 'late fee']):
                    severity = "low"
                
                penalties.append({
                    "condition": condition.capitalize(),
                    "consequence": consequence[:150],
                    "severity": severity
                })
        
        # Fallback demo penalties
        if len(penalties) < 1:
            penalties = [
                {"condition": "Late payment", "consequence": "Interest of 1.5% per month", "severity": "medium"},
                {"condition": "Early termination", "consequence": "Termination fee may apply", "severity": "high"}
            ]
        
        return penalties[:5]
    
    def _extract_key_terms(self, text: str) -> List[Dict[str, str]]:
        """Extract key defined terms from the document."""
        key_terms = []
        
        # Pattern for defined terms: "Term" means/shall mean
        term_pattern = r'"([A-Z][A-Za-z\s]+)"\s+(?:means|shall mean|refers to)\s+([^.]+\.)'
        
        matches = re.finditer(term_pattern, text)
        for match in matches:
            key_terms.append({
                "term": match.group(1).strip(),
                "definition": match.group(2).strip()[:200]
            })
        
        # Common legal terms
        common_terms = [
            {"term": "Effective Date", "definition": "The date when this agreement becomes active and binding"},
            {"term": "Parties", "definition": "The individuals or entities entering into this agreement"},
            {"term": "Term", "definition": "The duration for which this agreement remains in effect"}
        ]
        
        if len(key_terms) < 3:
            key_terms.extend(common_terms[:3 - len(key_terms)])
        
        return key_terms[:8]
    
    def _calculate_risk_score(self, text: str, clauses: List[Dict]) -> int:
        """Calculate overall risk score (0-100)."""
        score = 30  # Base score
        
        text_lower = text.lower()
        
        # Add points for high-risk patterns
        for pattern in self.HIGH_RISK_PATTERNS:
            if re.search(pattern, text_lower):
                score += 10
        
        # Add points for medium-risk patterns
        for pattern in self.MEDIUM_RISK_PATTERNS:
            if re.search(pattern, text_lower):
                score += 5
        
        # Add points based on clause risks
        for clause in clauses:
            if clause.get('riskLevel') == 'high':
                score += 8
            elif clause.get('riskLevel') == 'medium':
                score += 4
        
        # Ensure score is within bounds
        return min(max(score, 10), 95)
    
    def _identify_document_type(self, text: str) -> str:
        """Identify the type of legal document."""
        text_lower = text.lower()
        
        doc_types = {
            'Employment Agreement': ['employment', 'employee', 'employer', 'salary', 'working hours'],
            'Service Agreement': ['service', 'services', 'provider', 'consultant'],
            'Non-Disclosure Agreement': ['confidential', 'non-disclosure', 'nda', 'proprietary'],
            'Lease Agreement': ['lease', 'tenant', 'landlord', 'rent', 'premises'],
            'Sales Agreement': ['sale', 'purchase', 'buyer', 'seller', 'goods'],
            'Partnership Agreement': ['partnership', 'partners', 'profit sharing'],
            'Licensing Agreement': ['license', 'licensing', 'royalty', 'intellectual property']
        }
        
        for doc_type, keywords in doc_types.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches >= 2:
                return doc_type
        
        return "Legal Agreement"
    
    def _generate_summary(self, text: str, clauses: List[Dict]) -> str:
        """Generate a summary of the document."""
        doc_type = self._identify_document_type(text)
        clause_types = [c['type'] for c in clauses[:5]]
        
        high_risk_count = sum(1 for c in clauses if c.get('riskLevel') == 'high')
        
        summary = f"This appears to be a {doc_type}. "
        summary += f"The document contains {len(clauses)} identifiable clauses including: {', '.join(clause_types[:3])}. "
        
        if high_risk_count > 0:
            summary += f"⚠️ There are {high_risk_count} clauses that require careful review before signing."
        else:
            summary += "The document appears to contain standard legal provisions."
        
        return summary
    
    def _generate_recommendations(self, clauses: List[Dict], risk_score: int) -> List[str]:
        """Generate recommendations based on analysis."""
        recommendations = []
        
        # Based on risk score
        if risk_score > 70:
            recommendations.append("⚠️ This document has significant risk factors. Consider consulting a lawyer before signing.")
        elif risk_score > 50:
            recommendations.append("Review the highlighted clauses carefully before proceeding.")
        
        # Based on specific clauses
        for clause in clauses:
            if clause['type'] == 'Non-Compete' and clause['riskLevel'] in ['high', 'medium']:
                recommendations.append("The non-compete clause may restrict your future opportunities. Consider negotiating the scope and duration.")
            elif clause['type'] == 'Liability Limitation' and clause['riskLevel'] == 'high':
                recommendations.append("The liability limitation is heavily in favor of the other party. Consider requesting more balanced terms.")
            elif clause['type'] == 'Termination' and clause['riskLevel'] == 'high':
                recommendations.append("Review termination conditions carefully, especially any penalties or notice requirements.")
        
        # General recommendations
        if len(recommendations) < 3:
            recommendations.extend([
                "Keep a signed copy of the agreement for your records.",
                "Ensure all blank spaces are filled before signing.",
                "If unsure about any clause, seek legal advice."
            ])
        
        return recommendations[:5]
    
    def _get_demo_clauses(self) -> List[Dict[str, str]]:
        """Return demo clauses for fallback."""
        return [
            {
                "type": "Liability Limitation",
                "content": "The service provider shall not be liable for indirect, incidental, or consequential damages.",
                "riskLevel": "medium",
                "explanation": "This clause limits what you can claim if something goes wrong."
            },
            {
                "type": "Termination",
                "content": "Either party may terminate this agreement with 30 days written notice.",
                "riskLevel": "low",
                "explanation": "Standard termination clause with reasonable notice period."
            },
            {
                "type": "Confidentiality",
                "content": "Both parties agree to maintain confidentiality of all proprietary information.",
                "riskLevel": "low",
                "explanation": "Standard confidentiality clause to protect sensitive information."
            }
        ]
    
    def get_demo_analysis(self) -> Dict[str, Any]:
        """Return demo analysis for testing/fallback."""
        return {
            "summary": "This appears to be a Service Agreement. The document contains standard legal provisions with a few clauses that require review.",
            "documentType": "Service Agreement",
            "clauses": self._get_demo_clauses(),
            "keyTerms": [
                {"term": "Effective Date", "definition": "The date when this agreement becomes active"},
                {"term": "Parties", "definition": "The individuals or entities entering into this agreement"},
                {"term": "Services", "definition": "The work to be performed under this agreement"}
            ],
            "parties": [
                {"role": "Service Provider", "name": "Party A"},
                {"role": "Client", "name": "Party B"}
            ],
            "dates": {
                "effective": datetime.now().strftime("%B %d, %Y"),
                "expiry": None,
                "important": [{"description": "Agreement term: 12 months", "date": None}]
            },
            "obligations": [
                {"party": "Service Provider", "description": "Deliver services as specified", "deadline": "30 days"},
                {"party": "Client", "description": "Make payment upon completion", "deadline": "15 days after delivery"}
            ],
            "penalties": [
                {"condition": "Late payment", "consequence": "Interest of 1.5% per month", "severity": "medium"},
                {"condition": "Early termination", "consequence": "Penalty of 2 months fees", "severity": "high"}
            ],
            "overallRiskScore": 45,
            "recommendations": [
                "Review the non-compete clause carefully before signing",
                "Consider negotiating the liability limitation",
                "Ensure all deliverables are clearly defined"
            ]
        }
