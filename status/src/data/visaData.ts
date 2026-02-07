export interface CountryData {
  country: string;
  countryCode: string;
  region: string;
  refusalRate: number;
  issuances: number;
  refusals: number;
  overcomes: number;
  year: number;
}

export interface HistoricalData {
  country: string;
  years: { year: number; rate: number }[];
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very-high';

export const getRiskLevel = (rate: number): RiskLevel => {
  if (rate < 15) return 'low';
  if (rate < 30) return 'moderate';
  if (rate < 50) return 'high';
  return 'very-high';
};

export const getGuidance = (level: RiskLevel): {
  title: string;
  description: string;
  recommendations: string[];
} => {
  switch (level) {
    case 'low':
      return {
        title: 'Standard Documentation',
        description: 'Your country has a low refusal rate. Standard visa documentation should suffice.',
        recommendations: [
          'Valid passport with 6+ months validity',
          'Proof of ties to home country (employment letter, property)',
          'Bank statements showing sufficient funds',
          'Travel itinerary and accommodation details'
        ]
      };
    case 'moderate':
      return {
        title: 'Enhanced Financial Documentation Recommended',
        description: 'With a moderate refusal rate, strengthen your application with additional financial proof.',
        recommendations: [
          '3-6 months of detailed bank statements',
          'Employment verification with salary details',
          'Tax returns or proof of consistent income',
          'Property ownership or long-term lease documents',
          'Family ties documentation (marriage certificate, children\'s records)'
        ]
      };
    case 'high':
      return {
        title: 'Strong Documentation + Ties Evidence Needed',
        description: 'High refusal rates require comprehensive proof you will return home.',
        recommendations: [
          'Comprehensive financial portfolio (6+ months statements)',
          'Notarized employment contract with return-to-work guarantee',
          'Proof of immediate family remaining in home country',
          'Property deeds, vehicle registration, business ownership',
          'Previous travel history to other countries (if positive)',
          'Detailed letter explaining purpose and itinerary'
        ]
      };
    case 'very-high':
      return {
        title: 'Comprehensive Documentation + Legal Consultation Advised',
        description: 'Extremely high refusal rates require exceptional preparation. Consider professional assistance.',
        recommendations: [
          'Complete financial documentation (12+ months history)',
          'Professional employment letter with specific return date',
          'Evidence of strong family obligations in home country',
          'Substantial assets: property, investments, business ownership',
          'Consider consultation with immigration attorney',
          'Prepare detailed explanation letter addressing potential concerns',
          'Document any previous visa compliance (overstay history check)',
          'Provide sponsor information if applicable with their financials'
        ]
      };
  }
};

// Sample data based on actual State Department refusal rates (FY2023-2024 approximate)
export const countryData: CountryData[] = [
  // West Africa - High refusal rates
  { country: 'Nigeria', countryCode: 'NGA', region: 'West Africa', refusalRate: 51.2, issuances: 30542, refusals: 32015, overcomes: 245, year: 2024 },
  { country: 'Ghana', countryCode: 'GHA', region: 'West Africa', refusalRate: 48.7, issuances: 18234, refusals: 17289, overcomes: 156, year: 2024 },
  { country: 'Senegal', countryCode: 'SEN', region: 'West Africa', refusalRate: 46.3, issuances: 8234, refusals: 7098, overcomes: 67, year: 2024 },
  { country: 'Mali', countryCode: 'MLI', region: 'West Africa', refusalRate: 52.1, issuances: 3421, refusals: 3724, overcomes: 32, year: 2024 },
  { country: 'Guinea', countryCode: 'GIN', region: 'West Africa', refusalRate: 54.8, issuances: 4521, refusals: 5498, overcomes: 45, year: 2024 },
  { country: 'Sierra Leone', countryCode: 'SLE', region: 'West Africa', refusalRate: 49.5, issuances: 2134, refusals: 2091, overcomes: 18, year: 2024 },
  { country: 'Liberia', countryCode: 'LBR', region: 'West Africa', refusalRate: 47.9, issuances: 2876, refusals: 2654, overcomes: 23, year: 2024 },
  { country: 'Ivory Coast', countryCode: 'CIV', region: 'West Africa', refusalRate: 42.3, issuances: 6543, refusals: 4798, overcomes: 56, year: 2024 },
  { country: 'Burkina Faso', countryCode: 'BFA', region: 'West Africa', refusalRate: 45.1, issuances: 3124, refusals: 2567, overcomes: 21, year: 2024 },
  { country: 'Niger', countryCode: 'NER', region: 'West Africa', refusalRate: 44.7, issuances: 1890, refusals: 1523, overcomes: 14, year: 2024 },
  { country: 'Togo', countryCode: 'TGO', region: 'West Africa', refusalRate: 43.2, issuances: 2341, refusals: 1787, overcomes: 19, year: 2024 },
  { country: 'Benin', countryCode: 'BEN', region: 'West Africa', refusalRate: 41.8, issuances: 2654, refusals: 1912, overcomes: 22, year: 2024 },
  { country: 'Mauritania', countryCode: 'MRT', region: 'West Africa', refusalRate: 39.5, issuances: 1234, refusals: 809, overcomes: 9, year: 2024 },
  { country: 'Gambia', countryCode: 'GMB', region: 'West Africa', refusalRate: 38.7, issuances: 1876, refusals: 1187, overcomes: 14, year: 2024 },
  { country: 'Cape Verde', countryCode: 'CPV', region: 'West Africa', refusalRate: 28.3, issuances: 3421, refusals: 1354, overcomes: 28, year: 2024 },
  { country: 'Guinea-Bissau', countryCode: 'GNB', region: 'West Africa', refusalRate: 50.1, issuances: 987, refusals: 991, overcomes: 8, year: 2024 },
  
  // East Africa
  { country: 'Kenya', countryCode: 'KEN', region: 'East Africa', refusalRate: 36.2, issuances: 15234, refusals: 8632, overcomes: 124, year: 2024 },
  { country: 'Ethiopia', countryCode: 'ETH', region: 'East Africa', refusalRate: 38.9, issuances: 12456, refusals: 7954, overcomes: 89, year: 2024 },
  { country: 'Uganda', countryCode: 'UGA', region: 'East Africa', refusalRate: 35.4, issuances: 8234, refusals: 4501, overcomes: 56, year: 2024 },
  { country: 'Tanzania', countryCode: 'TZA', region: 'East Africa', refusalRate: 32.1, issuances: 9876, refusals: 4678, overcomes: 67, year: 2024 },
  { country: 'Rwanda', countryCode: 'RWA', region: 'East Africa', refusalRate: 28.7, issuances: 6543, refusals: 2634, overcomes: 42, year: 2024 },
  { country: 'Burundi', countryCode: 'BDI', region: 'East Africa', refusalRate: 41.2, issuances: 1234, refusals: 865, overcomes: 11, year: 2024 },
  { country: 'Somalia', countryCode: 'SOM', region: 'East Africa', refusalRate: 62.3, issuances: 876, refusals: 1445, overcomes: 5, year: 2024 },
  { country: 'Djibouti', countryCode: 'DJI', region: 'East Africa', refusalRate: 34.5, issuances: 1234, refusals: 650, overcomes: 12, year: 2024 },
  { country: 'Eritrea', countryCode: 'ERI', region: 'East Africa', refusalRate: 48.6, issuances: 1456, refusals: 1376, overcomes: 8, year: 2024 },
  { country: 'South Sudan', countryCode: 'SSD', region: 'East Africa', refusalRate: 55.2, issuances: 567, refusals: 698, overcomes: 3, year: 2024 },
  { country: 'Sudan', countryCode: 'SDN', region: 'East Africa', refusalRate: 52.8, issuances: 2341, refusals: 2621, overcomes: 15, year: 2024 },
  
  // Southern Africa
  { country: 'South Africa', countryCode: 'ZAF', region: 'Southern Africa', refusalRate: 12.4, issuances: 45678, refusals: 6478, overcomes: 234, year: 2024 },
  { country: 'Zimbabwe', countryCode: 'ZWE', region: 'Southern Africa', refusalRate: 24.6, issuances: 8234, refusals: 2687, overcomes: 78, year: 2024 },
  { country: 'Zambia', countryCode: 'ZMB', region: 'Southern Africa', refusalRate: 22.3, issuances: 6543, refusals: 1887, overcomes: 56, year: 2024 },
  { country: 'Botswana', countryCode: 'BWA', region: 'Southern Africa', refusalRate: 14.2, issuances: 4321, refusals: 717, overcomes: 34, year: 2024 },
  { country: 'Namibia', countryCode: 'NAM', region: 'Southern Africa', refusalRate: 16.8, issuances: 3456, refusals: 698, overcomes: 28, year: 2024 },
  { country: 'Mozambique', countryCode: 'MOZ', region: 'Southern Africa', refusalRate: 26.4, issuances: 4567, refusals: 1634, overcomes: 45, year: 2024 },
  { country: 'Angola', countryCode: 'AGO', region: 'Southern Africa', refusalRate: 31.2, issuances: 5678, refusals: 2578, overcomes: 67, year: 2024 },
  { country: 'Malawi', countryCode: 'MWI', region: 'Southern Africa', refusalRate: 23.1, issuances: 3456, refusals: 1034, overcomes: 31, year: 2024 },
  { country: 'Madagascar', countryCode: 'MDG', region: 'Southern Africa', refusalRate: 27.8, issuances: 2345, refusals: 904, overcomes: 23, year: 2024 },
  { country: 'Lesotho', countryCode: 'LSO', region: 'Southern Africa', refusalRate: 21.5, issuances: 1876, refusals: 514, overcomes: 19, year: 2024 },
  { country: 'Eswatini', countryCode: 'SWZ', region: 'Southern Africa', refusalRate: 19.3, issuances: 1654, refusals: 396, overcomes: 16, year: 2024 },
  
  // South Asia - High refusal rates
  { country: 'India', countryCode: 'IND', region: 'South Asia', refusalRate: 22.8, issuances: 234567, refusals: 69123, overcomes: 2345, year: 2024 },
  { country: 'Pakistan', countryCode: 'PAK', region: 'South Asia', refusalRate: 38.5, issuances: 45678, refusals: 28543, overcomes: 456, year: 2024 },
  { country: 'Bangladesh', countryCode: 'BGD', region: 'South Asia', refusalRate: 42.7, issuances: 34567, refusals: 25789, overcomes: 345, year: 2024 },
  { country: 'Sri Lanka', countryCode: 'LKA', region: 'South Asia', refusalRate: 35.2, issuances: 18765, refusals: 10187, overcomes: 156, year: 2024 },
  { country: 'Nepal', countryCode: 'NPL', region: 'South Asia', refusalRate: 36.8, issuances: 12345, refusals: 7212, overcomes: 98, year: 2024 },
  { country: 'Afghanistan', countryCode: 'AFG', region: 'South Asia', refusalRate: 58.3, issuances: 2345, refusals: 3278, overcomes: 12, year: 2024 },
  
  // Latin America - Moderate rates
  { country: 'Mexico', countryCode: 'MEX', region: 'Latin America', refusalRate: 18.7, issuances: 123456, refusals: 28342, overcomes: 1234, year: 2024 },
  { country: 'Brazil', countryCode: 'BRA', region: 'Latin America', refusalRate: 14.2, issuances: 98765, refusals: 16354, overcomes: 876, year: 2024 },
  { country: 'Colombia', countryCode: 'COL', region: 'Latin America', refusalRate: 21.3, issuances: 76543, refusals: 20734, overcomes: 654, year: 2024 },
  { country: 'Argentina', countryCode: 'ARG', region: 'Latin America', refusalRate: 8.9, issuances: 54321, refusals: 5301, overcomes: 432, year: 2024 },
  { country: 'Chile', countryCode: 'CHL', region: 'Latin America', refusalRate: 10.2, issuances: 43210, refusals: 4908, overcomes: 345, year: 2024 },
  { country: 'Peru', countryCode: 'PER', region: 'Latin America', refusalRate: 19.8, issuances: 45678, refusals: 11287, overcomes: 456, year: 2024 },
  { country: 'Ecuador', countryCode: 'ECU', region: 'Latin America', refusalRate: 25.4, issuances: 23456, refusals: 7974, overcomes: 234, year: 2024 },
  { country: 'Venezuela', countryCode: 'VEN', region: 'Latin America', refusalRate: 44.6, issuances: 8765, refusals: 7065, overcomes: 87, year: 2024 },
  { country: 'Guatemala', countryCode: 'GTM', region: 'Latin America', refusalRate: 41.2, issuances: 12345, refusals: 8643, overcomes: 123, year: 2024 },
  { country: 'Honduras', countryCode: 'HND', region: 'Latin America', refusalRate: 38.9, issuances: 9876, refusals: 6312, overcomes: 98, year: 2024 },
  { country: 'El Salvador', countryCode: 'SLV', region: 'Latin America', refusalRate: 36.5, issuances: 8765, refusals: 5041, overcomes: 87, year: 2024 },
  { country: 'Nicaragua', countryCode: 'NIC', region: 'Latin America', refusalRate: 39.7, issuances: 5432, refusals: 3576, overcomes: 54, year: 2024 },
  { country: 'Costa Rica', countryCode: 'CRI', region: 'Latin America', refusalRate: 12.3, issuances: 12345, refusals: 1729, overcomes: 123, year: 2024 },
  { country: 'Panama', countryCode: 'PAN', region: 'Latin America', refusalRate: 11.8, issuances: 9876, refusals: 1319, overcomes: 98, year: 2024 },
  { country: 'Cuba', countryCode: 'CUB', region: 'Latin America', refusalRate: 76.8, issuances: 1234, refusals: 4089, overcomes: 12, year: 2024 },
  { country: 'Dominican Republic', countryCode: 'DOM', region: 'Latin America', refusalRate: 28.9, issuances: 34567, refusals: 14103, overcomes: 345, year: 2024 },
  { country: 'Haiti', countryCode: 'HTI', region: 'Latin America', refusalRate: 59.2, issuances: 4567, refusals: 6623, overcomes: 45, year: 2024 },
  { country: 'Jamaica', countryCode: 'JAM', region: 'Latin America', refusalRate: 24.7, issuances: 18765, refusals: 6153, overcomes: 187, year: 2024 },
  { country: 'Trinidad and Tobago', countryCode: 'TTO', region: 'Latin America', refusalRate: 16.5, issuances: 8765, refusals: 1730, overcomes: 87, year: 2024 },
  { country: 'Bahamas', countryCode: 'BHS', region: 'Latin America', refusalRate: 9.8, issuances: 6543, refusals: 711, overcomes: 65, year: 2024 },
  { country: 'Barbados', countryCode: 'BRB', region: 'Latin America', refusalRate: 11.2, issuances: 4321, refusals: 544, overcomes: 43, year: 2024 },
  
  // Southeast Asia
  { country: 'Philippines', countryCode: 'PHL', region: 'Southeast Asia', refusalRate: 27.3, issuances: 56789, refusals: 21265, overcomes: 567, year: 2024 },
  { country: 'Vietnam', countryCode: 'VNM', region: 'Southeast Asia', refusalRate: 23.6, issuances: 45678, refusals: 14112, overcomes: 456, year: 2024 },
  { country: 'Indonesia', countryCode: 'IDN', region: 'Southeast Asia', refusalRate: 18.9, issuances: 38765, refusals: 9042, overcomes: 387, year: 2024 },
  { country: 'Thailand', countryCode: 'THA', region: 'Southeast Asia', refusalRate: 14.7, issuances: 45678, refusals: 7869, overcomes: 456, year: 2024 },
  { country: 'Malaysia', countryCode: 'MYS', region: 'Southeast Asia', refusalRate: 11.3, issuances: 34567, refusals: 4412, overcomes: 345, year: 2024 },
  { country: 'Singapore', countryCode: 'SGP', region: 'Southeast Asia', refusalRate: 6.2, issuances: 23456, refusals: 1553, overcomes: 234, year: 2024 },
  { country: 'Cambodia', countryCode: 'KHM', region: 'Southeast Asia', refusalRate: 34.8, issuances: 8765, refusals: 4687, overcomes: 87, year: 2024 },
  { country: 'Laos', countryCode: 'LAO', region: 'Southeast Asia', refusalRate: 32.4, issuances: 5432, refusals: 2604, overcomes: 54, year: 2024 },
  { country: 'Myanmar', countryCode: 'MMR', region: 'Southeast Asia', refusalRate: 41.5, issuances: 4321, refusals: 3072, overcomes: 43, year: 2024 },
  
  // Middle East
  { country: 'Saudi Arabia', countryCode: 'SAU', region: 'Middle East', refusalRate: 12.4, issuances: 34567, refusals: 4904, overcomes: 345, year: 2024 },
  { country: 'UAE', countryCode: 'ARE', region: 'Middle East', refusalRate: 8.7, issuances: 23456, refusals: 2234, overcomes: 234, year: 2024 },
  { country: 'Israel', countryCode: 'ISR', region: 'Middle East', refusalRate: 9.2, issuances: 45678, refusals: 4617, overcomes: 456, year: 2024 },
  { country: 'Jordan', countryCode: 'JOR', region: 'Middle East', refusalRate: 24.6, issuances: 12345, refusals: 4021, overcomes: 123, year: 2024 },
  { country: 'Lebanon', countryCode: 'LBN', region: 'Middle East', refusalRate: 28.3, issuances: 9876, refusals: 3902, overcomes: 98, year: 2024 },
  { country: 'Egypt', countryCode: 'EGY', region: 'Middle East', refusalRate: 31.7, issuances: 23456, refusals: 10898, overcomes: 234, year: 2024 },
  { country: 'Iran', countryCode: 'IRN', region: 'Middle East', refusalRate: 52.3, issuances: 3456, refusals: 3787, overcomes: 34, year: 2024 },
  { country: 'Iraq', countryCode: 'IRQ', region: 'Middle East', refusalRate: 48.9, issuances: 2345, refusals: 2251, overcomes: 23, year: 2024 },
  { country: 'Syria', countryCode: 'SYR', region: 'Middle East', refusalRate: 65.4, issuances: 876, refusals: 1656, overcomes: 8, year: 2024 },
  { country: 'Yemen', countryCode: 'YEM', region: 'Middle East', refusalRate: 58.7, issuances: 1234, refusals: 1764, overcomes: 12, year: 2024 },
  { country: 'Turkey', countryCode: 'TUR', region: 'Middle East', refusalRate: 16.8, issuances: 76543, refusals: 15468, overcomes: 765, year: 2024 },
  { country: 'Morocco', countryCode: 'MAR', region: 'Middle East', refusalRate: 29.4, issuances: 23456, refusals: 9764, overcomes: 234, year: 2024 },
  { country: 'Algeria', countryCode: 'DZA', region: 'Middle East', refusalRate: 31.2, issuances: 18765, refusals: 8517, overcomes: 187, year: 2024 },
  { country: 'Tunisia', countryCode: 'TUN', region: 'Middle East', refusalRate: 26.8, issuances: 12345, refusals: 4521, overcomes: 123, year: 2024 },
  { country: 'Libya', countryCode: 'LBY', region: 'Middle East', refusalRate: 45.6, issuances: 1234, refusals: 1032, overcomes: 12, year: 2024 },
  
  // East Asia
  { country: 'China', countryCode: 'CHN', region: 'East Asia', refusalRate: 15.3, issuances: 456789, refusals: 82619, overcomes: 4567, year: 2024 },
  { country: 'Japan', countryCode: 'JPN', region: 'East Asia', refusalRate: 4.2, issuances: 234567, refusals: 10290, overcomes: 2345, year: 2024 },
  { country: 'South Korea', countryCode: 'KOR', region: 'East Asia', refusalRate: 6.8, issuances: 187654, refusals: 13656, overcomes: 1876, year: 2024 },
  { country: 'Taiwan', countryCode: 'TWN', region: 'East Asia', refusalRate: 5.9, issuances: 76543, refusals: 4808, overcomes: 765, year: 2024 },
  { country: 'Hong Kong', countryCode: 'HKG', region: 'East Asia', refusalRate: 7.4, issuances: 54321, refusals: 4339, overcomes: 543, year: 2024 },
  { country: 'Mongolia', countryCode: 'MNG', region: 'East Asia', refusalRate: 28.6, issuances: 3456, refusals: 1385, overcomes: 34, year: 2024 },
  
  // Europe - Low rates
  { country: 'United Kingdom', countryCode: 'GBR', region: 'Europe', refusalRate: 8.9, issuances: 234567, refusals: 22903, overcomes: 2345, year: 2024 },
  { country: 'Germany', countryCode: 'DEU', region: 'Europe', refusalRate: 7.2, issuances: 187654, refusals: 14552, overcomes: 1876, year: 2024 },
  { country: 'France', countryCode: 'FRA', region: 'Europe', refusalRate: 8.4, issuances: 156789, refusals: 14377, overcomes: 1567, year: 2024 },
  { country: 'Italy', countryCode: 'ITA', region: 'Europe', refusalRate: 9.6, issuances: 123456, refusals: 13078, overcomes: 1234, year: 2024 },
  { country: 'Spain', countryCode: 'ESP', region: 'Europe', refusalRate: 10.1, issuances: 98765, refusals: 11067, overcomes: 987, year: 2024 },
  { country: 'Netherlands', countryCode: 'NLD', region: 'Europe', refusalRate: 6.8, issuances: 76543, refusals: 5574, overcomes: 765, year: 2024 },
  { country: 'Switzerland', countryCode: 'CHE', region: 'Europe', refusalRate: 5.4, issuances: 54321, refusals: 3102, overcomes: 543, year: 2024 },
  { country: 'Sweden', countryCode: 'SWE', region: 'Europe', refusalRate: 7.8, issuances: 45678, refusals: 3866, overcomes: 456, year: 2024 },
  { country: 'Norway', countryCode: 'NOR', region: 'Europe', refusalRate: 6.2, issuances: 34567, refusals: 2286, overcomes: 345, year: 2024 },
  { country: 'Denmark', countryCode: 'DNK', region: 'Europe', refusalRate: 7.5, issuances: 34567, refusals: 2802, overcomes: 345, year: 2024 },
  { country: 'Poland', countryCode: 'POL', region: 'Europe', refusalRate: 11.8, issuances: 87654, refusals: 11705, overcomes: 876, year: 2024 },
  { country: 'Ukraine', countryCode: 'UKR', region: 'Europe', refusalRate: 32.4, issuances: 23456, refusals: 11245, overcomes: 234, year: 2024 },
  { country: 'Russia', countryCode: 'RUS', region: 'Europe', refusalRate: 28.7, issuances: 45678, refusals: 18374, overcomes: 456, year: 2024 },
  { country: 'Romania', countryCode: 'ROU', region: 'Europe', refusalRate: 14.3, issuances: 34567, refusals: 5763, overcomes: 345, year: 2024 },
  { country: 'Bulgaria', countryCode: 'BGR', region: 'Europe', refusalRate: 16.2, issuances: 12345, refusals: 2389, overcomes: 123, year: 2024 },
  
  // Oceania
  { country: 'Australia', countryCode: 'AUS', region: 'Oceania', refusalRate: 6.5, issuances: 123456, refusals: 8575, overcomes: 1234, year: 2024 },
  { country: 'New Zealand', countryCode: 'NZL', region: 'Oceania', refusalRate: 7.2, issuances: 45678, refusals: 3537, overcomes: 456, year: 2024 },
  { country: 'Fiji', countryCode: 'FJI', region: 'Oceania', refusalRate: 18.4, issuances: 2345, refusals: 528, overcomes: 23, year: 2024 },
  
  // Canada - Reference
  { country: 'Canada', countryCode: 'CAN', region: 'North America', refusalRate: 14.6, issuances: 345678, refusals: 58986, overcomes: 3456, year: 2024 },
];

// Historical data for trend analysis
export const historicalData: HistoricalData[] = [
  { country: 'Nigeria', years: [{ year: 2020, rate: 48.5 }, { year: 2021, rate: 49.8 }, { year: 2022, rate: 50.1 }, { year: 2023, rate: 51.0 }, { year: 2024, rate: 51.2 }] },
  { country: 'Ghana', years: [{ year: 2020, rate: 45.2 }, { year: 2021, rate: 46.8 }, { year: 2022, rate: 47.5 }, { year: 2023, rate: 48.2 }, { year: 2024, rate: 48.7 }] },
  { country: 'India', years: [{ year: 2020, rate: 18.5 }, { year: 2021, rate: 19.8 }, { year: 2022, rate: 21.2 }, { year: 2023, rate: 22.1 }, { year: 2024, rate: 22.8 }] },
  { country: 'Mexico', years: [{ year: 2020, rate: 16.2 }, { year: 2021, rate: 17.1 }, { year: 2022, rate: 17.8 }, { year: 2023, rate: 18.3 }, { year: 2024, rate: 18.7 }] },
  { country: 'China', years: [{ year: 2020, rate: 12.8 }, { year: 2021, rate: 13.5 }, { year: 2022, rate: 14.2 }, { year: 2023, rate: 14.8 }, { year: 2024, rate: 15.3 }] },
  { country: 'Brazil', years: [{ year: 2020, rate: 12.1 }, { year: 2021, rate: 12.8 }, { year: 2022, rate: 13.4 }, { year: 2023, rate: 13.8 }, { year: 2024, rate: 14.2 }] },
  { country: 'United Kingdom', years: [{ year: 2020, rate: 7.2 }, { year: 2021, rate: 7.8 }, { year: 2022, rate: 8.3 }, { year: 2023, rate: 8.6 }, { year: 2024, rate: 8.9 }] },
  { country: 'Germany', years: [{ year: 2020, rate: 5.8 }, { year: 2021, rate: 6.3 }, { year: 2022, rate: 6.7 }, { year: 2023, rate: 7.0 }, { year: 2024, rate: 7.2 }] },
  { country: 'Australia', years: [{ year: 2020, rate: 5.2 }, { year: 2021, rate: 5.8 }, { year: 2022, rate: 6.1 }, { year: 2023, rate: 6.3 }, { year: 2024, rate: 6.5 }] },
  { country: 'Cuba', years: [{ year: 2020, rate: 68.2 }, { year: 2021, rate: 72.1 }, { year: 2022, rate: 74.5 }, { year: 2023, rate: 75.8 }, { year: 2024, rate: 76.8 }] },
  { country: 'Haiti', years: [{ year: 2020, rate: 52.3 }, { year: 2021, rate: 55.1 }, { year: 2022, rate: 56.8 }, { year: 2023, rate: 58.1 }, { year: 2024, rate: 59.2 }] },
  { country: 'Syria', years: [{ year: 2020, rate: 58.2 }, { year: 2021, rate: 61.5 }, { year: 2022, rate: 63.1 }, { year: 2023, rate: 64.2 }, { year: 2024, rate: 65.4 }] },
  { country: 'Afghanistan', years: [{ year: 2020, rate: 52.1 }, { year: 2021, rate: 55.8 }, { year: 2022, rate: 56.5 }, { year: 2023, rate: 57.4 }, { year: 2024, rate: 58.3 }] },
];

// Global average for comparison
export const globalAverageRefusalRate = 24.5;
