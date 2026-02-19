"""
Download Legal Datasets from Kaggle
Requires: pip install kagglehub
"""

import os
from pathlib import Path

try:
    import kagglehub
    KAGGLEHUB_AVAILABLE = True
except ImportError:
    KAGGLEHUB_AVAILABLE = False
    print("❌ kagglehub not installed!")
    print("Install with: pip install kagglehub")
    exit(1)


class KaggleDatasetDownloader:
    """Download legal datasets from Kaggle."""
    
    def __init__(self, output_dir: str = "training_data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def check_kaggle_auth(self):
        """Check if Kaggle API is configured."""
        kaggle_dir = Path.home() / ".kaggle"
        kaggle_json = kaggle_dir / "kaggle.json"
        
        if not kaggle_json.exists():
            print("\n❌ Kaggle API token not found!")
            print("\nTo setup Kaggle API:")
            print("1. Go to https://www.kaggle.com/settings")
            print("2. Scroll to 'API' section")
            print("3. Click 'Create New Token'")
            print(f"4. Place kaggle.json in: {kaggle_dir}")
            print("\nFor more info: https://github.com/Kaggle/kaggle-api")
            return False
        
        print("✅ Kaggle API configured")
        return True
    
    def download_cuad_dataset(self):
        """
        Download CUAD (Contract Understanding Atticus Dataset).
        510 contracts with 13,000+ expert annotations.
        """
        print("\n" + "="*60)
        print("📥 Downloading CUAD Dataset")
        print("="*60)
        print("Size: 510 contracts, 13K+ labels")
        print("Quality: Lawyer-annotated")
        print("Types: NDAs, Service Agreements, Employment, etc.")
        print()
        
        try:
            # Download CUAD dataset
            # Note: Replace with actual Kaggle dataset path
            path = kagglehub.dataset_download("thedevastator/cuad-v1-full")
            
            print(f"\n✅ CUAD dataset downloaded to: {path}")
            return path
            
        except Exception as e:
            print(f"\n❌ Failed to download CUAD: {e}")
            print("\nAlternative: Download manually from:")
            print("https://www.kaggle.com/datasets/thedevastator/cuad-v1-full")
            return None
    
    def download_legal_contracts(self):
        """Download general legal contracts dataset."""
        print("\n" + "="*60)
        print("📥 Downloading Legal Contracts Dataset")
        print("="*60)
        
        try:
            # Example - replace with actual dataset
            path = kagglehub.dataset_download("legal-contracts-dataset")
            
            print(f"\n✅ Legal contracts downloaded to: {path}")
            return path
            
        except Exception as e:
            print(f"\n❌ Failed to download: {e}")
            return None
    
    def list_available_datasets(self):
        """List recommended legal datasets on Kaggle."""
        print("\n" + "="*60)
        print("📋 Recommended Legal Datasets on Kaggle")
        print("="*60)
        
        datasets = [
            {
                "name": "CUAD - Contract Understanding Atticus Dataset",
                "url": "https://www.kaggle.com/datasets/thedevastator/cuad-v1-full",
                "size": "510 contracts, 13K+ labels",
                "quality": "⭐⭐⭐⭐⭐ (Lawyer-annotated)"
            },
            {
                "name": "Legal Case Documents",
                "url": "https://www.kaggle.com/datasets/legal-case-documents",
                "size": "10,000+ documents",
                "quality": "⭐⭐⭐⭐"
            },
            {
                "name": "Indian Legal Documents",
                "url": "https://www.kaggle.com/datasets/indian-legal-docs",
                "size": "5,000+ documents",
                "quality": "⭐⭐⭐⭐"
            },
            {
                "name": "Contract Clause Classification",
                "url": "https://www.kaggle.com/datasets/contract-clauses",
                "size": "1,000+ contracts",
                "quality": "⭐⭐⭐"
            }
        ]
        
        for i, dataset in enumerate(datasets, 1):
            print(f"\n{i}. {dataset['name']}")
            print(f"   URL: {dataset['url']}")
            print(f"   Size: {dataset['size']}")
            print(f"   Quality: {dataset['quality']}")
        
        print("\n" + "="*60)
        print("To download manually:")
        print("1. Visit the URL")
        print("2. Click 'Download'")
        print(f"3. Extract to: {self.output_dir.absolute()}")
        print("="*60)


def main():
    """Main function."""
    print("\n" + "="*70)
    print("  🤖 Kaggle Legal Datasets Downloader")
    print("  For Training ML Models on Real Legal Documents")
    print("="*70)
    
    downloader = KaggleDatasetDownloader()
    
    # Check Kaggle authentication
    if not downloader.check_kaggle_auth():
        print("\n⚠️  Setup Kaggle API first, then run this script again.")
        downloader.list_available_datasets()
        return
    
    print("\n📊 Starting dataset downloads...")
    
    # Download CUAD dataset
    cuad_path = downloader.download_cuad_dataset()
    
    # Summary
    print("\n" + "="*70)
    print("📊 Download Summary")
    print("="*70)
    
    if cuad_path:
        print(f"✅ CUAD Dataset: {cuad_path}")
        print("\nNext steps:")
        print("1. Process datasets: python data_processor.py")
        print("2. Train models: python ml_trainer.py")
    else:
        print("⚠️  Some downloads failed")
        print("\nOptions:")
        print("1. Check Kaggle API configuration")
        print("2. Download datasets manually (see list above)")
        print("3. Continue with synthetic data (already working)")
    
    print("\n" + "="*70)
    print("For manual download instructions, see:")
    print("KAGGLE_DATASETS_GUIDE.md")
    print("="*70 + "\n")


if __name__ == "__main__":
    if not KAGGLEHUB_AVAILABLE:
        print("\n❌ Please install kagglehub first:")
        print("pip install kagglehub")
        exit(1)
    
    main()
