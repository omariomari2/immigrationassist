import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMPLOYER_DATA_PATH = path.join(__dirname, '../src/data/employerData.json');
const OPPORTUNITIES_PATH = path.join(__dirname, '../src/data/opportunities.json');

console.log('Matching opportunities to H1B employers...');

// Load data
const employerData = JSON.parse(fs.readFileSync(EMPLOYER_DATA_PATH, 'utf8'));
const opportunitiesData = JSON.parse(fs.readFileSync(OPPORTUNITIES_PATH, 'utf8'));

// Normalize function (must match the one in parseOpportunities.js)
function normalizeCompanyName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Build lookup map for employers
const employerMap = new Map();
employerData.employers.forEach((emp, idx) => {
  const normalized = normalizeCompanyName(emp.name);
  employerMap.set(normalized, idx);
  
  // Also add variations
  const variations = [
    normalized.replace(/international/g, ''),
    normalized.replace(/technologies/g, 'tech'),
    normalized.replace(/services/g, ''),
    normalized.replace(/solutions/g, ''),
    normalized.replace(/group/g, ''),
    normalized.replace(/holdings/g, ''),
    normalized.replace(/global/g, '')
  ];
  
  variations.forEach(v => {
    if (v !== normalized && v.length > 3) {
      employerMap.set(v, idx);
    }
  });
});

// Match opportunities to employers
let matchedCount = 0;
const opportunitiesByEmployer = {};

for (const [normalizedName, opportunities] of Object.entries(opportunitiesData.byCompany)) {
  const employerIdx = employerMap.get(normalizedName);
  
  if (employerIdx !== undefined) {
    const employer = employerData.employers[employerIdx];
    if (!opportunitiesByEmployer[employer.name]) {
      opportunitiesByEmployer[employer.name] = [];
    }
    opportunitiesByEmployer[employer.name].push(...opportunities);
    matchedCount += opportunities.length;
  } else {
    // Try fuzzy matching for close names
    for (const [empNormalized, idx] of employerMap.entries()) {
      if (empNormalized.includes(normalizedName) || normalizedName.includes(empNormalized)) {
        const employer = employerData.employers[idx];
        if (!opportunitiesByEmployer[employer.name]) {
          opportunitiesByEmployer[employer.name] = [];
        }
        opportunitiesByEmployer[employer.name].push(...opportunities);
        matchedCount += opportunities.length;
        break;
      }
    }
  }
}

// Add opportunities to each employer
employerData.employers = employerData.employers.map(emp => {
  const opps = opportunitiesByEmployer[emp.name] || [];
  return {
    ...emp,
    opportunities: opps,
    opportunityCount: opps.length
  };
});

// Update metadata
employerData.metadata.opportunitiesMatched = matchedCount;
employerData.metadata.employersWithOpportunities = Object.keys(opportunitiesByEmployer).length;

// Save updated data
fs.writeFileSync(EMPLOYER_DATA_PATH, JSON.stringify(employerData, null, 2));

console.log(`\nMatching complete!`);
console.log(`  Total opportunities: ${opportunitiesData.metadata.totalOpportunities}`);
console.log(`  Matched to H1B employers: ${matchedCount}`);
console.log(`  Employers with opportunities: ${Object.keys(opportunitiesByEmployer).length}`);

// Show top employers by opportunity count
const topEmployers = Object.entries(opportunitiesByEmployer)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

console.log('\nTop employers by opportunity count:');
topEmployers.forEach(([name, opps]) => {
  console.log(`  ${name}: ${opps.length} listings`);
});
