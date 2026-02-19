"""
Gemini-Powered PDF Analyzer
Uses Google's Gemini API for native PDF analysis
Based on LegalEase-AI approach
"""

import os
from typing import Dict, Any, Optional
from pathlib import Path

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed")
    print("Install with: pip install google-generativeai")


class GeminiPDFAnalyzer:
    """
    Analyzes PDF documents using Google's Gemini API.
    Supports native PDF processing without OCR.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini PDF Analyzer."""
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            print("⚠️  GEMINI_API_KEY not set")
            print("Get your API key from: https://ai.google.dev/")
            self.model = None
            return
        
        if not GEMINI_AVAILABLE:
            self.model = None
            return
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Use Gemini 1.5 Pro for PDF support
        self.model = genai.GenerativeModel('gemini-1.5-pro')
        
        print("✅ Gemini PDF Analyzer initialized")
    
    def analyze_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Analyze a PDF document using Gemini's native PDF processing.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Comprehensive legal document analysis
        """
        if not self.model:
            return {"error": "Gemini API not configured"}
        
        if not Path(pdf_path).exists():
            return {"error": f"PDF file not found: {pdf_path}"}
        
        print(f"📄 Analyzing PDF: {pdf_path}")
        
        try:
            # Upload PDF to Gemini
            print("   ⬆️  Uploading PDF to Gemini...")
            pdf_file = genai.upload_file(pdf_path)
            
            # Create comprehensive analysis prompt
            prompt = self._create_analysis_prompt()
            
            # Generate analysis
            print("   🤖 Generating analysis...")
            response = self.model.generate_content([pdf_file, prompt])
            
            # Parse response
            analysis = self._parse_gemini_response(response.text)
            
            # Clean up uploaded file
            pdf_file.delete()
            
            print("   ✅ Analysis complete!")
            
            return analysis
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return {"error": str(e)}
    
    def analyze_pdf_inline(self, pdf_bytes: bytes, filename: str = "document.pdf") -> Dict[str, Any]:
        """
        Analyze PDF from bytes (for smaller PDFs < 50MB).
        
        Args:
            pdf_bytes: PDF file bytes
            filename: Original filename
            
        Returns:
            Comprehensive legal document analysis
        """
        if not self.model:
            return {"error": "Gemini API not configured"}
        
        print(f"📄 Analyzing PDF: {filename}")
        
        try:
            # Create prompt
            prompt = self._create_analysis_prompt()
            
            # Prepare inline data
            pdf_part = {
                "mime_type": "application/pdf",
                "data": pdf_bytes
            }
            
            # Generate analysis
            print("   🤖 Generating analysis...")
            response = self.model.generate_content([pdf_part, prompt])
            
            # Parse response
            analysis = self._parse_gemini_response(response.text)
            
            print("   ✅ Analysis complete!")
            
            return analysis
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return {"error": str(e)}
    
    def _create_analysis_prompt(self) -> str:
        """Create comprehensive analysis prompt for legal documents."""
        return """
You are an expert legal document analyzer specializing in Indian law. Analyze this PDF document comprehensively and provide a detailed JSON response.

**IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no explanations outside the JSON.**

Analyze the document and return the following structure:

{
  "summary": "A comprehensive 2-3 sentence summary of the document",
  "documentType": "The type of legal document (e.g., Employment Agreement, Service Agreement, NDA, Lease Agreement, etc.)",
  "parties": [
    {
      "role": "Party role (e.g., Employer, Employee, Client, Service Provider)",
      "name": "Party name if mentioned"
    }
  ],
  "clauses": [
    {
      "type": "Clause type (e.g., Termination, Liability Limitation, Confidentiality, Payment Terms, Indemnification, Non-Compete, IP Rights, Governing Law, Dispute Resolution)",
      "content": "The actual clause text (first 200 characters)",
      "riskLevel": "high, medium, or low",
      "explanation": "Why this clause matters and what to watch out for"
    }
  ],
  "keyTerms": [
    {
      "term": "Important defined term",
      "definition": "What it means in the context"
    }
  ],
  "dates": {
    "effective": "Effective date if mentioned",
    "expiry": "Expiry date if mentioned",
    "important": ["Other important dates"]
  },
  "obligations": [
    {
      "party": "Which party has the obligation",
      "description": "What they must do",
      "deadline": "When it must be done"
    }
  ],
  "penalties": [
    {
      "condition": "What triggers the penalty",
      "consequence": "What happens",
      "severity": "high, medium, or low"
    }
  ],
  "overallRiskScore": 45,
  "recommendations": [
    "Specific actionable recommendations for the reader"
  ],
  "redFlags": [
    "Any concerning clauses or terms that need immediate attention"
  ],
  "expertSuggestions": {
    "negotiationPoints": ["Points that could be negotiated"],
    "draftingTips": ["Improvements for clarity or fairness"],
    "legalTraps": ["Common pitfalls in this type of document"]
  },
  "indianLawContext": {
    "applicableLaws": ["Relevant Indian laws that apply"],
    "compliance": ["Compliance requirements under Indian law"],
    "jurisdiction": "Governing jurisdiction if mentioned"
  }
}

