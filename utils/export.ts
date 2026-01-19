import { Lead } from '../types';

const flattenLead = (lead: Lead) => {
  const flattened: { [key: string]: any } = {
    companyName: lead.companyName,
    category: lead.category,
    leadScore: lead.leadScore,
    companyLinkedIn: lead.companyLinkedIn,
    email: lead.email,
    phone: lead.phone,
    justification: lead.justification,
    outreachSuggestion: lead.outreachSuggestion,
    employeeCount: lead.employeeCount,
    latestFunding: lead.latestFunding,
    techStack: lead.techStack.join(', '),
    competitors: lead.competitors.join(', '),
    platformPresence: (lead.platformPresence || []).join(', '),
  };

  if (lead.outreachSequence) {
    lead.outreachSequence.forEach((step, i) => {
      flattened[`Outreach_Step_${i + 1}_Subject`] = step.subject;
      flattened[`Outreach_Step_${i + 1}_Body`] = step.body;
    });
  }

  lead.contacts.slice(0, 5).forEach((c, i) => {
    flattened[`contact${i + 1}Name`] = c.contactName;
    flattened[`contact${i + 1}Designation`] = c.designation;
    flattened[`contact${i + 1}LinkedIn`] = c.contactLinkedIn;
  });

  return flattened;
};

const escapeCSV = (value: any): string => {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getHeaders = (flatLeads: { [key: string]: any }[]): string[] => {
  const headerSet = new Set<string>();
  flatLeads.forEach(lead => {
    Object.keys(lead).forEach(key => headerSet.add(key));
  });

  const orderedCore = [
    'companyName', 'category', 'leadScore', 'companyLinkedIn', 'email', 'phone', 'justification',
    'outreachSuggestion', 'employeeCount', 'latestFunding', 'techStack', 'competitors', 'platformPresence'
  ];

  const outreachHeaders = Array.from(headerSet).filter(h => h.startsWith('Outreach')).sort();
  const contactHeaders = Array.from(headerSet).filter(h => h.startsWith('contact')).sort();

  return [...orderedCore, ...outreachHeaders, ...contactHeaders];
};


export const exportToCSV = (leads: Lead[]) => {
  if (leads.length === 0) return;
  const flatLeads = leads.map(flattenLead);
  const headers = getHeaders(flatLeads);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...flatLeads.map(row => headers.map(header => escapeCSV(row[header as keyof typeof row])).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'leads.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = (leads: Lead[]) => {
  if (leads.length === 0) return;
  const flatLeads = leads.map(flattenLead);
  const headers = getHeaders(flatLeads);
  const tsvContent = [
    headers.join('\t'),
    ...flatLeads.map(row => headers.map(header => String(row[header as keyof typeof row] ?? '').replace(/\n/g, ' ')).join('\t')),
  ].join('\n');
  navigator.clipboard.writeText(tsvContent).then(() => {
    alert('Leads copied to clipboard!');
  }, () => {
    alert('Failed to copy leads.');
  });
};

export const exportToXLSX = (leads: Lead[]) => {
    if (leads.length === 0) return;

    const createSheetXML = (sheetName: string, headers: string[], data: Record<string, any>[]) => {
        const headerRow = `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`;
        
        const dataRows = data.map(row => 
            `<Row>${headers.map(h => {
                const val = row[h];
                const type = typeof val === 'number' ? 'Number' : 'String';
                const cleanVal = String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `<Cell><Data ss:Type="${type}">${cleanVal}</Data></Cell>`;
            }).join('')}</Row>`
        ).join('');

        return `
          <Worksheet ss:Name="${sheetName}">
            <Table>
              ${headerRow}
              ${dataRows}
            </Table>
          </Worksheet>
        `;
    };

    const flatLeads = leads.map(flattenLead);
    const leadHeaders = getHeaders(flatLeads);
    const leadsSheetXML = createSheetXML("Leads", leadHeaders, flatLeads);
    
    const newsData = leads.map(lead => ({
        companyName: lead.companyName,
        latestNewsUrl: lead.latestNews.url,
        latestInternationalNewsUrl: lead.latestInternationalNews.url,
    }));
    const newsHeaders = ['companyName', 'latestNewsUrl', 'latestInternationalNewsUrl'];
    const newsSheetXML = createSheetXML("News URLs", newsHeaders, newsData);

    const template = `
        <?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
          ${leadsSheetXML}
          ${newsSheetXML}
        </Workbook>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'leads.xls');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
