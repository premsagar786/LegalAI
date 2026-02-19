
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleIcon, XMarkIcon, ArrowRightIcon, 
  MicrophoneIcon, PhoneXIcon, LoadingSpinner, SparklesIcon, FileTextIcon
} from './Icons';
import { createChatSession, apiKey } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- LIVE API UTILS ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- UI COMPONENTS ---

const TypingIndicator = () => (
  <div className="flex justify-start w-full animate-fade-in-up my-2">
    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-3">
       <div className="flex space-x-1">
          <div className="w-2 h-2 bg-navy-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-navy-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-navy-700 rounded-full animate-bounce"></div>
       </div>
       <span className="text-xs font-medium text-slate-400">Thinking...</span>
    </div>
  </div>
);

interface ChatWidgetProps {
  documentContext?: string | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ documentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // --- TEXT CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your LegalEase assistant. Ask me anything about Indian Law.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevContextRef = useRef<string | null | undefined>(undefined);

  // --- LIVE VOICE STATE ---
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volume, setVolume] = useState(0); // For visualizer
  
  // Refs for Live API
  const liveSessionPromise = useRef<Promise<any> | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Reset chat if document context changes
  useEffect(() => {
    if (prevContextRef.current !== documentContext) {
       // Context changed
       if (documentContext) {
         setMessages([{ 
           id: Date.now().toString(), 
           role: 'model', 
           text: 'I see you have uploaded a document. I have read it and am ready to answer your questions about it.' 
         }]);
         chatSessionRef.current = null; // Force recreation with new context
       }
       prevContextRef.current = documentContext;
    }
  }, [documentContext]);

  // Scroll to bottom of text chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, mode, isTyping]);

  // Cleanup Live API on unmount or close
  useEffect(() => {
    return () => {
      disconnectLiveSession();
    };
  }, []);

  // --- TEXT CHAT LOGIC ---
  const handleSendText = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        // Create session with current context (RAG)
        chatSessionRef.current = createChatSession(documentContext || undefined);
      }

      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // We will only add the message when we have the first chunk or successfully connected,
      // but to show streaming immediately, we add an empty message first.
      // NOTE: The TypingIndicator will disappear once we add this message because last message role will be 'model'
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

      for await (const chunk of result) {
        const chunkText = (chunk as any).text;
        fullText += chunkText;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
      }
      
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, isStreaming: false } : m));
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- LIVE VOICE LOGIC ---
  const disconnectLiveSession = () => {
    // Clean up audio contexts
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    // Stop all playing sources
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    if (liveSessionPromise.current) {
      liveSessionPromise.current.then(session => {
         try { 
           // Attempt to close if method exists, otherwise just drop
           // @ts-ignore
           if (session.close) session.close(); 
         } catch(e) { console.log('Session close error', e); }
      });
      liveSessionPromise.current = null;
    }

    setLiveStatus('disconnected');
    setIsLiveConnected(false);
    setVolume(0);
  };

  const connectLiveSession = async () => {
    if (!apiKey) {
      alert("API Key missing");
      return;
    }
    
    setLiveStatus('connecting');

    try {
      // 1. Setup Audio Contexts
      // Input needs to be 16kHz for Gemini
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output can be higher quality
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // 2. Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputSource = inputCtx.createMediaStreamSource(stream);
      // Use ScriptProcessor for raw PCM access (AudioWorklet is better for prod, but this is simpler for single file)
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      inputSource.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination); // Mute locally but keep alive

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      // Inject context into system instruction for Live API
      let systemInstruction = "You are a helpful legal assistant named LegalEase. Keep your spoken responses concise and conversational.";
      if (documentContext) {
        systemInstruction += `\n\n=== CONTEXT DOCUMENT ===\nThe user is asking about the following legal document (which contains analysis and full text). Use this to answer: \n${documentContext}`;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setLiveStatus('connected');
            setIsLiveConnected(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  outputCtx,
                  24000,
                  1
                );
                
                // Simple visualizer update based on buffer length/energy roughly
                setVolume(Math.random() * 0.5 + 0.5); 
                setTimeout(() => setVolume(0.1), audioBuffer.duration * 1000);

                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                // Schedule seamless playback
                const currentTime = outputCtx.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                  nextStartTimeRef.current = currentTime;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                
              } catch (e) {
                console.error("Audio decode error", e);
              }
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            disconnectLiveSession();
          },
          onerror: (e) => {
            console.error("Live Session Error", e);
            disconnectLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: systemInstruction,
        }
      });

      liveSessionPromise.current = sessionPromise;

      // 4. Send Audio Data
      scriptProcessor.onaudioprocess = (e) => {
        if (!inputContextRef.current) return; // Stopped

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Very simple visualizer for mic input
        let sum = 0;
        for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
        if (sum > 0.01) setVolume(0.2 + Math.min(sum * 2, 0.8)); // Visual feedback

        // Convert Float32 to Int16 PCM
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          // Clamp values to [-1, 1] to prevent distortion
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const base64Data = encode(new Uint8Array(int16.buffer));

        sessionPromise.then(session => {
          session.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Data
            }
          });
        });
      };

    } catch (error: any) {
      console.error("Failed to connect live session", error);
      if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
        alert("Microphone permission denied. Please allow microphone access to use Live Voice.");
      } else {
        alert("Could not connect to Live Voice. Please check your connection.");
      }
      setLiveStatus('disconnected');
    }
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-navy-100 flex flex-col overflow-hidden pointer-events-auto animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-navy-900 text-white p-4 flex justify-between items-center relative overflow-hidden">
             <div className="flex items-center gap-2 relative z-10">
                <SparklesIcon className="w-5 h-5 text-gold-400" />
                <span className="font-serif font-bold">LegalEase Assistant</span>
             </div>
             
             {documentContext && (
               <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white/10 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-white/20" title="Document Context Active">
                  <FileTextIcon className="w-3 h-3 text-gold-400" /> PDF Active
               </div>
             )}

             <button onClick={toggleOpen} className="hover:text-gold-400 transition-colors relative z-10">
               <XMarkIcon className="w-6 h-6" />
             </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-slate-100">
             <button 
                onClick={() => setMode('text')} 
                className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 ${mode === 'text' ? 'text-navy-900 bg-slate-50 border-b-2 border-gold-400' : 'text-slate-400 hover:bg-slate-50'}`}
             >
                <ChatBubbleIcon className="w-4 h-4" /> Chat
             </button>
             <button 
                onClick={() => {
                  setMode('voice');
                }} 
                className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 ${mode === 'voice' ? 'text-navy-900 bg-slate-50 border-b-2 border-gold-400' : 'text-slate-400 hover:bg-slate-50'}`}
             >
                <MicrophoneIcon className="w-4 h-4" /> Live Voice
             </button>
          </div>

          {/* Content Area */}
          <div className="flex-grow bg-slate-50 relative overflow-hidden flex flex-col">
             
             {/* TEXT MODE */}
             {mode === 'text' && (
               <>
                 <div className="flex-grow overflow-y-auto p-4 space-y-4">
                   {messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-navy-900 text-white rounded-br-none' 
                          : 'bg-white text-navy-900 border border-slate-200 rounded-bl-none'
                        }`}>
                          {msg.text}
                          {msg.isStreaming && <span className="inline-block w-1.5 h-3 ml-1 bg-gold-400 animate-pulse"/>}
                        </div>
                     </div>
                   ))}

                   {/* Typing Indicator: Visible when typing but no response text yet */}
                   {isTyping && messages[messages.length - 1]?.role === 'user' && (
                      <TypingIndicator />
                   )}

                   <div ref={messagesEndRef} />
                 </div>

                 <div className="p-4 bg-white border-t border-slate-100">
                   <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder="Ask a question..."
                        className="flex-grow bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-gold-400 focus:outline-none"
                      />
                      <button 
                        onClick={handleSendText}
                        disabled={!input.trim() || isTyping}
                        className="p-2 bg-gold-400 text-navy-900 rounded-full hover:bg-gold-500 disabled:opacity-50 transition-colors shadow-sm"
                      >
                         <ArrowRightIcon className="w-5 h-5" />
                      </button>
                   </div>
                 </div>
               </>
             )}

             {/* VOICE MODE */}
             {mode === 'voice' && (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-navy-900 to-navy-800 text-white">
                  
                  {liveStatus === 'disconnected' && (
                    <div className="animate-fade-in">
                       <div className="w-24 h-24 rounded-full bg-navy-700 flex items-center justify-center mx-auto mb-6 shadow-2xl border border-navy-600">
                          <MicrophoneIcon className="w-10 h-10 text-slate-300" />
                       </div>
                       <h3 className="text-xl font-serif font-bold mb-2">Start Conversation</h3>
                       <p className="text-slate-400 text-sm mb-8 max-w-xs">
                         {documentContext 
                           ? "Connect to discuss the uploaded document in real-time."
                           : "Connect to LegalEase Live for a real-time voice consultation."}
                       </p>
                       <button 
                         onClick={connectLiveSession}
                         className="bg-gold-500 text-navy-900 font-bold px-8 py-3 rounded-full hover:bg-gold-400 hover:scale-105 transition-all shadow-lg shadow-gold-500/20"
                       >
                         Start Call
                       </button>
                    </div>
                  )}

                  {liveStatus === 'connecting' && (
                    <div className="animate-fade-in flex flex-col items-center">
                       <LoadingSpinner className="w-12 h-12 text-gold-400 mb-4" />
                       <p className="text-gold-400 font-semibold">Connecting to Gemini...</p>
                    </div>
                  )}

                  {liveStatus === 'connected' && (
                    <div className="animate-fade-in w-full flex flex-col items-center justify-between h-full py-8">
                       <div className="text-center">
                          <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 mb-4">
                             LIVE
                          </div>
                          <h3 className="text-lg font-semibold text-slate-200">LegalEase Live</h3>
                       </div>

                       {/* Visualizer */}
                       <div className="flex items-center justify-center gap-1 h-24 w-full">
                          {[...Array(5)].map((_, i) => (
                             <div 
                               key={i} 
                               className="w-3 bg-gold-400 rounded-full transition-all duration-75"
                               style={{ 
                                 height: `${20 + Math.random() * volume * 100}%`,
                                 opacity: 0.5 + volume 
                               }} 
                             />
                          ))}
                       </div>

                       <div className="w-full">
                          <p className="text-slate-400 text-sm mb-6">Listening...</p>
                          <button 
                            onClick={disconnectLiveSession}
                            className="w-full bg-red-500/20 text-red-400 border border-red-500/50 font-bold px-6 py-3 rounded-full hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <PhoneXIcon className="w-5 h-5" /> End Call
                          </button>
                       </div>
                    </div>
                  )}

               </div>
             )}

          </div>
        </div>
      )}

      {/* FAB Button */}
      <button 
        onClick={toggleOpen}
        className="pointer-events-auto bg-navy-900 text-gold-400 p-4 rounded-full shadow-2xl hover:bg-navy-800 transition-all hover:scale-110 border-2 border-gold-500/20 group relative"
      >
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" hidden={isOpen}></span>
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" hidden={isOpen}></span>
        {isOpen ? <XMarkIcon className="w-8 h-8" /> : <ChatBubbleIcon className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default ChatWidget;