**Focus on:**
1. Identifying ALL important clauses, especially risky ones
2. Explaining legal terms in simple language
3. Highlighting red flags and unfair terms
4. Providing actionable recommendations
5. Indian law context and compliance
6. Risk assessment for each clause

**Risk Level Guidelines:**
- HIGH: Unlimited liability, waiver of rights, one-sided terms, harsh penalties
- MEDIUM: Standard clauses that need review, time-bound obligations
- LOW: Routine administrative clauses, standard definitions

Return ONLY the JSON object, nothing else.
"""
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini's response into structured data."""
        import json
        import re
        
        try:
            # Remove markdown code blocks if present
            cleaned = response_text.strip()
            if cleaned.startswith('```'):
                # Extract JSON from code block
                match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', cleaned, re.DOTALL)
                if match:
                    cleaned = match.group(1)
                else:
                    # Remove first and last lines
                    lines = cleaned.split('\n')
                    cleaned = '\n'.join(lines[1:-1])
            
            # Parse JSON
            analysis = json.loads(cleaned)
            
            # Add metadata
            analysis['mlPowered'] = False
            analysis['geminiPowered'] = True
            analysis['analysisMethod'] = 'Gemini PDF Native Processing'
            
            return analysis
            
        except json.JSONDecodeError as e:
            print(f"⚠️  Failed to parse JSON: {e}")
            print(f"Response: {response_text[:500]}")
            
            # Return fallback structure
            return {
                "summary": response_text[:500] if len(response_text) > 500 else response_text,
                "documentType": "Legal Document",
                "geminiPowered": True,
                "error": "Failed to parse structured response",
                "rawResponse": response_text
            }
    
    def analyze_pdf_with_questions(self, pdf_path: str, questions: list) -> Dict[str, Any]:
        """
        Analyze PDF and answer specific questions.
        
        Args:
            pdf_path: Path to PDF file
            questions: List of questions to answer
            
        Returns:
            Answers to questions
        """
        if not self.model:
            return {"error": "Gemini API not configured"}
        
        try:
            # Upload PDF
            pdf_file = genai.upload_file(pdf_path)
            
            # Create Q&A prompt
            prompt = "Answer the following questions about this legal document:\n\n"
            for i, q in enumerate(questions, 1):
                prompt += f"{i}. {q}\n"
            prompt += "\nProvide clear, concise answers based on the document content."
            
            # Generate response
            response = self.model.generate_content([pdf_file, prompt])
            
            # Clean up
            pdf_file.delete()
            
            return {
                "questions": questions,
                "answers": response.text,
                "geminiPowered": True
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def extract_specific_clauses(self, pdf_path: str, clause_types: list) -> Dict[str, Any]:
        """
        Extract specific types of clauses from PDF.
        
        Args:
            pdf_path: Path to PDF file
            clause_types: List of clause types to extract
            
        Returns:
            Extracted clauses
        """
        if not self.model:
            return {"error": "Gemini API not configured"}
        
        try:
            # Upload PDF
            pdf_file = genai.upload_file(pdf_path)
            
            # Create extraction prompt
            clause_list = ", ".join(clause_types)
            prompt = f"""
Extract and analyze the following types of clauses from this document:
{clause_list}

For each clause found, provide:
1. The clause type
2. The full clause text
3. Risk level (high/medium/low)
4. Explanation of what it means

Return as JSON array.
"""
            
            # Generate response
            response = self.model.generate_content([pdf_file, prompt])
            
            # Clean up
            pdf_file.delete()
            
            return {
                "requestedClauses": clause_types,
                "extractedClauses": response.text,
                "geminiPowered": True
            }
            
        except Exception as e:
            return {"error": str(e)}


# Test the analyzer
if __name__ == "__main__":
    print("\n" + "="*60)
    print("  🤖 Gemini PDF Analyzer Test")
    print("="*60 + "\n")
    
    # Check if API key is set
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not set")
        print("\nTo use Gemini PDF Analyzer:")
        print("1. Get API key from: https://ai.google.dev/")
        print("2. Set environment variable: GEMINI_API_KEY=your_key")
        print("3. Or add to .env file")
        exit(1)
    
    # Initialize analyzer
    analyzer = GeminiPDFAnalyzer(api_key)
    
    # Test with a sample PDF (if available)
    test_pdf = "sample_contract.pdf"
    
    if Path(test_pdf).exists():
        print(f"Testing with: {test_pdf}\n")
        result = analyzer.analyze_pdf(test_pdf)
        
        print("\n📊 Analysis Result:")
        print(f"Document Type: {result.get('documentType', 'N/A')}")
        print(f"Risk Score: {result.get('overallRiskScore', 'N/A')}/100")
        print(f"Clauses Found: {len(result.get('clauses', []))}")
        print(f"\nSummary: {result.get('summary', 'N/A')}")
    else:
        print(f"⚠️  Test PDF not found: {test_pdf}")
        print("\nAnalyzer is ready to use!")
        print("Call analyzer.analyze_pdf(pdf_path) to analyze a PDF")
    
    print("\n" + "="*60)
