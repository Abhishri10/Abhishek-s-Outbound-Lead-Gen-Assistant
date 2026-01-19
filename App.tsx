import React, { useState, useEffect, useCallback } from 'react';
import { SearchFormData, Lead, Contact } from './types';
import { DEFAULT_FORM_DATA } from './constants';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import MarketExplorer from './components/MarketExplorer';
import { generateLeadsPrompt, generateCompetitorAnalysis, generateTalkingPoints } from './services/geminiService';
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
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h1 className="text-3xl font-bold text-slate-800">Abhishek's Outbound Lead Gen Assistant</h1>
      <p className="text-slate-600 mt-2">
        An intelligent tool to automate finding Indian companies with strong potential for international expansion.
      </p>
    </div>
  );

  const TabButton: React.FC<{
      label: string;
      isActive: boolean;
      onClick: () => void;
      icon: React.ReactNode;
  }> = ({ label, isActive, onClick, icon }) => (
      <button
          onClick={onClick}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors ${
              isActive
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
          aria-current={isActive ? 'page' : undefined}
      >
          {icon}
          <span>{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        {header}

        <div className="mb-6 border-b border-slate-200">
            <nav className="flex space-x-2">
                <TabButton 
                    label="Lead Generation"
                    isActive={activeTab === 'leads'}
                    onClick={() => setActiveTab('leads')}
                    icon={<DocumentTextIcon />}
                />
                <TabButton 
                    label="Market Explorer"
                    isActive={activeTab === 'market'}
                    onClick={() => setActiveTab('market')}
                    icon={<BrainCircuitIcon />}
                />
            </nav>
        </div>

        {activeTab === 'leads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <SearchForm
                formData={formData}
                setFormData={setFormData}
                onGenerate={handleGenerateLeads}
                onClear={handleClearLeads}
                isLoading={isLoading}
                hasLeads={leads.length > 0}
              />
            </div>
            <div className="lg:col-span-8">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
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
