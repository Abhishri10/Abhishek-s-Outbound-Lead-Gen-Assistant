
import { GoogleGenAI } from "@google/genai";
import { SearchFormData, Lead, Contact } from '../types';

const buildPrompt = (formData: SearchFormData): string => {
  const selectedRegions = Object.keys(formData.targetRegions).filter(key => formData.targetRegions[key]);
  const selectedPlatforms = Object.keys(formData.platforms).filter(key => formData.platforms[key]);
  const selectedDepartments = Object.keys(formData.targetDepartments).filter(key => formData.targetDepartments[key]);
  const departmentsListText = selectedDepartments.length > 0 ? selectedDepartments.join(', ') : 'any relevant';

  const selectedTerritories = Object.keys(formData.salesTerritory).filter(key => formData.salesTerritory[key]);
  const territoryInstruction = selectedTerritories.length > 0 && selectedTerritories.length < 4
    ? `The companies must be located in the following zones within India: ${selectedTerritories.join(', ')}.`
    : '';

  const exclusionInstruction = formData.excludedClients.trim()
    ? `**CRITICAL EXCLUSION LIST:** You MUST NOT include any of the following companies in your search results under any circumstances: ${formData.excludedClients.split('\n').map(c => c.trim()).filter(Boolean).join(', ')}.`
    : '';

  const agencyExclusionInstruction = formData.agencyNames.trim()
    ? `**AGENCY EXCLUSION:** Attempt to verify that the target companies are not current clients of the following agencies: ${formData.agencyNames.split('\n').map(c => c.trim()).filter(Boolean).join(', ')}. Prioritize leads that do not have a public relationship with these agencies.`
    : '';

  let taskDescription = '';
  const expansionRegionsText = selectedRegions.length > 0 ? `into regions including ${selectedRegions.join(', ')}` : '';
  const startupInstruction = formData.targetStartups 
    ? 'Prioritize identifying startups that have recently started exporting or are advertising in international markets.'
    : '';

  const coreTask = `that either show strong potential for international expansion OR **already have established operations in international markets** ${expansionRegionsText}. Your goal is to find companies that are prime candidates for international advertising campaigns. Therefore, prioritize companies with existing international offices, a significant international customer base, or active export activities.`;

  if (formData.clientName) {
    taskDescription = `Your primary task is a deep-dive investigation into the company "${formData.clientName}"`;
    if (formData.clientCategory) {
      taskDescription += ` in the "${formData.clientCategory}" category`;
    }
    taskDescription += `, which is based in the "${formData.targetRegion}" region.`;
    if (formData.findSimilar) {
      taskDescription += ` In addition to this, identify up to 5 other Indian companies that are similar to "${formData.clientName}" in business model and category, from the "${formData.targetRegion}" region, ${coreTask} ${startupInstruction} ${territoryInstruction}`;
    }
  } else if (formData.clientCategory) {
    taskDescription = `Your primary task is to identify up to 5 Indian companies in the "${formData.clientCategory}" category, based in the "${formData.targetRegion}" region, ${coreTask} ${startupInstruction} ${territoryInstruction}`;
  }
  taskDescription += ` For all companies found, find contacts in the following departments: ${departmentsListText}.`;

  let searchMethods = '#### B. Search Methods\n**Search Methods:**\n';
  const searchRegionsText = selectedRegions.length > 0 ? `in the ${selectedRegions.join(', ')} regions` : 'internationally';

  if (formData.searchWeb) {
    searchMethods += `- In-depth Web Search: Conduct a thorough investigation. Look for official websites listing international offices or contact numbers. Search for press releases announcing market entry, partnerships with foreign companies, case studies featuring international clients, or participation in overseas industry events. This is more than a simple news search; it's a deep dive into the company's global footprint.\n`;
  }
  if (formData.searchLinkedIn) {
    searchMethods += `- LinkedIn: Scan for companies posting jobs in International markets, content targeted at an international audience, or having a significant number of employees located ${searchRegionsText}.\n`;
  }
  if (formData.searchSocialMedia) {
    searchMethods += `- Social Media Search: Scan latest posts from platforms like Facebook, X, and Instagram for recent news, product offers, or marketing campaigns that suggest an interest or readiness for international advertising.\n`;
  }
  
  const platformInstruction = selectedPlatforms.length > 0 
    ? `- platformPresence: An array of strings indicating which of the following platforms the company has a notable presence on: ${selectedPlatforms.join(', ')}. Check for significant advertising, news coverage, or official channels. If no presence on any of the specified platforms, return an empty array.`
    : `- platformPresence: Return an empty array.`;


  const emailInstruction = formData.generateEmail
    ? `- outreachSequence: An array of 3 email objects for an outreach sequence, ready to be stringified. Each object in the array MUST contain these keys: 'step' (a number, 1, 2, or 3), 'subject' (a string), and 'body' (a string). Step 1 is the initial outreach using the 'outreachSuggestion' and 'justification'. Step 2 is a polite, short follow-up assuming no reply after 3 days. Step 3 is a final, value-add follow-up after 7 days, perhaps linking to a relevant article or case study. The emails should be addressed to the primary contact you've identified.`
    : `- outreachSequence: This field must be EXCLUDED from the response. Do not generate it.`;

  return `
#### A. Task Description
${taskDescription}

${exclusionInstruction}

${agencyExclusionInstruction}

${searchMethods}
#### C. Data Gathering & Verification Rules
**Data Gathering Rules:**
**For each identified company:**
1.  **Company Info & Deep-Dive Analysis:**
    - companyName: Official name.
    - companyLinkedIn: Full LinkedIn URL.
    - category: Company's industry.
    - email: MANDATORY. Find a public contact email (e.g., contact@, info@, sales@) from the company's official website. If absolutely none can be found after a thorough search, use "N/A".
    - phone: MANDATORY. Find a public phone number from the company's official website. If absolutely none can be found after a thorough search, use "N/A".
    - justification: A brief, detailed reason why this company is a strong lead for international advertising. **Crucially, cite specific evidence of their existing international presence or concrete expansion plans** (e.g., "Opened a UK office in Q4 2023," "Lists major US clients on their website," "Actively hiring for a sales team in Germany").
    - leadScore: A numerical score from 1-100 indicating the strength of the lead for international advertising. **Give a higher score (80+) to companies with established international operations**. Score companies with recent, concrete expansion plans slightly lower (60-80). Score companies with only general interest or potential lower (40-60). Base this on the recency and relevance of their expansion signals.
    - outreachSuggestion: A single, compelling sentence to use as a personalized icebreaker in an outreach email, directly referencing the 'justification'.
    - employeeCount: Estimated number of employees (e.g., "51-200").
    - latestFunding: Details of the most recent funding round (e.g., "$50M Series B - Oct 2023"). Use "N/A" if not found.
    - techStack: An array of key technologies the company uses (e.g., ["Salesforce", "AWS", "Shopify"]).
    - competitors: An array of 2-3 main competitors.
    - latestNews: An object containing the 'title' and 'url' of the most recent, relevant general news article about the company (e.g. funding, product launch). The URL must be a direct link. If none, return an object with "N/A" for both title and url.
    - latestInternationalNews: An object containing the 'title' and 'url' of the most recent news, press release, or significant public statement specifically mentioning the company's interest, plans, or activities related to the International markets. The URL must be a direct link. If no such specific news is found, return an object with "N/A" for both title and url.
    - swotAnalysis: A concise SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the company, specifically focused on their potential for international expansion. Format this as a simple string with markdown headings (e.g., "**Strengths:**\\n- ...").
    ${platformInstruction}
    ${emailInstruction}
2.  **Contacts (Find up to 5 people in the specified department):**
    - contacts: This MUST be an array of contact objects.
    - **For each contact object, include these fields:**
        - contactName: Full name of the contact.
        - designation: Their job title/designation.
        - contactLinkedIn: The verified, full LinkedIn profile URL.

    **For each potential contact, you MUST perform this verification:**
    1. Find their LinkedIn profile using a targeted search.
    2. **Verify (ALL MUST BE TRUE):**
       a. **Company:** Current company on LinkedIn EXACTLY matches the researched company.
       b. **Region:** LinkedIn location is CONSISTENT with the target region.
       c. **Role:** Job title matches one of the target departments: ${departmentsListText}.
    3. **Result:**
       - **MANDATORY:** If a contact is VERIFIED, you MUST provide their full, valid LinkedIn profile URL for the 'contactLinkedIn' field. It cannot be empty.
       - If you cannot find or verify a contact's LinkedIn profile after a thorough search, use the exact string "Not found" for the 'contactLinkedIn' value. Do not invent a URL.
       - If a contact fails the verification check at any step, DISCARD them immediately and find a different person who meets all criteria.
#### D. Output Format & Example
**Output Format:**
Your entire response MUST be a single, valid JSON array of lead objects. Do NOT include any text, explanations, or markdown before or after the array. The response must start with '[' and end with ']'. All strings must be properly JSON-escaped.
`;
};


