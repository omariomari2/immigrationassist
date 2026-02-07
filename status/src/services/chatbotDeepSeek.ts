import { employerData } from '../data/employerData';
import {
  sendMessage as sendLocalMessage,
  ChatMessage as LocalChatMessage,
  ChatAction as LocalChatAction,
} from './chatbot';

// ============================================
// DEEPSEEK AI POWERED CHATBOT
// ============================================
// Uses DeepSeek API (OpenAI-compatible)
// Base URL: https://api.deepseek.com
// Supported models: deepseek-chat, deepseek-reasoner

const DEEPSEEK_PROXY_URL = import.meta.env.VITE_DEEPSEEK_PROXY_URL || '/api/deepseek/chat/completions';

const DEFAULT_MODEL = 'deepseek-chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'select_company' | 'view_opportunities' | 'compare_companies' | 'compare';
  label: string;
  payload: string;
}

function normalizeLocalActions(actions: LocalChatAction[]): ChatAction[] {
  return actions.map(action => ({
    type: action.type as ChatAction['type'],
    label: action.label,
    payload: typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload),
  }));
}

function toDeepSeekMessage(local: LocalChatMessage, note?: string): ChatMessage {
  const actions = local.actions ? normalizeLocalActions(local.actions) : undefined;
  const content = note ? `${note}\n\n${local.content}` : local.content;
  return {
    id: local.id,
    role: local.role,
    content,
    timestamp: local.timestamp,
    suggestions: local.suggestions,
    actions,
  };
}

// Tool definitions for function calling
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_company_stats',
      description: 'Get H1B approval statistics for a specific company by name',
      parameters: {
        type: 'object',
        properties: {
          company_name: {
            type: 'string',
            description: 'Company name like Google, Microsoft, Amazon, Tesla, etc.',
          },
          year: {
            type: 'integer',
            description: 'Optional fiscal year (2020, 2021, 2022, 2023, 2024, 2025)',
          },
        },
        required: ['company_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_companies',
      description: 'Compare H1B approval stats between two companies',
      parameters: {
        type: 'object',
        properties: {
          company1: {
            type: 'string',
            description: 'First company name',
          },
          company2: {
            type: 'string',
            description: 'Second company name',
          },
        },
        required: ['company1', 'company2'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_companies_by_location',
      description: 'Find companies in a specific state or city',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'State code (CA, TX, NY, WA, etc.) or city name',
          },
          limit: {
            type: 'integer',
            description: 'Maximum results to return (default 10)',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_companies_by_approval_rate',
      description: 'Get companies with the highest H1B approval rates',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            description: 'Number of companies to return (default 5)',
          },
          min_cases: {
            type: 'integer',
            description: 'Minimum total H1B cases to filter out small companies (default 50)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_job_opportunities',
      description: 'Get job/internship opportunities for a specific company',
      parameters: {
        type: 'object',
        properties: {
          company_name: {
            type: 'string',
            description: 'Company name to find opportunities for',
          },
        },
        required: ['company_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_companies',
      description: 'Search for companies by name (fuzzy matching)',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Company name or partial name to search for',
          },
          limit: {
            type: 'integer',
            description: 'Maximum results (default 5)',
          },
        },
        required: ['query'],
      },
    },
  },
];

// Data access functions (same as Gemini version)
function get_company_stats(args: { company_name: string; year?: number }) {
  const company = employerData.employers.find(
    e => e.name.toLowerCase() === args.company_name.toLowerCase()
  );
  
  if (!company) {
    return { error: `Company "${args.company_name}" not found in database` };
  }
  
  if (args.year) {
    const yearData = company.yearlyHistory.find(y => y.year === args.year);
    if (!yearData) {
      return { 
        error: `No data for ${args.year}`,
        available_years: company.yearlyHistory.map(y => y.year),
      };
    }
    return {
      name: company.name,
      year: args.year,
      total_cases: yearData.approvals + yearData.denials,
      approvals: yearData.approvals,
      denials: yearData.denials,
      approval_rate: ((yearData.approvals / (yearData.approvals + yearData.denials)) * 100).toFixed(1),
      city: company.city,
      state: company.state,
    };
  }
  
  return {
    name: company.name,
    total_cases: company.totalCases,
    approvals: company.totalApprovals,
    denials: company.totalDenials,
    approval_rate: company.approvalRate.toFixed(1),
    denial_rate: company.denialRate.toFixed(1),
    city: company.city,
    state: company.state,
    industry: company.industry,
    opportunities_count: company.opportunities?.length || 0,
  };
}

