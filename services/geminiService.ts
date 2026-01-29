
import { GoogleGenAI, Type } from "@google/genai";
import { SearchFormData, Lead, Contact } from '../types';

const buildPrompt = (formData: SearchFormData): string => {
  const selectedRegions = Object.keys(formData.targetRegions).filter(key => formData.targetRegions[key]);
  const selectedPlatforms = Object.keys(formData.platforms).filter(key => formData.platforms[key]);
  const selectedDepartments = Object.keys(formData.targetDepartments).filter(key => formData.targetDepartments[key]);
  const departmentsListText = selectedDepartments.length > 0 ? selectedDepartments.join(', ') : 'any relevant';

  const exclusionInstruction = formData.excludedClients.trim()
    ? `**CRITICAL EXCLUSION LIST:** You MUST NOT include these companies: ${formData.excludedClients.split('\n').map(c => c.trim()).filter(Boolean).join(', ')}.`
    : '';

  let taskDescription = `Identify Indian companies in "${formData.clientCategory}" with high potential for international expansion.`;
  if (formData.clientName) {
    taskDescription = `Focus on "${formData.clientName}" and 5 lookalike companies.`;
  }

  return `
#### A. Task Description
${taskDescription}
${exclusionInstruction}

#### B. DATA HUNTER PROTOCOL (MANDATORY)
**For each company, you must operate as a dedicated data scavenger:**
1.  **PHONE NUMBER IS TOP PRIORITY:** 
    - You MUST find a direct contact number. Scrape the company's "Contact Us" page footer.
    - Check Google Maps business listings for the HQ landline or mobile.
    - Check LinkedIn "About" or "Contact Info" sections.
    - Do not return "N/A" unless every source fails. A phone number makes this lead 10x more valuable.
2.  **LEAD DATA STRUCTURE:**
    - companyName, category, email, phone.
    - justification: Concise reason for international potential.
    - leadScore: 1-100 (high score for companies with existing foreign offices).
    - outreachSuggestion: High-impact icebreaker.
    - latestFunding, competitors (array).
    - latestNews (object with title/url).
    - latestInternationalNews (object with title/url regarding their global moves).
    - platformPresence: Array of: ${Object.keys(formData.platforms).filter(k => formData.platforms[k]).join(', ')}.
    - contacts: 5 verified stakeholders in: ${departmentsListText}.

#### C. Output Format
Return ONLY a valid JSON array of lead objects. No text outside the JSON.
`;
};

export const generateLeadsPrompt = async (formData: SearchFormData): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(formData),
    config: {
      systemInstruction: "You are an elite B2B Lead Scraper. Your mission is to find accurate, direct phone numbers and verified contact details for Indian businesses. You never settle for surface-level data.",
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  let jsonString = text.trim();
  const match = jsonString.match(/\[[\s\S]*\]/);
  if (match) jsonString = match[0];

  try {
    const rawLeads = JSON.parse(jsonString);
    return rawLeads.map((lead: any) => ({
      ...lead,
      latestNews: lead.latestNews || { title: 'No news found', url: 'N/A' },
      latestInternationalNews: lead.latestInternationalNews || { title: 'No international news found', url: 'N/A' },
      verificationStatus: 'unverified'
    }));
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
    throw new Error("The AI provided an invalid data format. Please try again.");
  }
};

export const verifyLeadDetails = async (lead: Lead): Promise<Partial<Lead>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  const prompt = `Deep-verify ${lead.companyName}. Hunt for a better direct phone number than ${lead.phone}. Verify employment for: ${lead.contacts.map(c => c.contactName).join(', ')}. Return JSON.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }], thinkingConfig: { thinkingBudget: 24000 } },
  });
  return JSON.parse(response.text);
};

export const generateCompetitorAnalysis = async (lead: Lead): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Detailed battle card for ${lead.companyName} vs ${lead.competitors.join(', ')}.`,
    config: { tools: [{ googleSearch: {} }], thinkingConfig: { thinkingBudget: 12000 } },
  });
  return response.text;
};

export const generateTalkingPoints = async (contact: Contact, companyName: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `4 hyper-personalized talking points for ${contact.contactName} at ${companyName}. Return JSON array.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  const match = response.text.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) : [];
};

export const generateMarketReport = async (industry: string, region: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Strategic expansion report for ${industry} in ${region}.`,
    config: { tools: [{ googleSearch: {} }], thinkingConfig: { thinkingBudget: 24000 } },
  });
  return response.text;
};
