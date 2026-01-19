
import React, { useState } from 'react';
import { Lead, Contact } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { ReportIcon } from './icons/ReportIcon';
import MarkdownRenderer from './MarkdownRenderer';

interface LeadDetailProps {
  lead: Lead;
  onGenerateCompetitorAnalysis: (lead: Lead) => Promise<void>;
  onGenerateTalkingPoints: (lead: Lead, contact: Contact) => Promise<void>;
}

const InfoPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold mr-2 px-2.5 py-1 rounded-md border border-indigo-100 mb-1">{children}</span>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <h4 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-3">{title}</h4>
    {children}
  </div>
);

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onGenerateCompetitorAnalysis, onGenerateTalkingPoints }) => {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [talkingPointsLoading, setTalkingPointsLoading] = useState<string | null>(null);

  const handleAnalysisClick = async () => {
    setAnalysisLoading(true);
    await onGenerateCompetitorAnalysis(lead);
    setAnalysisLoading(false);
  };

  const handleTalkingPointsClick = async (contact: Contact) => {
    setTalkingPointsLoading(contact.contactName);
    await onGenerateTalkingPoints(lead, contact);
    setTalkingPointsLoading(null);
  };

  return (
    <div className="bg-slate-100 p-8 animate-fade-in border-x border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Column 1: Core Info & Strategy */}
        <div className="space-y-6">
          <DetailSection title="Strategy Justification">
            <p className="text-sm text-slate-800 font-medium leading-relaxed">{lead.justification}</p>
          </DetailSection>

          {lead.swotAnalysis && (
            <DetailSection title="SWOT Intelligence">
              <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <MarkdownRenderer content={lead.swotAnalysis} className="text-xs" />
              </div>
            </DetailSection>
          )}

          <DetailSection title="Corporate Identity">
            <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-800 font-medium">{lead.email}</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-800 font-medium">{lead.phone}</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Scale:</span>
                    <span className="text-slate-800 font-medium">{lead.employeeCount} Emps</span>
                </li>
                <li className="pt-2">
                    <a href={lead.companyLinkedIn} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center transition-colors">
                        LinkedIn Corporate Hub <ExternalLinkIcon className="ml-1" />
                    </a>
                </li>
            </ul>
          </DetailSection>
        </div>

        {/* Column 2: Market Position & Intelligence */}
        <div className="space-y-6">
          <DetailSection title="Growth & Competition">
            <div className="mb-4">
                <span className="text-xs text-slate-400">Latest Capital Infusion</span>
                <p className="text-sm font-bold text-slate-800">{lead.latestFunding}</p>
            </div>
            
            <div className="mb-4">
                <span className="text-xs text-slate-400">Market Rivalry</span>
                <div className="flex flex-wrap gap-1 mt-1">
                    {lead.competitors.map((c, i) => <InfoPill key={i}>{c}</InfoPill>)}
                </div>
            </div>

            <div className="pt-2">
              {lead.competitorAnalysis ? (
                <div className="mt-2 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                  <h5 className="text-xs font-black text-indigo-400 mb-3 uppercase tracking-tighter">Competitor Battle Card</h5>
                  <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    <MarkdownRenderer content={lead.competitorAnalysis} className="text-xs" />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleAnalysisClick} 
                  disabled={analysisLoading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border-2 border-indigo-600 rounded-xl shadow-sm text-sm font-bold text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                  <ReportIcon />
                  <span>{analysisLoading ? 'Deep Analyzing...' : 'Generate Battle Card'}</span>
                </button>
              )}
            </div>
          </DetailSection>

          <DetailSection title="Signals & Tech">
            <div className="flex flex-wrap gap-1 mb-4">
              {lead.techStack.map((tech, i) => <InfoPill key={i}>{tech}</InfoPill>)}
            </div>
            
            <div className="mt-4">
                <span className="text-xs text-slate-400">Verified Press Signals</span>
                <ul className="space-y-3 mt-2">
                    {lead.latestNews.url !== "N/A" && (
                        <li>
                            <a href={lead.latestNews.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium text-sm hover:underline flex items-start group">
                                <ExternalLinkIcon className="mr-2 mt-1 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                                {lead.latestNews.title}
                            </a>
                        </li>
                    )}
                    {lead.latestInternationalNews.url !== "N/A" && (
                        <li>
                            <a href={lead.latestInternationalNews.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold text-sm hover:underline flex items-start group">
                                <span className="mr-2 mt-1">🌍</span>
                                {lead.latestInternationalNews.title}
                            </a>
                        </li>
                    )}
                </ul>
            </div>
          </DetailSection>
        </div>

        {/* Column 3: Decision Makers */}
        <DetailSection title="Decision Maker Network">
          <div className="space-y-4">
            {lead.contacts.map((contact, index) => (
              <div key={index} className="group bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:border-indigo-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-slate-900">{contact.contactName}</p>
                        <p className="text-xs text-slate-500 mb-2">{contact.designation}</p>
                    </div>
                    {contact.contactLinkedIn !== "Not found" && (
                        <a href={contact.contactLinkedIn} target="_blank" rel="noopener noreferrer" className="p-1 bg-white rounded-md shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                            <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                    )}
                </div>

                <div className="mt-3">
                  {contact.talkingPoints ? (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
                      <h5 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">A.I. Talking Points</h5>
                      <ul className="space-y-2">
                        {contact.talkingPoints.map((p, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start">
                            <span className="text-indigo-500 mr-2 font-bold">›</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleTalkingPointsClick(contact)}
                      disabled={talkingPointsLoading === contact.contactName}
                      className="w-full text-xs py-2 px-3 border border-indigo-200 rounded-lg font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                      {talkingPointsLoading === contact.contactName ? 'Researching...' : '✨ Create Personal Intro'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>
    </div>
  );
};

export default LeadDetail;
