import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_DIR = path.join(__dirname, '../src/csvs');
const OUTPUT_PATH = path.join(__dirname, '../src/data/employerData.json');

const files = [
  'Employer Information2020.csv',
  'Employer Information2021.csv',
  'Employer Information2022.csv',
  'Employer Information2023.csv',
  'Employer Information2024.csv',
  'Employer Information2025.csv'
];

console.log('Processing employer CSV files...');

const employerMap = new Map();

function parseNumber(value) {
  if (!value || value === '' || value === 'NULL') return 0;
  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : num;
}

function readCSV(filePath) {
  const content = fs.readFileSync(filePath);
  let utf8Content;
  
  // Check for UTF-16 BOM
  if (content[0] === 0xFF && content[1] === 0xFE) {
    utf8Content = content.slice(2).toString('utf16le');
  } else {
    utf8Content = content.toString('utf8');
  }
  
  return parse(utf8Content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t',
    trim: true
  });
}

function processFile(filePath, year) {
  const records = readCSV(filePath);
  console.log(`  ${year}: ${records.length} rows`);
  
  for (const row of records) {
    const employerName = row['Employer (Petitioner) Name']?.trim();
    if (!employerName) continue;

    const approvals = 
      parseNumber(row['New Employment Approval']) +
      parseNumber(row['Continuation Approval']) +
      parseNumber(row['Change with Same Employer Approval']) +
      parseNumber(row['New Concurrent Approval']) +
      parseNumber(row['Change of Employer Approval']) +
      parseNumber(row['Amended Approval']);

    const denials = 
      parseNumber(row['New Employment Denial']) +
      parseNumber(row['Continuation Denial']) +
      parseNumber(row['Change with Same Employer Denial']) +
      parseNumber(row['New Concurrent Denial']) +
      parseNumber(row['Change of Employer Denial']) +
      parseNumber(row['Amended Denial']);

    const city = row['Petitioner City']?.trim() || '';
    const state = row['Petitioner State']?.trim() || '';
    const zipCode = row['Petitioner Zip Code']?.trim() || '';
    const industry = row['Industry (NAICS) Code']?.trim() || '';

    if (!employerMap.has(employerName)) {
      employerMap.set(employerName, {
        name: employerName,
        city,
        state,
        zipCode,
        industry,
        yearlyData: {}
      });
    }

    const employer = employerMap.get(employerName);
    
    if (!employer.yearlyData[year]) {
      employer.yearlyData[year] = { approvals: 0, denials: 0 };
    }
    
    employer.yearlyData[year].approvals += approvals;
    employer.yearlyData[year].denials += denials;
  }
}

function processAllFiles() {
  for (const file of files) {
    const filePath = path.join(CSV_DIR, file);
    const year = parseInt(file.match(/\d{4}/)[0], 10);
    processFile(filePath, year);
  }
  
  console.log(`\nTotal unique employers: ${employerMap.size}`);
  
  const employers = [];
  
  for (const [, data] of employerMap) {
    let totalApprovals = 0;
    let totalDenials = 0;
    const yearlyHistory = [];
    
    const years = Object.keys(data.yearlyData).sort();
    for (const year of years) {
      const yearData = data.yearlyData[year];
      totalApprovals += yearData.approvals;
      totalDenials += yearData.denials;
      
      const total = yearData.approvals + yearData.denials;
      const denialRate = total > 0 ? (yearData.denials / total) * 100 : 0;
      
      yearlyHistory.push({
        year: parseInt(year),
        approvals: yearData.approvals,
        denials: yearData.denials,
        denialRate: Math.round(denialRate * 10) / 10
      });
    }
    
    const grandTotal = totalApprovals + totalDenials;
    const overallDenialRate = grandTotal > 0 ? (totalDenials / grandTotal) * 100 : 0;
    
    if (grandTotal > 0) {
      employers.push({
        name: data.name,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        industry: data.industry,
        totalApprovals,
        totalDenials,
        totalCases: grandTotal,
        approvalRate: Math.round(((totalApprovals / grandTotal) * 100) * 10) / 10,
        denialRate: Math.round(overallDenialRate * 10) / 10,
        yearlyHistory
      });
    }
  }
  
  employers.sort((a, b) => b.totalCases - a.totalCases);
  
  const searchIndex = {};
  employers.forEach((emp, idx) => {
    const lowerName = emp.name.toLowerCase();
    searchIndex[lowerName] = idx;
    
    const words = lowerName.split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      if (!searchIndex[word]) searchIndex[word] = [];
      if (Array.isArray(searchIndex[word]) && !searchIndex[word].includes(idx)) {
        searchIndex[word].push(idx);
      }
    }
    
    if (emp.state) {
      const stateKey = emp.state.toLowerCase();
      if (!searchIndex[stateKey]) searchIndex[stateKey] = [];
      if (Array.isArray(searchIndex[stateKey]) && !searchIndex[stateKey].includes(idx)) {
        searchIndex[stateKey].push(idx);
      }
    }
  });
  
  const output = {
    employers,
    searchIndex,
    metadata: {
      totalEmployers: employers.length,
      includedEmployers: employers.length,
      yearRange: '2020-2025',
      lastUpdated: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));
  console.log(`\nWritten ${output.employers.length} employers to employerData.json`);
  console.log(`Top employers:`);
  employers.slice(0, 5).forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.name} - ${e.totalCases} cases (${e.approvalRate}% approval)`);
  });
}

processAllFiles();
