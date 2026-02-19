
import React, { useState, useEffect, useRef } from 'react';
import { SimplifyResult, AnalysisStatus } from '../types';
import { FileCheckIcon, ShieldAlertIcon, CheckCircleIcon, ScaleIcon, SpeakerWaveIcon, StopIcon, LoadingSpinner } from './Icons';
import { generateTTS } from '../services/geminiService';

interface ResultSectionProps {
  result: SimplifyResult | null;
  status: AnalysisStatus;
}

// Helper to decode Gemini TTS audio (raw PCM usually, or standard formats if header present)
// Note: The TTS model currently returns standard audio formats often, but if raw, we need decoding.
// However, standard browser decodeAudioData handles most container formats (wav/mp3) well. 
// If raw PCM, we would need the raw decode function. 
// *UPDATE*: Gemini 2.5 TTS Preview returns valid audio containers (usually WAV/MP3 wrapped) in the inlineData. 
// We can use standard AudioContext decoding.

const ResultSection: React.FC<ResultSectionProps> = ({ result, status }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => stopAudio();
  }, []);

  // Stop speaking if result or status changes
  useEffect(() => {
    stopAudio();
  }, [result, status]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  const handleToggleAudio = async () => {
    if (isSpeaking || isLoadingAudio) {
      stopAudio();
      return;
    }

    if (!result) return;

    setIsLoadingAudio(true);

    try {
      const textToRead = `
        Summary: ${result.summary}. 
        Potential Red Flags: ${
          result.redFlags.length > 0 
          ? result.redFlags.join('. ') 
          : 'None detected.'
        }
      `;

      const base64Audio = await generateTTS(textToRead);

      // Decode and play
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsSpeaking(false);
        sourceNodeRef.current = null;
      };
      
      sourceNodeRef.current = source;
      source.start(0);
      setIsSpeaking(true);
      
    } catch (error) {
      console.error("TTS Error:", error);
      alert("Could not generate audio guide. Please try again.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  if (status === AnalysisStatus.IDLE) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <FileCheckIcon className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">Ready to Analyze</h3>
        <p className="max-w-xs mx-auto">Your simplified analysis will appear here. Paste your text on the left to get started.</p>
      </div>
    );
  }

  if (status === AnalysisStatus.LOADING) {
     return (
       <div className="h-full flex flex-col justify-center items-center p-12 bg-white rounded-2xl border border-slate-100 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50 to-transparent animate-pulse"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-gold-400 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-serif font-bold text-navy-900 mb-2">Processing Document</h3>
            <p className="text-slate-500">Our AI is reading through the complexities...</p>
          </div>
       </div>
     )
  }

  if (status === AnalysisStatus.ERROR || !result) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center p-12 bg-red-50 rounded-2xl border border-red-100 text-red-800">
        <ShieldAlertIcon className="w-12 h-12 mb-4 text-red-400" />
        <h3 className="text-lg font-bold">Analysis Failed</h3>
        <p>Something went wrong. Please check your text and try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in-up">
      <div className="bg-gold-400 p-1"></div> {/* Top accent bar */}
      
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
         <div>
          <h2 className="text-xl font-bold font-serif text-navy-900">Analysis Result</h2>
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mt-1">Simplified Version</p>
         </div>
         <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" /> Ready
         </div>
      </div>

      <div className="flex-grow p-6 overflow-y-auto legal-scroll space-y-8">
        
        {/* Summary Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Overview
            </h3>
            <button 
              onClick={handleToggleAudio}
              disabled={isLoadingAudio}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                isSpeaking 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-navy-50 text-navy-700 border-navy-100 hover:bg-navy-100 hover:border-navy-200'
              }`}
            >
              {isLoadingAudio ? (
                <>
                  <LoadingSpinner className="w-3 h-3" /> Loading Audio...
                </>
              ) : isSpeaking ? (
                <>
                  <StopIcon className="w-3 h-3" /> Stop Audio
                </>
              ) : (
                <>
                  <SpeakerWaveIcon className="w-3 h-3" /> Listen to Summary
                </>
              )}
            </button>
          </div>
          <div className={`bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-lg font-medium shadow-sm transition-colors duration-500 ${isSpeaking ? 'ring-2 ring-gold-400/30' : ''}`}>
            {result.summary}
          </div>
        </section>

        {/* Key Clauses Section */}
        <section>
          <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wider mb-4 flex items-center gap-2">
             Key Clauses
          </h3>
          <div className="space-y-4">
            {result.keyClauses.length > 0 ? result.keyClauses.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-gold-300 transition-colors shadow-sm">
                <div className="flex items-start gap-3">
                   <div className="bg-navy-50 p-2 rounded-lg mt-1">
                      <ScaleIcon className="w-5 h-5 text-navy-700" />
                   </div>
                   <div>
                      <h4 className="font-bold text-navy-900 mb-1">{item.clause}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.explanation}</p>
                   </div>
                </div>
              </div>
            )) : <p className="text-slate-400 text-sm italic">No key clauses identified.</p>}
          </div>
        </section>

        {/* Red Flags Section */}
        <section>
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
             <ShieldAlertIcon className="w-5 h-5" />
             Red Flags & Risks
          </h3>
          <div className={`bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm transition-colors duration-500 ${isSpeaking ? 'ring-2 ring-red-400/30' : ''}`}>
             {result.redFlags.length > 0 ? (
               <ul className="space-y-3">
                 {result.redFlags.map((risk, idx) => (
                   <li key={idx} className="flex items-start gap-3 text-red-900 text-sm font-medium">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                     <span>{risk}</span>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                 <CheckCircleIcon className="w-5 h-5" />
                 No critical red flags detected.
               </p>
             )}
          </div>
        </section>

      </div>
      
      <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
        AI-generated content. Not a substitute for professional legal advice.
      </div>
    </div>
  );
};

export default ResultSection;
