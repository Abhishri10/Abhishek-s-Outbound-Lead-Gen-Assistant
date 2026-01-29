
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
    latestFunding: lead.latestFunding,
    competitors: lead.competitors.join(', '),
    platformPresence: (lead.platformPresence || []).join(', '),
  };

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

export const exportToCSV = (leads: Lead[]) => {
  if (leads.length === 0) return;
  const flatLeads = leads.map(flattenLead);
  const headers = Object.keys(flatLeads[0]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...flatLeads.map(row => headers.map(header => escapeCSV(row[header])).join(',')),
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
  const headers = Object.keys(flatLeads[0]);
  const tsvContent = [
    headers.join('\t'),
    ...flatLeads.map(row => headers.map(header => String(row[header] ?? '').replace(/\n/g, ' ')).join('\t')),
  ].join('\n');
  navigator.clipboard.writeText(tsvContent);
};

export const exportToXLSX = (leads: Lead[]) => {
    if (leads.length === 0) return;
    const flatLeads = leads.map(flattenLead);
    const headers = Object.keys(flatLeads[0]);
    
    const rowContent = flatLeads.map(row => 
        `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${String(row[h]).replace(/&/g, '&amp;')}</Data></Cell>`).join('')}</Row>`
    ).join('');

    const template = `
        <?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
          <Worksheet ss:Name="Leads">
            <Table>
              <Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>
              ${rowContent}
            </Table>
          </Worksheet>
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
