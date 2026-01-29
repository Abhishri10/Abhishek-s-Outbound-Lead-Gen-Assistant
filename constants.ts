
import { SearchFormData } from './types';

export const CLIENT_CATEGORIES = [
  "Technology", "Fintech", "E-commerce", "Healthcare", "EdTech", 
  "SaaS", "Manufacturing", "Logistics", "Retail", "Pharmaceuticals",
  "Food & Beverage", "Hospitality", "Automotive", "Real Estate", "Media & Entertainment"
];

export const TARGET_DEPARTMENTS = [
  "Marketing", "Sales", "International Marketing", "Business Development", 
  "Executive", "Operations", "CEO", "COO", "Business Head", "Owner"
];

export const TARGET_INTERNATIONAL_REGIONS = ["USA", "Canada", "UK/Europe", "Africa", "MENA", "APAC"];
export const PLATFORMS_OF_INTEREST = ["TV", "ZEE5", "Digital", "News"];
export const SALES_TERRITORIES = ["North", "East", "West", "South"];

const initialTargetRegions = TARGET_INTERNATIONAL_REGIONS.reduce((acc, region) => {
    acc[region] = true; // Default to all checked
    return acc;
}, {} as { [key: string]: boolean });

const initialPlatforms = PLATFORMS_OF_INTEREST.reduce((acc, platform) => {
    acc[platform] = false;
    return acc;
}, {} as { [key: string]: boolean });
initialPlatforms['Digital'] = true;
initialPlatforms['News'] = true;

const initialTargetDepartments = TARGET_DEPARTMENTS.reduce((acc, dep) => {
    acc[dep] = false;
    return acc;
}, {} as { [key: string]: boolean });
initialTargetDepartments['International Marketing'] = true;

const initialSalesTerritory = SALES_TERRITORIES.reduce((acc, zone) => {
    acc[zone] = true; // Default to all checked
    return acc;
}, {} as { [key: string]: boolean });


export const DEFAULT_FORM_DATA: SearchFormData = {
  clientName: '',
  findSimilar: false,
  clientCategory: 'Technology',
  targetDepartments: initialTargetDepartments,
  searchWeb: true,
  searchLinkedIn: true,
  searchReddit: false,
  searchFacebook: false,
  searchX: false,
  searchInstagram: false,
  generateEmail: true,
  targetRegion: 'INDIA', // Origin country of leads
  targetRegions: initialTargetRegions,
  platforms: initialPlatforms,
  targetStartups: false,
  salesTerritory: initialSalesTerritory,
  excludedClients: '',
  agencyNames: '',
};
