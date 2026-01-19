export interface OutreachStep {
  step: number;
  subject: string;
  body: string;
}

export interface SearchFormData {
  clientName: string;
  findSimilar: boolean;
  clientCategory: string;
  targetDepartments: { [key: string]: boolean };
  searchWeb: boolean;
  searchLinkedIn: boolean;
  searchSocialMedia: boolean;
  generateEmail: boolean;
  targetRegion: string; // The origin region of companies, e.g., 'INDIA'
  targetRegions: { [key: string]: boolean }; // The destination regions for expansion
  platforms: { [key: string]: boolean };
  targetStartups: boolean;
  salesTerritory: { [key: string]: boolean };
  excludedClients: string;
  agencyNames: string;
}

export interface Contact {
  contactName: string;
  designation: string;
  contactLinkedIn: string;
  talkingPoints?: string[];
}

export interface NewsArticle {
  title: string;
  url: string;
}

export interface Lead {
  companyName: string;
  category: string;
  companyLinkedIn: string;
  justification: string;
  email: string;
  phone: string;
  leadScore: number;
  outreachSuggestion: string;
  employeeCount: string;
  latestFunding: string;
  techStack: string[];
  competitors: string[];
  latestNews: NewsArticle;
  latestInternationalNews: NewsArticle;
  outreachSequence?: OutreachStep[];
  competitorAnalysis?: string;
  swotAnalysis?: string;
  contacts: Contact[];
  platformPresence: string[];
}