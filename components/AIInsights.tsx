
import React, { useState } from 'react';
import { BrainCircuit, Send, Sparkles, Wand2, Lightbulb, Trash2 } from 'lucide-react';
import {GoogleGenAI} from "@google/genai";

const AIInsights: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    try {
      // Re-initialize client to ensure latest API key and configuration
      // Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      // Selecting Pro model for complex educational reasoning and predictive analysis
      const model = 'gemini-3-pro-preview';
      
      const res = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: "You are an AI Academic Assistant for a school management system. Provide concise, helpful, and data-driven insights about school operations, curriculum, or student behavior simulation. If asked for student comments, provide empathetic and professional academic feedback.",
        }
      });

      // SDK Property access: Use .text (getter) directly
      setResponse(res.text || 'No response generated.');
    } catch (error) {
      console.error('Gemini API Error:', error);
      setResponse('I encountered an error while processing your request. Please ensure the system configuration is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Analyze Grade 5 attendance drop",
    "Draft a report card comment for a student struggling in Math",
    "Plan a school event for World Environment Day",
    "Identify trends in outstanding fee payments"
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 text-center">
        <div className="inline-flex p-4 rounded-3xl bg-indigo-600/10 mb-4">
          <BrainCircuit size={48} className="text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Institutional Intelligence</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Harness AI to analyze institutional data, generate reports, and gain predictive insights.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col flex-1">
        {/* Chat Output */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
          {!response && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Sparkles className="text-indigo-400 mb-4" size={32} />
              <p className="text-slate-400 font-medium">How can I assist you today, Principal Jenkins?</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPrompt(s)}
                    className="p-3 text-xs text-left bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <BrainCircuit size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}

          {response && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <BrainCircuit size={16} />
              </div>
              <div className="bg-white p-6 rounded-2xl rounded-tl-none border border-slate-200 shadow-md prose prose-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="relative flex items-end gap-2 bg-slate-100 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <textarea 
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your query here..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none custom-scrollbar"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskAI();
                }
              }}
            />
            <button 
              onClick={handleAskAI}
              disabled={isLoading || !prompt.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 px-1">
             <div className="flex items-center gap-4 text-slate-400">
                <button className="flex items-center gap-1.5 text-xs hover:text-slate-600 transition-colors">
                   <Lightbulb size={14} /> Academic Insight
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-slate-600 transition-colors">
                   <Wand2 size={14} /> Creative Content
                </button>
             </div>
             {response && (
               <button onClick={() => setResponse(null)} className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                 <Trash2 size={12} /> Clear Chat
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
