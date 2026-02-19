
import React, { useState, useRef, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultSection from './components/ResultSection';
import ChatWidget from './components/ChatWidget';
import { simplifyLegalContent } from './services/geminiService';
import { SimplifyResult, AnalysisStatus, HistoryItem } from './types';
import { 
  ScaleIcon, LayoutGridIcon, ClockIcon, SettingsIcon, 
  PlusCircleIcon, UserCircleIcon, LogOutIcon, ArrowRightIcon 
} from './components/Icons';

interface FileData {
  name: string;
  mimeType: string;
  data: string;
  size: number;
}

type View = 'dashboard' | 'history' | 'settings';

const App: React.FC = () => {
  // Core Analysis State
  const [inputText, setInputText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [loadingMessage, setLoadingMessage] = useState<string>('Analyzing Legal Jargon...');
  
  // RAG Context State (Stable content used for the last successful analysis)
  const [analyzedContent, setAnalyzedContent] = useState<string>('');
  
  // Dashboard State
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const addToHistory = (res: SimplifyResult, textContext: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      preview: res.summary.substring(0, 80) + '...',
      result: res,
      originalText: textContext
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedFile) return;

    setStatus(AnalysisStatus.LOADING);
    setLoadingMessage('Analyzing Legal Jargon...');
    setResult(null);

    // Capture text at the moment of analysis for RAG stability
    const currentInputText = inputText;

    try {
      const data = await simplifyLegalContent({
        text: selectedFile ? undefined : currentInputText,
        file: selectedFile ? { mimeType: selectedFile.mimeType, data: selectedFile.data } : undefined
      });
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
      
      // Update RAG Context
      const content = data.extractedText || currentInputText;
      setAnalyzedContent(content);

      addToHistory(data, content);
      scrollToResults();
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleFileSelect = async (fileData: FileData) => {
    setSelectedFile(fileData);
    setStatus(AnalysisStatus.LOADING);
    setLoadingMessage('Scanning Document & Extracting Text...');
    setResult(null);
    scrollToResults();

    try {
      const data = await simplifyLegalContent({
        file: { mimeType: fileData.mimeType, data: fileData.data }
      });
      
      setResult(data);
      
      // Update Inputs and RAG Context
      if (data.extractedText) {
        setInputText(data.extractedText);
        setAnalyzedContent(data.extractedText);
        setSelectedFile(null); // Clear file selection so user sees extracted text
        addToHistory(data, data.extractedText);
      } else {
        // Fallback if no text extracted (unlikely with prompts)
        addToHistory(data, ''); 
      }

      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const startNewAnalysis = () => {
    setResult(null);
    setInputText('');
    setAnalyzedContent(''); // Clear RAG context
    setSelectedFile(null);
    setStatus(AnalysisStatus.IDLE);
    setActiveView('dashboard');
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    // Restore text content
    const content = item.originalText || item.result.extractedText || '';
    setInputText(content);
    setAnalyzedContent(content); // Restore RAG context
    
    setStatus(AnalysisStatus.SUCCESS);
    setActiveView('dashboard');
    scrollToResults();
  };

  const scrollToResults = () => {
    // Only scroll on mobile where layout is stacked
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // --- Context for RAG ---
  const getDocumentContext = () => {
    // Only generate context if we have a successful result
    if (!result) return undefined;

    let contextParts = [];
    contextParts.push(`PREVIOUS ANALYSIS:\n- Summary: ${result.summary}\n- Red Flags Found: ${result.redFlags.join(', ') || 'None'}`);
    
    // Use the stable analyzedContent state, not the live inputText
    if (analyzedContent && analyzedContent.length > 50) {
      contextParts.push(`FULL DOCUMENT TEXT:\n"""\n${analyzedContent}\n"""`);
    }
    
    return contextParts.length > 0 ? contextParts.join('\n\n') : undefined;
  };
  
  const documentContext = getDocumentContext();


  // --- UI Components ---

  const Sidebar = () => (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out transform -translate-x-full md:translate-x-0">
      {/* Brand */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-navy-800">
        <ScaleIcon className="text-gold-400 w-6 h-6" />
        <span className="font-serif font-bold text-white text-xl tracking-tight">LegalEase AI</span>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-navy-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center border border-navy-600">
           {/* Simple Avatar Placeholder */}
           <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
             <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
           </svg>
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">Karan Rathod</h3>
          <p className="text-xs text-slate-500">Free Plan</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'dashboard' && !result ? 'bg-navy-800 text-white' : 'hover:bg-navy-800/50 hover:text-white'}`}
        >
          <LayoutGridIcon className="w-5 h-5" /> Dashboard
        </button>
        
        <button 
          onClick={startNewAnalysis}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-navy-800/50 hover:text-white ${!result && activeView === 'dashboard' ? '' : 'text-gold-400'}`}
        >
           <PlusCircleIcon className="w-5 h-5" /> New Analysis
        </button>

        <button 
          onClick={() => setActiveView('history')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'history' ? 'bg-navy-800 text-white' : 'hover:bg-navy-800/50 hover:text-white'}`}
        >
          <ClockIcon className="w-5 h-5" /> History
        </button>

        <button 
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === 'settings' ? 'bg-navy-800 text-white' : 'hover:bg-navy-800/50 hover:text-white'}`}
        >
          <SettingsIcon className="w-5 h-5" /> Settings
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-navy-800">
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-2 py-2">
          <LogOutIcon className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden h-16 bg-navy-900 flex items-center justify-between px-4 text-white sticky top-0 z-40 shadow-md">
           <div className="flex items-center gap-2">
              <ScaleIcon className="text-gold-400 w-5 h-5" />
              <span className="font-serif font-bold">LegalEase AI</span>
           </div>
           {/* Simple Menu Trigger Hint */}
           <div className="text-xs text-slate-400">Menu →</div>
        </div>

        {activeView === 'dashboard' && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
            <header className="mb-8 md:mb-12 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 leading-tight">
                Understand Your Rights in Seconds.
              </h1>
              <p className="text-slate-500 mt-2 max-w-2xl">
                Paste your contract or scan a legal notice. Our AI identifies risks and simplifies clauses instantly.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Input Area */}
              <div className={`transition-all duration-500 ${result ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
                 <InputSection 
                   inputText={inputText}
                   setInputText={setInputText}
                   selectedFile={selectedFile}
                   setSelectedFile={setSelectedFile}
                   onAnalyze={handleAnalyze}
                   onFileSelect={handleFileSelect}
                   status={status}
                   loadingMessage={loadingMessage}
                 />
              </div>

              {/* Results Area */}
              {(status !== AnalysisStatus.IDLE || result) && (
                <div ref={resultsRef} className="lg:col-span-7 animate-fade-in-right">
                  <ResultSection 
                    result={result}
                    status={status}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="max-w-5xl mx-auto p-8">
            <h2 className="text-2xl font-serif font-bold text-navy-900 mb-6">Analysis History</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <ClockIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No history yet. Start a new analysis!</p>
                <button onClick={startNewAnalysis} className="mt-4 text-gold-600 font-semibold hover:underline">Go to Dashboard</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {history.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{new Date(item.timestamp).toLocaleString()}</p>
                      <h3 className="font-semibold text-navy-900 mb-1 line-clamp-1">{item.result.keyClauses[0]?.clause || "Legal Document Analysis"}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1">{item.preview}</p>
                    </div>
                    <button 
                      onClick={() => loadHistoryItem(item)}
                      className="bg-navy-50 text-navy-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-navy-100"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'settings' && (
          <div className="max-w-3xl mx-auto p-8">
            <h2 className="text-2xl font-serif font-bold text-navy-900 mb-6">Settings</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <div>
                   <h3 className="font-semibold text-navy-900">Profile Information</h3>
                   <p className="text-sm text-slate-500">Update your account details</p>
                 </div>
                 <button className="text-gold-600 text-sm font-semibold">Edit</button>
               </div>
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <div>
                   <h3 className="font-semibold text-navy-900">Notifications</h3>
                   <p className="text-sm text-slate-500">Email alerts for finished analyses</p>
                 </div>
                 <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
               </div>
               <div className="p-6 bg-slate-50">
                 <p className="text-xs text-center text-slate-400">LegalEase AI v1.0.0</p>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Chat Widget - Always available */}
      <ChatWidget documentContext={documentContext} />
    </div>
  );
};

export default App;