export const generateLeadsPrompt = async (formData: SearchFormData): Promise<Lead[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  const fullPrompt = buildPrompt(formData);
  const systemInstruction = "You are a world-class lead generation expert and sales strategist. Your purpose is to identify Indian companies showing strong potential for expanding into the International market. For each company, you must perform deep analysis to score the lead's quality and provide a personalized outreach suggestion. You must follow all instructions precisely and return data ONLY in the specified JSON array format.";

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text;
    let jsonString = text.trim();

    const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        jsonString = match[1];
    } else {
        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }
    }
    
    jsonString = jsonString.trim();

    if (!jsonString.startsWith('[') || !jsonString.endsWith(']')) {
        console.error("Could not find a valid JSON array in the response:", text);
        throw new Error("The AI model returned data in an unexpected format. Could not find a JSON array.");
    }

    const result = JSON.parse(jsonString);
    
    if (!Array.isArray(result)) {
      throw new Error("The AI model returned data in an unexpected format.");
    }

    const ensureStringArray = (value: any): string[] => {
      if (Array.isArray(value)) return value.filter(item => typeof item === 'string');
      if (typeof value === 'string' && value.length > 0) return value.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    };
    
    const sanitizedLeads = result.map((lead: any): Lead => ({
      companyName: lead.companyName || 'N/A',
      category: lead.category || 'N/A',
      companyLinkedIn: lead.companyLinkedIn || 'N/A',
      justification: lead.justification || 'N/A',
      email: lead.email || 'N/A',
      phone: lead.phone || 'N/A',
      leadScore: typeof lead.leadScore === 'number' ? lead.leadScore : 0,
      outreachSuggestion: lead.outreachSuggestion || 'N/A',
      employeeCount: lead.employeeCount || 'N/A',
      latestFunding: lead.latestFunding || 'N/A',
      outreachSequence: Array.isArray(lead.outreachSequence) ? lead.outreachSequence.filter((s: any) => s && typeof s.step === 'number' && s.subject && s.body) : undefined,
      competitorAnalysis: undefined,
      swotAnalysis: lead.swotAnalysis || undefined,
      techStack: ensureStringArray(lead.techStack),
      competitors: ensureStringArray(lead.competitors),
      platformPresence: ensureStringArray(lead.platformPresence),
      contacts: Array.isArray(lead.contacts) ? lead.contacts.map((c: any) => ({...c, talkingPoints: undefined})) : [],
      latestNews: (lead.latestNews && typeof lead.latestNews.url === 'string') ? lead.latestNews : { title: 'N/A', url: 'N/A' },
      latestInternationalNews: (lead.latestInternationalNews && typeof lead.latestInternationalNews.url === 'string') ? lead.latestInternationalNews : { title: 'N/A', url: 'N/A' },
    }));

    return sanitizedLeads;
    
  } catch (error) {
    console.error("Error processing Gemini API response:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the response from the AI model. It may have returned invalid JSON.");
    }
    throw new Error("Failed to generate leads. The AI model may have returned an invalid or unexpected response.");
  }
};