function compare_companies(args: { company1: string; company2: string }) {
  const c1 = employerData.employers.find(
    e => e.name.toLowerCase() === args.company1.toLowerCase()
  );
  const c2 = employerData.employers.find(
    e => e.name.toLowerCase() === args.company2.toLowerCase()
  );
  
  if (!c1 || !c2) {
    const notFound = [];
    if (!c1) notFound.push(args.company1);
    if (!c2) notFound.push(args.company2);
    return { error: `Companies not found: ${notFound.join(', ')}` };
  }
  
  const diff = Math.abs(c1.approvalRate - c2.approvalRate).toFixed(1);
  
  return {
    comparison: [
      {
        name: c1.name,
        approval_rate: c1.approvalRate.toFixed(1),
        total_cases: c1.totalCases,
        opportunities: c1.opportunities?.length || 0,
        location: `${c1.city}, ${c1.state}`,
      },
      {
        name: c2.name,
        approval_rate: c2.approvalRate.toFixed(1),
        total_cases: c2.totalCases,
        opportunities: c2.opportunities?.length || 0,
        location: `${c2.city}, ${c2.state}`,
      },
    ],
    winner: c1.approvalRate > c2.approvalRate ? c1.name : c2.name,
    approval_difference: diff,
  };
}

function list_companies_by_location(args: { location: string; limit?: number }) {
  const loc = args.location.toUpperCase();
  const filtered = employerData.employers.filter(
    e => e.state === loc || e.city.toLowerCase().includes(args.location.toLowerCase())
  );
  
  const sorted = filtered
    .sort((a, b) => b.approvalRate - a.approvalRate)
    .slice(0, args.limit || 10);
  
  return {
    location: args.location,
    total_found: filtered.length,
    showing: sorted.length,
    companies: sorted.map(e => ({
      name: e.name,
      approval_rate: e.approvalRate.toFixed(1),
      total_cases: e.totalCases,
      city: e.city,
      state: e.state,
      opportunities: e.opportunities?.length || 0,
    })),
  };
}

function list_companies_by_approval_rate(args: { limit?: number; min_cases?: number }) {
  const minCases = args.min_cases || 50;
  const sorted = employerData.employers
    .filter(e => e.totalCases >= minCases)
    .sort((a, b) => b.approvalRate - a.approvalRate)
    .slice(0, args.limit || 5);
  
  return {
    min_cases: minCases,
    companies: sorted.map(e => ({
      name: e.name,
      approval_rate: e.approvalRate.toFixed(1),
      total_cases: e.totalCases,
      city: e.city,
      state: e.state,
    })),
  };
}

function get_job_opportunities(args: { company_name: string }) {
  const company = employerData.employers.find(
    e => e.name.toLowerCase() === args.company_name.toLowerCase()
  );
  
  if (!company) {
    return { error: `Company "${args.company_name}" not found` };
  }
  
  if (!company.opportunities || company.opportunities.length === 0) {
    return {
      company: company.name,
      total: 0,
      opportunities: [],
      message: `No opportunities listed for ${company.name}. Check their careers page directly.`,
    };
  }
  
  return {
    company: company.name,
    total: company.opportunities.length,
    opportunities: company.opportunities.slice(0, 10).map(o => ({
      role: o.role,
      location: o.location,
      apply_url: o.applyUrl,
    })),
  };
}

function search_companies(args: { query: string; limit?: number }) {
  const query = args.query.toLowerCase();
  const matches = employerData.employers
    .filter(e => e.name.toLowerCase().includes(query))
    .sort((a, b) => b.totalCases - a.totalCases)
    .slice(0, args.limit || 5);
  
  return {
    query: args.query,
    matches: matches.map(e => ({
      name: e.name,
      approval_rate: e.approvalRate.toFixed(1),
      total_cases: e.totalCases,
      location: `${e.city}, ${e.state}`,
    })),
  };
}

// Execute function call
function executeFunction(name: string, args: any): any {
  switch (name) {
    case 'get_company_stats': return get_company_stats(args);
    case 'compare_companies': return compare_companies(args);
    case 'list_companies_by_location': return list_companies_by_location(args);
    case 'list_companies_by_approval_rate': return list_companies_by_approval_rate(args);
    case 'get_job_opportunities': return get_job_opportunities(args);
    case 'search_companies': return search_companies(args);
    default: return { error: `Unknown function: ${name}` };
  }
}

