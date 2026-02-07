import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPPO_PATH = path.join(__dirname, '../src/csvs/oppo.md');
const OUTPUT_PATH = path.join(__dirname, '../src/data/opportunities.json');

console.log('Parsing internship opportunities from oppo.md...');

// Read the markdown file
const content = fs.readFileSync(OPPO_PATH, 'utf8');

// Extract HTML tables from markdown
function extractTablesFromMarkdown(md) {
  const tables = [];
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
  let match;
  while ((match = tableRegex.exec(md)) !== null) {
    tables.push(match[0]);
  }
  return tables;
}

// Parse HTML table to JSON
function parseTable(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const rows = doc.querySelectorAll('tr');
  
  const data = [];
  let headers = [];
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('th, td');
    const rowData = [];
    
    cells.forEach(cell => {
      // Clean up the text and extract links
      const text = cell.textContent.trim();
      const links = Array.from(cell.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href')
      }));
      
      rowData.push({ text, links });
    });
    
    if (index === 0) {
      headers = rowData.map(d => d.text.toLowerCase());
    } else {
      const obj = {};
      headers.forEach((header, i) => {
        if (rowData[i]) {
          obj[header] = rowData[i];
        }
      });
      data.push(obj);
    }
  });
  
  return data;
}

// Extract company name and normalize it
function extractCompanyName(cell) {
  if (!cell || !cell.text) return null;
  
  // Remove emoji markers like 🔥, ↳, 🛂, etc.
  let text = cell.text
    .replace(/🔥|↳|🛂|🇺🇸|🔒|🎓/g, '')
    .trim();
  
  // Extract company name from links or text
  // Usually in format: <strong><a href="...">Company Name</a></strong>
  const strongMatch = text.match(/<strong>(.*?)<\/strong>/);
  if (strongMatch) {
    // Remove HTML tags
    const clean = strongMatch[1].replace(/<[^>]+>/g, '').trim();
    return clean;
  }
  
  // Just remove any remaining HTML
  return text.replace(/<[^>]+>/g, '').trim();
}

// Normalize company name for matching
function normalizeCompanyName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Extract apply and simplify links
function extractLinks(cell) {
  if (!cell || !cell.links) return { apply: null, simplify: null };
  
  const apply = cell.links.find(l => l.href && !l.href.includes('simplify.jobs'));
  const simplify = cell.links.find(l => l.href && l.href.includes('simplify.jobs'));
  
  return {
    apply: apply?.href || null,
    simplify: simplify?.href || null
  };
}

// Parse all tables
const tables = extractTablesFromMarkdown(content);
console.log(`Found ${tables.length} tables`);

const allOpportunities = [];

for (const tableHtml of tables) {
  const data = parseTable(tableHtml);
  
  for (const row of data) {
    const companyCell = row['company'] || row['company'];
    const roleCell = row['role'] || row['role'];
    const locationCell = row['location'] || row['location'];
    const applicationCell = row['application'] || row['application'];
    const ageCell = row['age'] || row['age'];
    
    const companyName = extractCompanyName(companyCell);
    if (!companyName || companyName === '↳') continue; // Skip sub-listings for now
    
    const links = extractLinks(applicationCell);
    
    if (links.apply || links.simplify) {
      allOpportunities.push({
        company: companyName,
        normalizedCompany: normalizeCompanyName(companyName),
        role: roleCell?.text?.replace(/<[^>]+>/g, '').trim() || '',
        location: locationCell?.text?.replace(/<[^>]+>/g, '').trim() || '',
        applyUrl: links.apply,
        simplifyUrl: links.simplify,
        posted: ageCell?.text?.trim() || '',
        isSubListing: companyName === '↳'
      });
    }
  }
}

console.log(`Extracted ${allOpportunities.length} opportunities`);

// Group by normalized company name
const byCompany = {};
for (const opp of allOpportunities) {
  if (!byCompany[opp.normalizedCompany]) {
    byCompany[opp.normalizedCompany] = [];
  }
  byCompany[opp.normalizedCompany].push(opp);
}

console.log(`Grouped into ${Object.keys(byCompany).length} unique companies`);

const output = {
  opportunities: allOpportunities,
  byCompany,
  metadata: {
    totalOpportunities: allOpportunities.length,
    uniqueCompanies: Object.keys(byCompany).length,
    lastUpdated: new Date().toISOString()
  }
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
console.log(`Written to opportunities.json`);

// Show sample
const companies = Object.keys(byCompany).slice(0, 10);
console.log('\nSample companies with opportunities:');
companies.forEach(c => {
  console.log(`  ${c}: ${byCompany[c].length} listings`);
});