export const generateCompetitorAnalysis = async (lead: Lead): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  const prompt = `Create a deep, strategic competitive analysis "battle card" for "${lead.companyName}". 
  Compare it against its main competitors: ${lead.competitors.join(', ')}.
  
  Think step-by-step about the market dynamics, international expansion hurdles, and how each company positions itself.
  
  For each competitor, and for "${lead.companyName}", provide:
  1.  **Unique Selling Proposition (USP):** Core differentiator.
  2.  **Weakness & Vulnerability:** Specific gaps in their current international strategy or product offering.
  3.  **The "Kill" Shot (Winning Strategy):** Exactly how an outbound campaign should position "${lead.companyName}" to win over a lead considering these rivals.
  4.  **International Readiness:** A score from 1-10 on how prepared they are for global scale.

  Structure the output in clear, professional markdown.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 12000 }
    },
  });
  return response.text;
};

export const generateTalkingPoints = async (contact: Contact, companyName: string): Promise<string[]> => {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `Generate 4 highly personalized, non-generic talking points for a sales outreach to ${contact.contactName} at ${companyName}.
  
  Use Google Search to find their recent LinkedIn posts, webinar appearances, or company press releases they were quoted in. 
  Avoid generic compliments. Focus on "Business Value Signals" (e.g., "I saw your recent talk on X, it aligns with how we solve Y").
  
  Return ONLY a valid JSON array of strings. No markdown formatting.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });
  
  try {
    const text = response.text;
    let jsonString = text.trim();
    const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) jsonString = match[1];
    else {
      const startIndex = jsonString.indexOf('[');
      const endIndex = jsonString.lastIndexOf(']');
      if (startIndex !== -1 && endIndex !== -1) jsonString = jsonString.substring(startIndex, endIndex + 1);
    }
    return JSON.parse(jsonString);
  } catch (e) {
    return response.text.split('\n').map(p => p.replace(/^- \s*/, '').trim()).filter(Boolean);
  }
};

export const generateMarketReport = async (industry: string, region: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  const prompt = `Perform a deep-dive strategic analysis for Indian "${industry}" companies looking to enter "${region}".
  
  Provide a professional Market Expansion Report including:
  1. **Macro Trends:** Current tailwinds and headwinds in ${region}.
  2. **Competitive Landscape:** Local incumbents and their strongholds.
  3. **Regulatory & Cultural Barriers:** Specific nuances for Indian exporters.
  4. **Go-To-Market (GTM) Recommendation:** 3 concrete steps for an Indian company to succeed in the first 6 months.
  
  Structure in beautiful Markdown. Use data-backed insights from Google Search.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 24000 }
    },
  });

  return response.text;
};
