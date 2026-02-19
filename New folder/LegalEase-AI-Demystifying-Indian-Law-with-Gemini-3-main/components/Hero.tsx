import React from 'react';
import { ScaleIcon } from './Icons';

const Hero: React.FC = () => {
  return (
    <div className="bg-navy-900 text-white pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-navy-800 rounded-full border border-navy-700 shadow-xl">
            <ScaleIcon className="w-10 h-10 text-gold-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
          Understand Your <span className="text-gold-400">Rights</span> <br className="hidden md:block"/> in Seconds.
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          LegalEase AI simplifies complex Indian legal documents into plain English. 
          Stop guessing, start understanding. Powered by advanced AI.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-medium text-slate-400">
          <span className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-400"></span> Instant Analysis
          </span>
          <span className="hidden md:block text-slate-600">•</span>
          <span className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-400"></span> Secure & Private
          </span>
           <span className="hidden md:block text-slate-600">•</span>
          <span className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-400"></span> Indian Context
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero;