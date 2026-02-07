import Fuse from 'fuse.js';
import { employerData } from '../data/employerData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'select_company' | 'view_opportunities' | 'compare';
  label: string;
  payload: string | { companies: string[] };
}

export type QueryIntent = 
  | 'company_stats'
  | 'company_list'
  | 'opportunities'
  | 'comparison'
  | 'approval_rate'
  | 'industry_info'
  | 'help'
  | 'greeting';

interface ParsedQuery {
  intent: QueryIntent;
  companies: string[];
  industry?: string;
  location?: string;
  year?: number;
  filters: {
    minApprovalRate?: number;
    maxApprovalRate?: number;
    hasOpportunities?: boolean;
    location?: string;
  };
}

// Initialize Fuse instance for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.6 },
    { name: 'industry', weight: 0.2 },
    { name: 'city', weight: 0.1 },
    { name: 'state', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
};

const fuse = new Fuse(employerData.employers, fuseOptions);

// Query parsing with compromise
function parseQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  
  const result: ParsedQuery = {
    intent: 'help',
    companies: [],
    filters: {},
  };

  // Detect intent
  if (lowerQuery.match(/^(hi|hello|hey|greetings)/)) {
    result.intent = 'greeting';
  } else if (lowerQuery.includes('opportunit') || lowerQuery.includes('job') || lowerQuery.includes('intern') || lowerQuery.includes('hiring')) {
    result.intent = 'opportunities';
  } else if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus') || lowerQuery.includes('between')) {
    result.intent = 'comparison';
  } else if (lowerQuery.includes('list') || lowerQuery.includes('show me') || lowerQuery.includes('which companies') || lowerQuery.match(/companies\s+in/) || lowerQuery.startsWith('companies')) {
    result.intent = 'company_list';
  } else if (lowerQuery.includes('approval rate') || lowerQuery.includes('denial rate') || lowerQuery.includes('success rate') || lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('highest')) {
    result.intent = 'approval_rate';
  } else if (lowerQuery.includes('approval') || lowerQuery.includes('denial') || lowerQuery.includes('h1b') || lowerQuery.includes('case') || lowerQuery.includes('stats') || lowerQuery.includes('statistic')) {
    result.intent = 'company_stats';
  }

  // Extract company names using Fuse search
  const companyMatches = fuse.search(query);
  if (companyMatches.length > 0) {
    result.companies = companyMatches
      .slice(0, 3)
      .map(match => match.item.name);
  }

  // Extract location - improved patterns
  const locationPatterns = [
    /in\s+([a-z\s]+(?:,\s*[a-z]{2})?)/i,
    /companies\s+(?:in|at|near)\s+([a-z\s]+)/i,
    /(?:california|texas|new york|florida|washington|illinois|massachusetts|north carolina|georgia|colorado)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match) {
      const loc = match[1] || match[0];
      result.location = loc.trim();
      result.filters.location = loc.trim();
      break;
    }
  }

  // Extract year
  const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[1], 10);
  }

  // Extract approval rate filters
  const highRateMatch = lowerQuery.match(/(high|good|great|best|top).*(?:approval|rate)|(\d{2,3})%?.*approval/);
  if (highRateMatch) {
    result.filters.minApprovalRate = 85;
  }

  const lowRateMatch = lowerQuery.match(/(low|bad|poor).*(?:approval|rate)/);
  if (lowRateMatch) {
    result.filters.maxApprovalRate = 60;
  }

  // Check for opportunities filter
  if (lowerQuery.includes('with opportunities') || lowerQuery.includes('has jobs') || lowerQuery.includes('hiring') || lowerQuery.includes('opportunities')) {
    result.filters.hasOpportunities = true;
  }

  return result;
}

// Generate response based on parsed query
function generateResponse(parsed: ParsedQuery): { text: string; suggestions: string[]; actions: ChatAction[] } {
  const { intent, companies, filters, year } = parsed;

  switch (intent) {
    case 'greeting':
      return {
        text: "👋 Hi! I'm your H1B Sponsor Assistant. I can help you with:\n\n• Company H1B statistics and approval rates\n• Job opportunities at sponsoring companies\n• Comparing multiple companies\n• Finding companies by location or industry\n\nWhat would you like to know?",
        suggestions: [
          "Show me companies in California",
          "What are Google's H1B stats?",
          "Compare Microsoft and Amazon",
          "Which companies have internship opportunities?",
        ],
        actions: [],
      };

    case 'company_stats':
      if (companies.length === 0) {
        return {
          text: "I can help you find H1B statistics for specific companies. Which company are you interested in?",
          suggestions: ["Google", "Microsoft", "Amazon", "Tesla", "Apple"],
          actions: [],
        };
      }
      return generateCompanyStats(companies[0], year);

    case 'opportunities':
      if (companies.length > 0) {
        return generateOpportunitiesList(companies[0]);
      }
      return generateAllOpportunities(filters);

    case 'comparison':
      if (companies.length >= 2) {
        return generateComparison(companies[0], companies[1]);
      } else if (companies.length === 1) {
        return {
          text: `I found ${companies[0]}. Which company would you like to compare it with?`,
          suggestions: employerData.employers.slice(0, 5).map(e => e.name),
          actions: [],
        };
      }
      return {
        text: "I can compare H1B statistics between two companies. Which companies would you like to compare?",
        suggestions: ["Google vs Microsoft", "Amazon vs Meta", "Apple vs Tesla"],
        actions: [],
      };

    case 'company_list':
      return generateCompanyList(filters, parsed.location);

    case 'approval_rate':
      if (companies.length > 0) {
        return generateCompanyStats(companies[0], year);
      }
      return generateTopCompaniesByApproval();

    default:
      return {
        text: "I'm not sure I understood. I can help you with:\n\n• Company H1B statistics\n• Job opportunities\n• Company comparisons\n• Finding companies by location\n\nTry asking something like:\n• \"What are Google's H1B stats?\"\n• \"Show me companies in California with high approval rates\"\n• \"Which companies have internship opportunities?\"",
        suggestions: [
          "Show me tech companies",
          "Best H1B approval rates",
          "Companies with opportunities",
        ],
        actions: [],
      };
  }
}

function generateCompanyStats(companyName: string, year?: number): { text: string; suggestions: string[]; actions: ChatAction[] } {
  const company = employerData.employers.find(e => e.name.toLowerCase() === companyName.toLowerCase());
  
  if (!company) {
    return {
      text: `I couldn't find data for "${companyName}". Could you try a different spelling?`,
      suggestions: employerData.employers.slice(0, 5).map(e => e.name),
      actions: [],
    };
  }

  let statsText = '';
  
  if (year) {
    const yearData = company.yearlyHistory.find(y => y.year === year);
    if (yearData) {
      const total = yearData.approvals + yearData.denials;
      const rate = total > 0 ? (yearData.approvals / total * 100).toFixed(1) : '0';
      statsText = `**${company.name} - FY ${year} H1B Stats**\n\n📊 Total Cases: ${total.toLocaleString()}\n✅ Approved: ${yearData.approvals.toLocaleString()}\n❌ Denied: ${yearData.denials.toLocaleString()}\n📈 Approval Rate: ${rate}%`;
    } else {
      statsText = `**${company.name}** has no H1B data for FY ${year}.`;
    }
  } else {
    statsText = `**${company.name} - H1B Stats (2020-2025)**\n\n📊 Total Cases: ${company.totalCases.toLocaleString()}\n✅ Approved: ${company.totalApprovals.toLocaleString()}\n❌ Denied: ${company.totalDenials.toLocaleString()}\n📈 Approval Rate: ${company.approvalRate.toFixed(1)}%\n📉 Denial Rate: ${company.denialRate.toFixed(1)}%\n📍 Location: ${company.city}, ${company.state}\n🏭 Industry: ${company.industry}`;
  }

  const opportunityCount = company.opportunities?.length || 0;
  const opportunityText = opportunityCount > 0 
    ? `\n\n💼 **${opportunityCount} job opportunity(s) available!**` 
    : '';

  const actions: ChatAction[] = [
    { type: 'select_company', label: 'View Details', payload: company.name },
  ];

  if (opportunityCount > 0) {
    actions.push({ type: 'view_opportunities', label: `View ${opportunityCount} Opportunities`, payload: company.name });
  }

  return {
    text: statsText + opportunityText,
    suggestions: [
      `Compare ${company.name} with another company`,
      `Show me ${year ? 'all years' : 'FY 2024'} stats`,
      opportunityCount > 0 ? 'Show job opportunities' : 'Similar companies',
    ],
    actions,
  };
}

function generateOpportunitiesList(companyName: string): { text: string; suggestions: string[]; actions: ChatAction[] } {
  const company = employerData.employers.find(e => e.name.toLowerCase() === companyName.toLowerCase());
  
  if (!company || !company.opportunities || company.opportunities.length === 0) {
    return {
      text: `No current opportunities found for ${companyName}. Try asking about a different company or browse all opportunities.`,
      suggestions: ["Show all opportunities", "Companies with opportunities", "Best H1B sponsors"],
      actions: [],
    };
  }

  const opps = company.opportunities.slice(0, 5);
  let text = `**💼 ${company.name} - ${company.opportunities.length} Job Opportunities**\n\n`;
  
  opps.forEach((opp, idx) => {
    text += `${idx + 1}. **${opp.role}**\n`;
    text += `   📍 ${opp.location}\n`;
    if (opp.applyUrl) {
      text += `   🔗 [Apply Here](${opp.applyUrl})\n`;
    }
    text += '\n';
  });

  if (company.opportunities.length > 5) {
    text += `*... and ${company.opportunities.length - 5} more opportunities*\n`;
  }

  return {
    text,
    suggestions: ["View company stats", "Compare with another company", "More opportunities"],
    actions: [{ type: 'select_company', label: 'View Company Details', payload: company.name }],
  };
}

function generateAllOpportunities(_filters: ParsedQuery['filters']): { text: string; suggestions: string[]; actions: ChatAction[] } {
  const companiesWithOpps = employerData.employers.filter(e => e.opportunities && e.opportunities.length > 0);
  
  if (companiesWithOpps.length === 0) {
    return {
      text: "No opportunities found in the current dataset.",
      suggestions: ["Browse H1B sponsors", "Top tech companies"],
      actions: [],
    };
  }

  const totalOpps = companiesWithOpps.reduce((sum, e) => sum + (e.opportunities?.length || 0), 0);
  
  let text = `**💼 ${totalOpps} Job Opportunities across ${companiesWithOpps.length} Companies**\n\n`;
  text += "Top companies with opportunities:\n\n";
  
  companiesWithOpps
    .sort((a, b) => (b.opportunities?.length || 0) - (a.opportunities?.length || 0))
    .slice(0, 5)
    .forEach((company, idx) => {
      const opps = company.opportunities?.length || 0;
      text += `${idx + 1}. **${company.name}** - ${opps} role${opps > 1 ? 's' : ''}\n`;
      text += `   📈 ${company.approvalRate.toFixed(1)}% H1B approval rate\n\n`;
    });

  const actions: ChatAction[] = companiesWithOpps.slice(0, 3).map(c => ({
    type: 'view_opportunities',
    label: `${c.name} (${c.opportunities?.length || 0})`,
    payload: c.name,
  }));

  return {
    text,
    suggestions: ["Show all companies", "Filter by location", "Best approval rates"],
    actions,
  };
}

function generateComparison(company1: string, company2: string): { text: string; suggestions: string[]; actions: ChatAction[] } {
  const c1 = employerData.employers.find(e => e.name.toLowerCase() === company1.toLowerCase());
  const c2 = employerData.employers.find(e => e.name.toLowerCase() === company2.toLowerCase());

  if (!c1 || !c2) {
    return {
      text: "I couldn't find one or both companies. Please check the spelling.",
      suggestions: employerData.employers.slice(0, 5).map(e => e.name),
      actions: [],
    };
  }

  const betterRate = c1.approvalRate > c2.approvalRate ? c1 : c2;
  const diff = Math.abs(c1.approvalRate - c2.approvalRate).toFixed(1);

  const text = `**📊 ${c1.name} vs ${c2.name}**\n\n` +
    `| Metric | ${c1.name} | ${c2.name} |\n` +
    `|--------|${'-'.repeat(c1.name.length)}|${'-'.repeat(c2.name.length)}|\n` +
    `| **Total Cases** | ${c1.totalCases.toLocaleString()} | ${c2.totalCases.toLocaleString()} |\n` +
    `| **Approval Rate** | ${c1.approvalRate.toFixed(1)}% | ${c2.approvalRate.toFixed(1)}% |\n` +
    `| **Denial Rate** | ${c1.denialRate.toFixed(1)}% | ${c2.denialRate.toFixed(1)}% |\n` +
    `| **Location** | ${c1.city}, ${c1.state} | ${c2.city}, ${c2.state} |\n` +
    `| **Opportunities** | ${c1.opportunities?.length || 0} | ${c2.opportunities?.length || 0} |\n\n` +
    `🏆 **${betterRate.name}** has a ${diff}% higher approval rate.`;

  return {
    text,
    suggestions: ["Show more details", "Compare with another company", "View opportunities"],
    actions: [
      { type: 'select_company', label: c1.name, payload: c1.name },
      { type: 'select_company', label: c2.name, payload: c2.name },
    ],
  };
}

