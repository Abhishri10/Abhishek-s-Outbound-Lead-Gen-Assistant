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

const CheckboxGroup: React.FC<{
  label: string;
  items: string[];
  checkedItems: { [key: string]: boolean };
  groupName: 'targetRegions' | 'platforms' | 'targetDepartments' | 'salesTerritory';
  onChange: (group: 'targetRegions' | 'platforms' | 'targetDepartments' | 'salesTerritory', name: string, checked: boolean) => void;
}> = ({ label, items, checkedItems, groupName, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600">{label}</label>
    <div className="mt-2 grid grid-cols-2 gap-2">
      {items.map(item => (
        <div key={item} className="flex items-center">
          <input
            id={`${groupName}-${item}`}
            name={item}
            type="checkbox"
            checked={checkedItems[item] || false}
            onChange={(e) => onChange(groupName, item, e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor={`${groupName}-${item}`} className="ml-2 block text-sm text-slate-600">{item}</label>
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
     setFormData(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [name]: checked
      }
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
      <h2 className="text-xl font-bold mb-4 text-slate-700">Lead Generation Query</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-slate-600">Company Name (Optional)</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., InnovateTech"
          />
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <div className="flex items-center">
            <input
              id="findSimilar"
              name="findSimilar"
              type="checkbox"
              checked={formData.findSimilar}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={!formData.clientName}
            />
            <label htmlFor="findSimilar" className="ml-2 block text-sm text-slate-600">Find similar companies</label>
          </div>
          <div className="flex items-center">
              <input
                id="targetStartups"
                name="targetStartups"
                type="checkbox"
                checked={formData.targetStartups}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="targetStartups" className="ml-2 block text-sm text-slate-600">Target Startups</label>
          </div>
        </div>

        <div>
          <label htmlFor="excludedClients" className="block text-sm font-medium text-slate-600">Exclude Existing Clients</label>
          <textarea
            id="excludedClients"
            name="excludedClients"
            rows={4}
            value={formData.excludedClients}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter one company name per line..."
          />
        </div>

        <div>
          <label htmlFor="agencyNames" className="block text-sm font-medium text-slate-600">Exclude Agency Clients (Optional)</label>
          <textarea
            id="agencyNames"
            name="agencyNames"
            rows={4}
            value={formData.agencyNames}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter one agency name per line to exclude their clients..."
          />
        </div>

        <div>
          <label htmlFor="clientCategory" className="block text-sm font-medium text-slate-600">Client Category</label>
          <select
            id="clientCategory"
            name="clientCategory"
            value={formData.clientCategory}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {CLIENT_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        <CheckboxGroup
          label="Target Departments"
          items={TARGET_DEPARTMENTS}
          checkedItems={formData.targetDepartments}
          groupName="targetDepartments"
          onChange={handleCheckboxGroupChange}
        />

        <CheckboxGroup
          label="Sales Professional Territory"
          items={SALES_TERRITORIES}
          checkedItems={formData.salesTerritory}
          groupName="salesTerritory"
          onChange={handleCheckboxGroupChange}
        />
        
        <CheckboxGroup
          label="Target International Regions"
          items={TARGET_INTERNATIONAL_REGIONS}
          checkedItems={formData.targetRegions}
          groupName="targetRegions"
          onChange={handleCheckboxGroupChange}
        />
        
        <CheckboxGroup
          label="Platforms of Interest"
          items={PLATFORMS_OF_INTEREST}
          checkedItems={formData.platforms}
          groupName="platforms"
          onChange={handleCheckboxGroupChange}
        />

        <div>
          <label className="block text-sm font-medium text-slate-600">Search Options</label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input id="searchWeb" name="searchWeb" type="checkbox" checked={formData.searchWeb} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              <label htmlFor="searchWeb" className="ml-2 block text-sm text-slate-600">In-depth Web Search</label>
            </div>
            <div className="flex items-center">
              <input id="searchLinkedIn" name="searchLinkedIn" type="checkbox" checked={formData.searchLinkedIn} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              <label htmlFor="searchLinkedIn" className="ml-2 block text-sm text-slate-600">LinkedIn</label>
            </div>
            <div className="flex items-center">
              <input id="searchSocialMedia" name="searchSocialMedia" type="checkbox" checked={formData.searchSocialMedia} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              <label htmlFor="searchSocialMedia" className="ml-2 block text-sm text-slate-600">Social Media Search</label>
            </div>
             <div className="flex items-center">
              <input id="generateEmail" name="generateEmail" type="checkbox" checked={formData.generateEmail} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              <label htmlFor="generateEmail" className="ml-2 block text-sm text-slate-600">Generate AI Outreach Email</label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Leads'}
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={isLoading || !hasLeads}
            className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;