import React, { useState, useMemo } from 'react';
import { Lead, Contact, OutreachStep } from '../types';
import LeadDetail from './LeadDetail';
import EmailModal from './EmailModal';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MailIcon } from './icons/MailIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultsTableProps {
  leads: Lead[];
  isLoading: boolean;
  findLookalikes: (lead: Lead) => void;
  exportToCSV: () => void;
  exportToXLSX: () => void;
  copyToClipboard: () => void;
  generateCompetitorAnalysis: (lead: Lead) => Promise<void>;
  generateTalkingPoints: (lead: Lead, contact: Contact) => Promise<void>;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  leads,
  isLoading,
  findLookalikes,
  exportToCSV,
  exportToXLSX,
  copyToClipboard,
  generateCompetitorAnalysis,
  generateTalkingPoints
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
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
  
  const handleViewEmail = (sequence: OutreachStep[] | undefined) => {
    if (sequence) {
      setEmailModalContent(sequence);
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
        <h2 className="text-xl font-bold text-slate-700">Generated Leads ({leads.length})</h2>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lead Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Icebreaker</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedLeads.map(lead => (
              <React.Fragment key={lead.companyName}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{lead.companyName}</div>
                    <div className="text-sm text-slate-500">{lead.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.leadScore > 75 ? 'bg-green-100 text-green-800' : lead.leadScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {lead.leadScore}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{lead.outreachSuggestion}</p>

                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                        {lead.outreachSequence && lead.outreachSequence.length > 0 && (
                            <button onClick={() => handleViewEmail(lead.outreachSequence)} className="text-slate-500 hover:text-indigo-600" title="View Email Sequence">
                                <MailIcon />
                            </button>
                        )}
                        <button onClick={() => findLookalikes(lead)} className="text-slate-500 hover:text-indigo-600" title="Find Lookalikes">
                            <SparklesIcon />
                        </button>
                        <button onClick={() => toggleRow(lead.companyName)} className={`transform transition-transform ${expandedRows.has(lead.companyName) ? 'rotate-180' : ''}`}>
                          <ChevronDownIcon />
                        </button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(lead.companyName) && (
                  <tr>
                    <td colSpan={4} className="p-0">
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