function generateCompanyList(filters: ParsedQuery['filters'], location?: string): { text: string; suggestions: string[]; actions: ChatAction[] } {
  let filtered = employerData.employers;

  if (location) {
    const locLower = location.toLowerCase();
    filtered = filtered.filter(e => 
      e.city.toLowerCase().includes(locLower) || 
      e.state.toLowerCase().includes(locLower)
    );
  }

  if (filters.minApprovalRate) {
    filtered = filtered.filter(e => e.approvalRate >= filters.minApprovalRate!);
  }

  if (filters.maxApprovalRate) {
    filtered = filtered.filter(e => e.approvalRate <= filters.maxApprovalRate!);
  }

  if (filters.hasOpportunities) {
    filtered = filtered.filter(e => e.opportunities && e.opportunities.length > 0);
  }

  filtered = filtered.slice(0, 10);

  if (filtered.length === 0) {
    return {
      text: "No companies found matching your criteria. Try adjusting your filters.",
      suggestions: ["Show all companies", "Top 10 sponsors", "California companies"],
      actions: [],
    };
  }

  const locationText = location ? ` in ${location}` : '';
  let text = `**🏢 Companies${locationText} (${filtered.length} found)**\n\n`;
  
  filtered.forEach((company, idx) => {
    const oppCount = company.opportunities?.length || 0;
    text += `${idx + 1}. **${company.name}**\n`;
    text += `   📈 ${company.approvalRate.toFixed(1)}% approval rate`;
    text += oppCount > 0 ? ` • 💼 ${oppCount} jobs` : '';
    text += `\n`;
  });

  const actions: ChatAction[] = filtered.slice(0, 3).map(c => ({
    type: 'select_company',
    label: c.name,
    payload: c.name,
  }));

  return {
    text,
    suggestions: ["Filter by approval rate", "Show opportunities only", "Compare top 2"],
    actions,
  };
}

function generateTopCompaniesByApproval(): { text: string; suggestions: string[]; actions: ChatAction[] } {
  const topCompanies = [...employerData.employers]
    .filter(e => e.totalCases >= 100) // Only companies with significant data
    .sort((a, b) => b.approvalRate - a.approvalRate)
    .slice(0, 5);

  let text = "**🏆 Top Companies by H1B Approval Rate (min 100 cases)**\n\n";
  
  topCompanies.forEach((company, idx) => {
    text += `${idx + 1}. **${company.name}** - ${company.approvalRate.toFixed(1)}%\n`;
    text += `   📊 ${company.totalCases.toLocaleString()} total cases\n`;
  });

  const actions: ChatAction[] = topCompanies.slice(0, 3).map(c => ({
    type: 'select_company',
    label: c.name,
    payload: c.name,
  }));

  return {
    text,
    suggestions: ["Show all companies", "Best for internships", "California companies"],
    actions,
  };
}

// Main chat function
export async function sendMessage(message: string, _history: ChatMessage[]): Promise<ChatMessage> {
  const parsed = parseQuery(message);
  const response = generateResponse(parsed);

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: response.text,
    timestamp: new Date(),
    suggestions: response.suggestions,
    actions: response.actions,
  };
}

// Get initial greeting
export function getInitialMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: "👋 Hi! I'm your **H1B Sponsor Assistant**.\n\nI can help you:\n• 📊 Check H1B approval stats for any company\n• 💼 Find job opportunities at H1B sponsors\n• 📈 Compare companies side-by-side\n• 🔍 Discover companies by location or industry\n\n**Try asking:**\n• \"What are Google's H1B stats?\"\n• \"Show me companies in California\"\n• \"Which companies have internship opportunities?\"\n• \"Compare Microsoft and Amazon\"",
    timestamp: new Date(),
    suggestions: [
      "Show me Google's stats",
      "Companies in California",
      "Best H1B approval rates",
      "Companies with opportunities",
    ],
    actions: [],
  };
}
