
import React, { useState, useEffect, useCallback } from 'react';
import { SearchFormData, Lead, Contact } from './types';
import { DEFAULT_FORM_DATA } from './constants';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import MarketExplorer from './components/MarketExplorer';
import { generateLeadsPrompt, generateCompetitorAnalysis, generateTalkingPoints, verifyLeadDetails } from './services/geminiService';
import { exportToCSV, exportToXLSX, copyToClipboard } from './utils/export';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';

const App: React.FC = () => {
  const [formData, setFormData] = useState<SearchFormData>(() => {
    const savedFormData = localStorage.getItem('leadGenFormData');
    return savedFormData ? JSON.parse(savedFormData) : DEFAULT_FORM_DATA;
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem('leadGenLeads');
    return savedLeads ? JSON.parse(savedLeads) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'market'>('leads');

  useEffect(() => {
    localStorage.setItem('leadGenFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('leadGenLeads', JSON.stringify(leads));
  }, [leads]);

  const handleGenerateLeads = useCallback(async (currentFormData: SearchFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newLeads = await generateLeadsPrompt(currentFormData);
      setLeads(prevLeads => [...newLeads, ...prevLeads]);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleClearLeads = useCallback(() => {
    setLeads([]);
  }, []);

  const handleVerifyLeads = useCallback(async (leadsToVerify: Lead[]) => {
    setLeads(prev => prev.map(lead => {
      if (leadsToVerify.some(lv => lv.companyName === lead.companyName)) {
        return { ...lead, verificationStatus: 'verifying' };
      }
      return lead;
    }));

    for (const lead of leadsToVerify) {
      try {
        const update = await verifyLeadDetails(lead);
        setLeads(prev => prev.map(l => 
          l.companyName === lead.companyName 
            ? { ...l, ...update } 
            : l
        ));
      } catch (err) {
        console.error(`Verification failed for ${lead.companyName}:`, err);
        setLeads(prev => prev.map(l => 
          l.companyName === lead.companyName 
            ? { ...l, verificationStatus: 'failed' } 
            : l
        ));
      }
    }
  }, []);

  const findLookalikes = useCallback(async (lead: Lead) => {
    setIsLoading(true);
    setError(null);
    try {
      const lookalikeFormData: SearchFormData = {
        ...formData,
        clientName: lead.companyName,
        clientCategory: lead.category,
        findSimilar: true,
      };
      const newLeads = await generateLeadsPrompt(lookalikeFormData);
      const uniqueNewLeads = newLeads.filter(
        (newLead) => newLead.companyName !== lead.companyName && !leads.some(existing => existing.companyName === newLead.companyName)
      );
      setLeads(prevLeads => [...uniqueNewLeads, ...prevLeads]);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred while finding lookalikes.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, leads]);

  const handleGenerateCompetitorAnalysis = useCallback(async (leadToUpdate: Lead) => {
    if (leadToUpdate.competitorAnalysis) return;
    try {
      const analysis = await generateCompetitorAnalysis(leadToUpdate);
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.companyName === leadToUpdate.companyName
            ? { ...lead, competitorAnalysis: analysis }
            : lead
        )
      );
    } catch (e) {
      console.error(e);
      setError('Failed to generate competitor analysis.');
    }
  }, []);

  const handleGenerateTalkingPoints = useCallback(async (leadToUpdate: Lead, contactToUpdate: Contact) => {
    if (contactToUpdate.talkingPoints) return;
    try {
      const points = await generateTalkingPoints(contactToUpdate, leadToUpdate.companyName);
      setLeads(prevLeads =>
        prevLeads.map(lead => {
          if (lead.companyName === leadToUpdate.companyName) {
            const updatedContacts = lead.contacts.map(contact =>
              contact.contactName === contactToUpdate.contactName
                ? { ...contact, talkingPoints: points }
                : contact
            );
            return { ...lead, contacts: updatedContacts };
          }
          return lead;
        })
      );
    } catch (e) {
      console.error(e);
      setError('Failed to generate talking points.');
    }
  }, []);

  const header = (
    <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-slate-200 px-6 py-4 mb-8">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center">
        <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Abhishek's Outbound Engine <span className="text-indigo-600">PRO</span></h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automated International Expansion Intelligence</p>
        </div>
        
        <nav className="flex space-x-2 mt-4 md:mt-0 bg-slate-100 p-1.5 rounded-2xl">
            <button
                onClick={() => setActiveTab('leads')}
                className={`flex items-center space-x-3 px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === 'leads' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                <DocumentTextIcon className="w-5 h-5" />
                <span>Lead Intelligence</span>
            </button>
            <button
                onClick={() => setActiveTab('market')}
                className={`flex items-center space-x-3 px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === 'market' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                <BrainCircuitIcon className="w-5 h-5" />
                <span>Market Explorer</span>
            </button>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {header}

      <main className="max-w-[1600px] mx-auto px-6">
        {activeTab === 'leads' && (
          <div className="flex flex-col space-y-10">
            <div className="w-full">
              <SearchForm
                formData={formData}
                setFormData={setFormData}
                onGenerate={handleGenerateLeads}
                onClear={handleClearLeads}
                isLoading={isLoading}
                hasLeads={leads.length > 0}
              />
            </div>
            
            <div className="w-full">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-5 rounded-2xl shadow-sm mb-8 flex items-center" role="alert">
                  <span className="text-2xl mr-4">⚠️</span>
                  <span className="font-bold text-base">{error}</span>
                </div>
              )}
              <ResultsTable
                leads={leads}
                isLoading={isLoading}
                findLookalikes={findLookalikes}
                exportToCSV={() => exportToCSV(leads)}
                exportToXLSX={() => exportToXLSX(leads)}
                copyToClipboard={() => copyToClipboard(leads)}
                generateCompetitorAnalysis={handleGenerateCompetitorAnalysis}
                generateTalkingPoints={handleGenerateTalkingPoints}
                onVerifyLeads={handleVerifyLeads}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'market' && <MarketExplorer />}
      </main>
    </div>
  );
};

export default App;
