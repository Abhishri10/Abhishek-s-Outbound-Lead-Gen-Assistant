
import React, { useState, useMemo } from 'react';
import { Lead, Contact, OutreachStep } from '../types';
import LeadDetail from './LeadDetail';
import EmailModal from './EmailModal';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MailIcon } from './icons/MailIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface ResultsTableProps {
  leads: Lead[];
  isLoading: boolean;
  findLookalikes: (lead: Lead) => void;
  exportToCSV: () => void;
  exportToXLSX: () => void;
  copyToClipboard: () => void;
  generateCompetitorAnalysis: (lead: Lead) => Promise<void>;
  generateTalkingPoints: (lead: Lead, contact: Contact) => Promise<void>;
  onVerifyLeads: (leads: Lead[]) => Promise<void>;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  leads,
  isLoading,
  findLookalikes,
  exportToCSV,
  exportToXLSX,
  copyToClipboard,
  generateCompetitorAnalysis,
  generateTalkingPoints,
  onVerifyLeads
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [emailModalContent, setEmailModalContent] = useState<OutreachStep[] | null>(null);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => b.leadScore - a.leadScore);
  }, [leads]);

  const toggleRow = (companyName: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyName)) {
        newSet.delete(companyName);
      } else {
        newSet.add(companyName);
      }
      return newSet;
    });
  };

  const toggleSelect = (companyName: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyName)) newSet.delete(companyName);
      else newSet.add(companyName);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.companyName)));
    }
  };
  
  const handleViewEmail = (sequence: OutreachStep[] | undefined) => {
    if (sequence) {
      setEmailModalContent(sequence);
    }
  };

  const handleVerify = async () => {
    const leadsToVerify = leads.filter(l => selectedLeads.has(l.companyName));
    await onVerifyLeads(leadsToVerify);
    setSelectedLeads(new Set());
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified': return <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">VERIFIED <ShieldCheckIcon className="ml-1 w-3 h-3" /></span>;
      case 'verifying': return <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 animate-pulse">VERIFYING...</span>;
      case 'failed': return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">FAILED</span>;
      default: return <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">UNVERIFIED</span>;
    }
  };

  if (isLoading && leads.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">AI is performing deep-dive analysis... this may take a moment.</p>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-medium text-slate-700">No leads generated yet.</h3>
        <p className="text-slate-500 mt-2">Fill out the form and click "Generate Leads" to start.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
       <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-700">Generated Leads ({leads.length})</h2>
            {selectedLeads.size > 0 && (
                <button 
                  onClick={handleVerify}
                  className="bg-indigo-600 text-white text-xs font-black px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center transform active:scale-95"
                >
                  Verify {selectedLeads.size} Selected
                </button>
            )}
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={copyToClipboard} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Copy to Clipboard">
              <CopyIcon />
           </button>
           <button onClick={exportToCSV} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Export as CSV">
              <DownloadIcon />
           </button>
           <button onClick={exportToXLSX} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Export as XLSX">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v2h12V5H4zm0 4v2h12V9H4zm0 4v2h12v-2H4z" /></svg>
           </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedLeads.size === leads.length && leads.length > 0} 
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lead Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedLeads.map(lead => (
              <React.Fragment key={lead.companyName}>
                <tr className={`${selectedLeads.has(lead.companyName) ? 'bg-indigo-50/30' : ''} transition-colors`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.has(lead.companyName)} 
                      onChange={() => toggleSelect(lead.companyName)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{lead.companyName}</div>
                    <div className="text-xs text-slate-500">{lead.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.leadScore > 75 ? 'bg-green-100 text-green-800' : lead.leadScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {lead.leadScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(lead.verificationStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                        {lead.outreachSequence && lead.outreachSequence.length > 0 && (
                            <button onClick={() => handleViewEmail(lead.outreachSequence)} className="text-slate-500 hover:text-indigo-600 p-1 rounded hover:bg-white transition-all" title="View Email Sequence">
                                <MailIcon />
                            </button>
                        )}
                        <button onClick={() => findLookalikes(lead)} className="text-slate-500 hover:text-indigo-600 p-1 rounded hover:bg-white transition-all" title="Find Lookalikes">
                            <SparklesIcon />
                        </button>
                        <button onClick={() => toggleRow(lead.companyName)} className={`transform transition-transform p-1 rounded hover:bg-white ${expandedRows.has(lead.companyName) ? 'rotate-180' : ''}`}>
                          <ChevronDownIcon />
                        </button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(lead.companyName) && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <LeadDetail
                        lead={lead}
                        onGenerateCompetitorAnalysis={generateCompetitorAnalysis}
                        onGenerateTalkingPoints={generateTalkingPoints}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
       {emailModalContent && (
        <EmailModal outreachSequence={emailModalContent} onClose={() => setEmailModalContent(null)} />
      )}
    </div>
  );
};

export default ResultsTable;
