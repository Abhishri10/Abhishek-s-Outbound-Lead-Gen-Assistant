
import React from 'react';
import { SearchFormData } from '../types';
import { CLIENT_CATEGORIES, TARGET_DEPARTMENTS, TARGET_INTERNATIONAL_REGIONS, PLATFORMS_OF_INTEREST, SALES_TERRITORIES } from '../constants';

interface SearchFormProps {
  formData: SearchFormData;
  setFormData: React.Dispatch<React.SetStateAction<SearchFormData>>;
  onGenerate: (formData: SearchFormData) => void;
  onClear: () => void;
  isLoading: boolean;
  hasLeads: boolean;
}

const CompactSelectionPanel: React.FC<{
  label: string;
  items: string[];
  checkedItems: { [key: string]: boolean };
  groupName: 'targetRegions' | 'platforms' | 'targetDepartments' | 'salesTerritory';
  onChange: (group: 'targetRegions' | 'platforms' | 'targetDepartments' | 'salesTerritory', name: string, checked: boolean) => void;
  columns?: string;
}> = ({ label, items, checkedItems, groupName, onChange, columns = "grid-cols-2" }) => (
  <div className="bg-white p-5 border-r border-slate-100 last:border-r-0">
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">{label}</label>
    <div className={`grid ${columns} gap-x-6 gap-y-3 max-h-40 overflow-y-auto custom-scrollbar`}>
      {items.map(item => (
        <div key={item} className="flex items-center">
          <input
            id={`${groupName}-${item}`}
            type="checkbox"
            checked={checkedItems[item] || false}
            onChange={(e) => onChange(groupName, item, e.target.checked)}
            className="h-5 w-5 text-indigo-600 rounded"
          />
          <label htmlFor={`${groupName}-${item}`} className="ml-3 block text-[13px] font-bold text-slate-600 truncate">{item}</label>
        </div>
      ))}
    </div>
  </div>
);

const SearchForm: React.FC<SearchFormProps> = ({ formData, setFormData, onGenerate, onClear, isLoading, hasLeads }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleCheckboxGroupChange = (group: 'targetRegions' | 'platforms' | 'targetDepartments' | 'salesTerritory', name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [group]: { ...prev[group], [name]: checked } }));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden mb-12">
      <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
        <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Campaign Control Center</h2>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)] mr-3"></span>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Neural Link Active</span>
          </div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">v4.0.1</span>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onGenerate(formData); }} className="divide-y divide-slate-100">
        {/* Tier 1: Primary Entity Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-50/50">
          <div className="p-6 border-r border-slate-100">
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Target Entity Name</label>
            <div className="flex gap-4 items-center">
                <input name="clientName" value={formData.clientName} onChange={handleChange} className="flex-1 px-6 py-3.5 text-base font-bold bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all" placeholder="Enter company name..." />
                <div className="flex items-center space-x-3 px-5 border-l border-slate-200 h-10">
                    <input id="findSimilar" name="findSimilar" type="checkbox" checked={formData.findSimilar} onChange={handleChange} className="h-6 w-6 text-indigo-600 rounded-lg cursor-pointer" disabled={!formData.clientName} />
                    <label htmlFor="findSimilar" className="text-[11px] font-black text-slate-500 uppercase whitespace-nowrap cursor-pointer">Lookalike Mode</label>
                </div>
            </div>
          </div>
          <div className="p-6 flex gap-8 items-end">
            <div className="flex-1">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Market Classification</label>
                <select name="clientCategory" value={formData.clientCategory} onChange={handleChange} className="w-full px-6 py-3.5 text-base font-bold bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none appearance-none cursor-pointer">
                {CLIENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <div className="flex items-center pb-4">
              <input id="targetStartups" name="targetStartups" type="checkbox" checked={formData.targetStartups} onChange={handleChange} className="h-6 w-6 text-indigo-600 rounded-lg cursor-pointer" />
              <label htmlFor="targetStartups" className="ml-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap cursor-pointer">Startups Only</label>
            </div>
          </div>
        </div>

        {/* Tier 2: Departments & Regions */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100 bg-white">
          <CompactSelectionPanel label="Target Stakeholder Departments" items={TARGET_DEPARTMENTS} checkedItems={formData.targetDepartments} groupName="targetDepartments" onChange={handleCheckboxGroupChange} columns="grid-cols-2" />
          <CompactSelectionPanel label="Expansion Territories" items={TARGET_INTERNATIONAL_REGIONS} checkedItems={formData.targetRegions} groupName="targetRegions" onChange={handleCheckboxGroupChange} columns="grid-cols-3" />
        </div>

        {/* Tier 3: Platforms & Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100 bg-slate-50/30">
          <CompactSelectionPanel label="Interest Platforms" items={PLATFORMS_OF_INTEREST} checkedItems={formData.platforms} groupName="platforms" onChange={handleCheckboxGroupChange} columns="grid-cols-2" />
          <CompactSelectionPanel label="Domestic Sales Zones (India)" items={SALES_TERRITORIES} checkedItems={formData.salesTerritory} groupName="salesTerritory" onChange={handleCheckboxGroupChange} columns="grid-cols-2" />
        </div>

        {/* Tier 4: Search Sources */}
        <div className="p-8 bg-white">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Intelligence Data Sources</label>
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            {['searchWeb', 'searchLinkedIn', 'searchFacebook', 'searchX', 'searchInstagram', 'searchReddit'].map(opt => (
              <div key={opt} className="flex items-center group cursor-pointer">
                <input id={opt} name={opt} type="checkbox" checked={(formData as any)[opt]} onChange={handleChange} className="h-5 w-5 text-indigo-600 rounded cursor-pointer" />
                <label htmlFor={opt} className="ml-3.5 text-[14px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors capitalize cursor-pointer">{opt.replace('search', '')}</label>
              </div>
            ))}
            <div className="ml-auto pl-10 border-l-2 border-slate-100 flex items-center group cursor-pointer">
              <input id="generateEmail" name="generateEmail" type="checkbox" checked={formData.generateEmail} onChange={handleChange} className="h-6 w-6 text-indigo-600 rounded cursor-pointer" />
              <label htmlFor="generateEmail" className="ml-4 text-[14px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer group-hover:underline decoration-2 underline-offset-4">Build Outreach Sequence</label>
            </div>
          </div>
        </div>

        {/* Tier 5: Unified Action Bar */}
        <div className="p-8 bg-slate-50 flex items-center justify-between gap-8 border-t border-slate-200">
          <button type="button" onClick={onClear} className="px-10 py-5 text-[14px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">
            Reset Engine
          </button>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 md:flex-none md:min-w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white px-16 py-6 rounded-[1.5rem] shadow-2xl shadow-indigo-100 text-[14px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
          >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Mining Data...
                </span>
            ) : 'Execute Intelligence Scan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
