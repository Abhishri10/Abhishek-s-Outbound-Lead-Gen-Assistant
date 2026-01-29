
import React, { useState } from 'react';
import { Lead, Contact } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { ReportIcon } from './icons/ReportIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import MarkdownRenderer from './MarkdownRenderer';

interface LeadDetailProps {
  lead: Lead;
  onGenerateCompetitorAnalysis: (lead: Lead) => Promise<void>;
  onGenerateTalkingPoints: (lead: Lead, contact: Contact) => Promise<void>;
}

const DetailCard: React.FC<{ title: string; children: React.ReactNode; badge?: React.ReactNode }> = ({ title, children, badge }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
    <div className="flex justify-between items-center mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">{title}</h4>
        {badge}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onGenerateCompetitorAnalysis, onGenerateTalkingPoints }) => {
  const [analysisLoading, setAnalysisLoading] = useState(false);

  return (
    <div className="bg-slate-50 p-10 border-x border-slate-200 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Column 1: Sales Signal */}
        <div className="space-y-8">
          <DetailCard title="The Sales Hook">
            <p className="text-base font-bold text-slate-800 italic leading-relaxed border-l-4 border-indigo-500 pl-5 py-2">"{lead.justification}"</p>
          </DetailCard>
          
          <DetailCard title="Direct Reach Data">
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mobile / Direct</span>
                    <span className="text-base font-black text-indigo-900">{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-100/50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Email</span>
                    <span className="text-sm font-bold text-slate-800">{lead.email || 'N/A'}</span>
                </div>
                {lead.companyLinkedIn && lead.companyLinkedIn !== "N/A" && (
                  <a href={lead.companyLinkedIn} target="_blank" className="block text-center py-3 text-[11px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-200 rounded-xl hover:bg-indigo-50">View LinkedIn Profile</a>
                )}
            </div>
          </DetailCard>
        </div>

        {/* Column 2: Market Context */}
        <div className="space-y-8">
          <DetailCard title="Growth Capital & Rivals">
            <div className="bg-slate-900 p-5 rounded-2xl mb-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Capital Signal</span>
                <p className="text-sm font-bold text-white">{lead.latestFunding || 'No funding data'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {lead.competitors?.map(c => <span key={c} className="px-3 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-600 rounded-lg shadow-sm">{c}</span>)}
            </div>
          </DetailCard>
          
          <DetailCard title="Deep Intelligence">
             <ul className="space-y-4">
                {lead.latestNews?.url && lead.latestNews.url !== "N/A" && (
                    <li><a href={lead.latestNews.url} target="_blank" className="text-xs font-bold text-indigo-600 flex items-start leading-snug hover:underline"><ExternalLinkIcon className="mr-3 mt-0.5 flex-shrink-0" /> {lead.latestNews.title}</a></li>
                )}
                {lead.latestInternationalNews?.url && lead.latestInternationalNews.url !== "N/A" && (
                    <li><a href={lead.latestInternationalNews.url} target="_blank" className="text-xs font-black text-emerald-600 flex items-start leading-snug hover:underline"><span className="mr-3">🌍</span> {lead.latestInternationalNews.title}</a></li>
                )}
                {(!lead.latestNews?.url || lead.latestNews?.url === "N/A") && (!lead.latestInternationalNews?.url || lead.latestInternationalNews?.url === "N/A") && (
                    <p className="text-xs text-slate-400 italic">No recent news signals detected.</p>
                )}
             </ul>
          </DetailCard>
        </div>

        {/* Column 3: Stakeholders */}
        <DetailCard title="Target Stakeholders">
          <div className="space-y-5">
            {lead.contacts?.map((c, i) => (
              <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-indigo-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-black text-slate-900">{c.contactName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.designation}</p>
                    </div>
                    {c.contactLinkedIn && c.contactLinkedIn !== "Not found" && c.contactLinkedIn !== "N/A" && <a href={c.contactLinkedIn} target="_blank" className="p-2 bg-white shadow-sm rounded-xl text-indigo-600"><ExternalLinkIcon className="w-4 h-4" /></a>}
                </div>
                {!c.talkingPoints ? (
                    <button onClick={() => onGenerateTalkingPoints(lead, c)} className="w-full py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Research Intro</button>
                ) : (
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
                        {c.talkingPoints.map((p, idx) => <p key={idx} className="text-[11px] text-slate-600 leading-relaxed">• {p}</p>)}
                    </div>
                )}
              </div>
            ))}
          </div>
        </DetailCard>
      </div>
    </div>
  );
};

export default LeadDetail;