// Main send message function using DeepSeek API
export async function sendMessage(message: string, history: ChatMessage[]): Promise<ChatMessage> {
  
  try {
    // Build messages array
    const messages = [
      {
        role: 'system',
        content: `You are an H1B visa sponsorship assistant with access to data on ${employerData.employers.length} employers.\n\nYour job:\n1. Understand what the user wants\n2. Use the appropriate function to get data\n3. Present the answer clearly with numbers and context\n4. Be concise but helpful\n\nWhen presenting data:\n- Use bullet points for stats\n- Highlight the approval rate\n- Mention location and opportunities\n- Offer helpful next steps`,
      },
      ...history.map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];
    
    // First API call - may return function call
    const response = await fetch(DEEPSEEK_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    const choice = data.choices[0];
    
    // Handle function call
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      const toolCall = choice.message.tool_calls[0];
      const funcName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      
      // Execute function locally with our data
      const result = executeFunction(funcName, args);
      
      // Add assistant message with tool call
      (messages as any[]).push({
        role: 'assistant',
        content: choice.message.content || '',
        tool_calls: [{
          id: toolCall.id,
          type: 'function',
          function: {
            name: funcName,
            arguments: JSON.stringify(args),
          },
        }],
      });
      
      // Add tool response
      (messages as any[]).push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
      
      // Second call to get natural language response
      const finalResponse = await fetch(DEEPSEEK_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          temperature: 0.5,
          max_tokens: 400,
        }),
      });
      
      const finalData = await finalResponse.json();
      const finalText = finalData.choices[0].message.content;
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: finalText,
        timestamp: new Date(),
        suggestions: generateSuggestions(funcName, args),
        actions: generateActions(funcName, result),
      };
    }
    
    // Direct response (no function call needed)
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: choice.message.content,
      timestamp: new Date(),
      suggestions: ['Google stats', 'Compare companies', 'Best rates', 'Jobs in California'],
      actions: [],
    };
    
  } catch (error) {
    console.error('DeepSeek API error:', error);
    const local = await sendLocalMessage(message, history as unknown as LocalChatMessage[]);
    return toDeepSeekMessage(
      local,
      `**DeepSeek API error**\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nUsing local search instead.`
    );
  }
}

function generateSuggestions(funcName: string, _args: any): string[] {
  const map: Record<string, string[]> = {
    get_company_stats: ['Compare with Microsoft', 'Show opportunities', 'Best approval rates'],
    compare_companies: ['Show more details', 'Compare with third company', 'Find jobs'],
    list_companies_by_location: ['Filter by approval rate', 'Show with opportunities', 'Another location'],
    list_companies_by_approval_rate: ['Show all companies', 'Filter by location', 'View opportunities'],
    get_job_opportunities: ['View company stats', 'Compare with competitors', 'Apply now'],
    search_companies: ['Show top result', 'Compare them', 'See opportunities'],
  };
  return map[funcName] || ['Ask another question'];
}

function generateActions(funcName: string, result: any): ChatAction[] {
  if (funcName === 'get_company_stats' && result.name && !result.error) {
    return [{ type: 'select_company', label: `View ${result.name} Details`, payload: result.name }];
  }
  if (funcName === 'compare_companies' && result.comparison && !result.error) {
    return result.comparison.map((c: any) => ({
      type: 'select_company',
      label: c.name,
      payload: c.name,
    }));
  }
  if (funcName === 'get_job_opportunities' && result.opportunities?.length > 0) {
    return [{ type: 'view_opportunities', label: 'View All Jobs', payload: result.company }];
  }
  return [];
}

export function getInitialMessage(): ChatMessage {
  const totalOpps = employerData.employers.reduce(
    (sum, e) => sum + (e.opportunities?.length || 0), 0
  );
  
  return {
    id: 'welcome',
    role: 'assistant',
    content: `**Welcome to H1B Sponsor Insights!**\n\nI'm powered by **DeepSeek AI (${DEFAULT_MODEL})** and have access to **${employerData.employers.length.toLocaleString()}** H1B sponsoring companies with **${totalOpps}** job opportunities.\n\n**Ask me anything:**\n- "What are Google's H1B stats?"\n- "Compare Microsoft and Amazon"\n- "Companies in California"\n- "Best approval rates"\n- "Jobs at Tesla"`,
    timestamp: new Date(),
    suggestions: [
      'Google H1B stats',
      'Compare Microsoft vs Amazon',
      'Companies in California',
      'Best approval rates',
    ],
    actions: [],
  };
}
