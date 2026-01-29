
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
  searchReddit: boolean;
  searchFacebook: boolean;
  searchX: boolean;
  searchInstagram: boolean;
  generateEmail: boolean;
  targetRegion: string;
  targetRegions: { [key: string]: boolean };
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
  verificationStatus?: 'unverified' | 'verifying' | 'verified' | 'failed';
  verificationLog?: string;
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
  latestFunding: string;
  competitors: string[];
  latestNews: NewsArticle;
  latestInternationalNews: NewsArticle;
  outreachSequence?: OutreachStep[];
  competitorAnalysis?: string;
  swotAnalysis?: string;
  contacts: Contact[];
  platformPresence: string[];
  verificationStatus?: 'unverified' | 'verifying' | 'verified' | 'failed';
  verificationReport?: string;
}
