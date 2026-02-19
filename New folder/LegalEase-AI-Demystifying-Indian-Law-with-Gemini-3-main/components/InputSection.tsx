
import React, { useRef, useState } from 'react';
import { AnalysisStatus } from '../types';
import { ArrowRightIcon, LoadingSpinner, UploadCloudIcon, XMarkIcon, FileTextIcon, CameraIcon } from './Icons';

interface FileData {
  name: string;
  mimeType: string;
  data: string; // base64
  size: number;
}

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedFile: FileData | null;
  setSelectedFile: (file: FileData | null) => void;
  onAnalyze: () => void;
  onFileSelect: (file: FileData) => void;
  status: AnalysisStatus;
  loadingMessage?: string;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  inputText, 
  setInputText, 
  selectedFile, 
  setSelectedFile, 
  onAnalyze,
  onFileSelect,
  status,
  loadingMessage
}) => {
  const isAnalyzing = status === AnalysisStatus.LOADING;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Basic validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or an Image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Extract base64 part (remove data:application/pdf;base64, prefix)
      const base64Data = result.split(',')[1];
      
      const fileData = {
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        size: file.size
      };

      // Trigger the parent's file selection logic immediately for auto-scan experience
      onFileSelect(fileData);
      
      // Clear value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasContent = inputText.length >= 10 || selectedFile !== null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg md:text-xl font-bold font-serif text-navy-900">Document Source</h2>
          <p className="hidden md:block text-sm text-slate-500 mt-1">Paste text, upload PDF, or scan image.</p>
        </div>
        {!selectedFile && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 text-sm font-semibold text-white transition-colors bg-gold-500 hover:bg-gold-600 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform active:scale-95 duration-200"
          >
            <UploadCloudIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Upload PDF / Scan</span>
            <span className="sm:hidden">Upload</span>
          </button>
        )}
      </div>
      
      <div className="flex-grow relative p-0 flex flex-col">
        {isAnalyzing && selectedFile ? (
          // Scanning State Overlay
          <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-8 animate-fade-in">
             <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <LoadingSpinner className="w-10 h-10 text-gold-500" />
             </div>
             <h3 className="text-xl font-bold text-navy-900 mb-2">Analyzing Document</h3>
             <p className="text-slate-500 text-center">{loadingMessage || "Extracting text and analyzing..."}</p>
             
             {/* Thumbnail Preview during scan */}
             <div className="mt-8 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 max-w-xs w-full opacity-75">
                <FileTextIcon className="w-8 h-8 text-slate-400" />
                <div className="truncate flex-1">
                   <p className="text-xs font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                   <p className="text-[10px] text-slate-400">Processing...</p>
                </div>
             </div>
          </div>
        ) : null}

        {selectedFile && !isAnalyzing ? (
          // File Selected View (Only if not analyzing and file exists - e.g. error state or pending manual submit if we change logic later)
          <div className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-50/50 animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">
              <button 
                onClick={clearFile}
                disabled={isAnalyzing}
                className="absolute -top-3 -right-3 bg-red-100 text-red-500 rounded-full p-1.5 hover:bg-red-200 transition-colors shadow-sm"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="bg-navy-50 p-3 rounded-lg">
                  <FileTextIcon className="w-10 h-10 text-navy-700" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-navy-900 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.mimeType.split('/')[1].toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-green-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Ready to analyze
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Click "Simplify" below to process this document.
            </p>
          </div>
        ) : (
          // Text Input View with Drop Zone
          <div 
            className={`relative flex-grow transition-colors duration-200 ${isDragOver ? 'bg-navy-50/50' : 'bg-white'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              className={`w-full h-full p-6 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-400/50 resize-none font-mono text-sm leading-relaxed legal-scroll bg-transparent z-10 relative ${isAnalyzing ? 'opacity-50' : ''}`}
              placeholder="Paste your legal text here, or click 'Upload PDF / Scan' above..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isAnalyzing}
            />
            
            {/* Empty State / Helper */}
            {inputText.length === 0 && !isDragOver && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <div className="text-center">
                  <span className="text-4xl block mb-2">📄</span>
                  <p className="text-sm font-medium text-slate-400">Paste text or drop PDF/Image here</p>
                </div>
              </div>
            )}

            {/* Drag Overlay */}
            {isDragOver && (
              <div className="absolute inset-0 z-20 border-2 border-dashed border-navy-300 bg-navy-50/80 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                <div className="text-center text-navy-700">
                  <UploadCloudIcon className="w-12 h-12 mx-auto mb-2 text-navy-500" />
                  <p className="font-semibold text-lg">Drop file to upload</p>
                </div>
              </div>
            )}
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          capture="environment"
          onChange={handleFileChange}
        />
      </div>

      <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {selectedFile ? 'Ready' : `${inputText.length} Characters`}
        </span>
        
        {/* Only show the simplify button if we are NOT in the middle of an auto-scan that hides this */}
        <button
          onClick={onAnalyze}
          disabled={(!hasContent && !selectedFile) || isAnalyzing}
          className={`
            group flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300
            ${(!hasContent && !selectedFile) || isAnalyzing 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/20 active:scale-95'}
          `}
        >
          {isAnalyzing ? (
            <>
              <LoadingSpinner className="w-5 h-5" />
              <span>{loadingMessage || "Analyzing..."}</span>
            </>
          ) : (
            <>
              <span>Simplify</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
