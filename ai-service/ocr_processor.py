"""
OCR Processor Module
Handles text extraction from images and PDFs using Tesseract OCR
"""

import os
from typing import Optional
import pytesseract
from PIL import Image
import cv2
import numpy as np

# Try to import PDF processing libraries
try:
    from pdf2image import convert_from_path
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    import PyPDF2
    PYPDF_SUPPORT = True
except ImportError:
    PYPDF_SUPPORT = False


class OCRProcessor:
    """Handles OCR processing for legal documents."""
    
    def __init__(self):
        """Initialize OCR processor with Tesseract configuration."""
        # Set Tesseract path if on Windows
        tesseract_path = os.getenv('TESSERACT_PATH')
        if tesseract_path and os.path.exists(tesseract_path):
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
        self._available = self._check_tesseract()
    
    def _check_tesseract(self) -> bool:
        """Check if Tesseract is available."""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False
    
    def is_available(self) -> bool:
        """Return whether OCR is available."""
        return self._available
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for better OCR accuracy.
        
        Steps:
        1. Convert to grayscale
        2. Apply adaptive thresholding
        3. Remove noise
        4. Deskew if needed
        """
        # Read image
        img = cv2.imread(image_path)
        
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11, 2
        )
        
        # Noise removal with morphological operations
        kernel = np.ones((1, 1), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel)
        
        return processed
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from an image file using Tesseract."""
        try:
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            
            # Convert numpy array to PIL Image
            pil_image = Image.fromarray(processed_img)
            
            # OCR configuration for legal documents
            custom_config = r'--oem 3 --psm 6 -l eng'
            
            # Extract text
            text = pytesseract.image_to_string(pil_image, config=custom_config)
            
            return text.strip()
            
        except Exception as e:
            print(f"OCR error: {str(e)}")
            # Try without preprocessing
            try:
                img = Image.open(image_path)
                text = pytesseract.image_to_string(img)
                return text.strip()
            except Exception:
                return ""
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        text = ""
        
        # Try PyPDF2 first (for text-based PDFs)
        if PYPDF_SUPPORT:
            try:
                with open(pdf_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                
                # If we got meaningful text, return it
                if len(text.strip()) > 100:
                    return text.strip()
            except Exception as e:
                print(f"PyPDF2 error: {str(e)}")
        
        # Fall back to OCR for scanned PDFs
        if PDF_SUPPORT:
            try:
                # Convert PDF pages to images
                images = convert_from_path(pdf_path, dpi=300)
                
                for i, image in enumerate(images):
                    # Save temporary image
                    temp_path = f"{pdf_path}_page_{i}.png"
                    image.save(temp_path, 'PNG')
                    
                    try:
                        # Extract text from image
                        page_text = self.extract_text_from_image(temp_path)
                        text += page_text + "\n\n"
                    finally:
                        # Clean up temp file
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                
                return text.strip()
                
            except Exception as e:
                print(f"PDF to image error: {str(e)}")
        
        return text.strip() if text else ""
    
    def extract_text(self, file_path: str, file_type: str) -> str:
        """
        Extract text from a file based on its type.
        
        Args:
            file_path: Path to the file
            file_type: Type of file ('pdf', 'image', etc.)
            
        Returns:
            Extracted text content
        """
        if not self._available:
            return ""
        
        if file_type == 'pdf':
            return self.extract_text_from_pdf(file_path)
        else:
            return self.extract_text_from_image(file_path)
