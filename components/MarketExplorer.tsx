
import React, { useState } from 'react';
import { CLIENT_CATEGORIES, TARGET_INTERNATIONAL_REGIONS } from '../constants';
import { generateMarketReport } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const MarketExplorer: React.FC = () => {
  const [industry, setIndustry] = useState(CLIENT_CATEGORIES[0]);
  const [region, setRegion] = useState(TARGET_INTERNATIONAL_REGIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateMarketReport(industry, region);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-1 text-slate-800">Intelligence Nexus</h2>
        <p className="text-slate-500 mb-8 text-sm">Deep strategic analysis of sector potential in international territories.</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label htmlFor="industry" className="block text-xs font-black uppercase tracking-widest text-slate-400">Target Sector</label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm rounded-xl transition-all"
            >
              {CLIENT_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="region" className="block text-xs font-black uppercase tracking-widest text-slate-400">Expansion Zone</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm rounded-xl transition-all"
            >
              {TARGET_INTERNATIONAL_REGIONS.map(reg => <option key={reg}>{reg}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 transition-all transform active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Reasoning in Progress...
              </span>
            ) : 'Generate Intelligence Report'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center shadow-sm" role="alert">
          <span className="mr-3 text-xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {isLoading && !report && (
        <div className="bg-white p-12 rounded-2xl shadow-md flex justify-center items-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <div className="relative mb-6 mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Engaging Deep Reasoning</h3>
            <p className="text-slate-500">Gemini 3 Pro is synthesizing market signals, competitor data, and regulatory frameworks to build your report.</p>
          </div>
        </div>
      )}

      {report && (
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 animate-slide-up">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-3xl font-black text-slate-900 leading-tight">Expansion Analysis: {industry}</h3>
              <p className="text-indigo-600 font-bold mt-1 uppercase tracking-widest text-xs">Primary Target: {region}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full font-black text-xs px-5 shadow-sm">
              VERIFIED REPORT
            </div>
          </div>
          <div className="prose prose-slate max-w-none">
             <MarkdownRenderer content={report} />
          </div>
          <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Generated via Gemini 3 Pro with thinkingBudget: 24000</span>
            <span>Ref: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketExplorer;
