"""
GPT4All CSV Chatbot - H1B Visa Data Assistant
Smart query parsing with direct data responses + optional LLM enhancement.
"""

import os
import re
import pandas as pd
from gpt4all import GPT4All

CSV_DIR = os.path.join(os.path.dirname(__file__), "csvs")


class H1BDataLoader:
    """Loads and manages H1B visa data from CSV files."""
    
    def __init__(self):
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Load all H1B CSV files and combine into single DataFrame."""
        print("Loading H1B data...")
        csv_files = [
            os.path.join(CSV_DIR, f"h1b_datahubexport-{year}.csv")
            for year in range(2019, 2024)
        ]
        
        dfs = []
        for file in csv_files:
            if os.path.exists(file):
                df = pd.read_csv(file)
                dfs.append(df)
                print(f"  Loaded {os.path.basename(file)}: {len(df):,} records")
        
        self.df = pd.concat(dfs, ignore_index=True)
        print(f"Total records loaded: {len(self.df):,}\n")
    
    def get_top_employers(self, year: int = None, limit: int = 10, offset: int = 0) -> pd.DataFrame:
        """Get top employers by total approvals."""
        df = self.df if year is None else self.df[self.df['Fiscal Year'] == year]
        
        agg = df.groupby('Employer').agg({
            'Initial Approval': 'sum',
            'Continuing Approval': 'sum',
            'Initial Denial': 'sum',
            'Continuing Denial': 'sum'
        }).reset_index()
        
        agg['Total Approvals'] = agg['Initial Approval'] + agg['Continuing Approval']
        agg['Total Denials'] = agg['Initial Denial'] + agg['Continuing Denial']
        
        sorted_df = agg.sort_values('Total Approvals', ascending=False)
        return sorted_df.iloc[offset:offset+limit]
    
    def get_employer_stats(self, employer_name: str, year: int = None) -> dict:
        """Get stats for a specific employer."""
        mask = self.df['Employer'].str.contains(employer_name.upper(), na=False, regex=False)
        employer_df = self.df[mask]
        
        if year:
            employer_df = employer_df[employer_df['Fiscal Year'] == year]
        
        if employer_df.empty:
            return None
        
        initial_approvals = int(employer_df['Initial Approval'].sum())
        continuing_approvals = int(employer_df['Continuing Approval'].sum())
        initial_denials = int(employer_df['Initial Denial'].sum())
        continuing_denials = int(employer_df['Continuing Denial'].sum())
        
        total_sponsored = initial_approvals + continuing_approvals
        total_denied = initial_denials + continuing_denials
        total = initial_approvals + initial_denials
        
        return {
            'employer': employer_name,
            'year': year,
            'total_sponsored': total_sponsored,
            'initial_approvals': initial_approvals,
            'continuing_approvals': continuing_approvals,
            'total_denials': total_denied,
            'approval_rate': f"{(initial_approvals / total * 100):.1f}%" if total > 0 else "N/A",
            'top_states': employer_df['State'].dropna().value_counts().head(3).index.tolist()
        }
    
    def get_state_summary(self, limit: int = 10) -> pd.DataFrame:
        """Get summary by state."""
        agg = self.df.groupby('State').agg({
            'Initial Approval': 'sum',
            'Continuing Approval': 'sum',
            'Employer': 'nunique'
        }).reset_index()
        
        agg.columns = ['State', 'Initial Approvals', 'Continuing Approvals', 'Unique Employers']
        agg['Total'] = agg['Initial Approvals'] + agg['Continuing Approvals']
        
        return agg.nlargest(limit, 'Total')[['State', 'Total', 'Unique Employers']]
    
    def get_summary(self) -> dict:
        """Get overall data summary."""
        return {
            'total_records': len(self.df),
            'years': sorted(self.df['Fiscal Year'].unique().tolist()),
            'unique_employers': self.df['Employer'].nunique(),
            'total_approvals': int(self.df['Initial Approval'].sum() + self.df['Continuing Approval'].sum()),
            'total_denials': int(self.df['Initial Denial'].sum() + self.df['Continuing Denial'].sum())
        }


class H1BChatbot:
    """Smart chatbot that parses queries and returns accurate data."""
    
    def __init__(self):
        self.data = H1BDataLoader()
        self.model = None
        self._init_model()
    
    def _init_model(self):
        """Try to load a lightweight model."""
        print("Initializing GPT4All...")
        models = [
            "Llama-3.2-1B-Instruct-Q4_0.gguf",
            "llama-3.2-1b-instruct-q4_0.gguf",
        ]
        
        for model in models:
            try:
                self.model = GPT4All(model, allow_download=False)
                print(f"  ✓ Loaded: {model}")
                break
            except:
                continue
        
        if self.model:
            print("Chatbot ready! (AI-enhanced)\n")
        else:
            print("Chatbot ready! (Data mode)\n")
    
    def _parse_query(self, question: str) -> dict:
        """Smart parsing of user questions."""
        q = question.lower()
        
        result = {
            'type': 'unknown',
            'employer': None,
            'year': None,
            'limit': 10,
            'offset': 0
        }
        
        # Extract year
        year_match = re.search(r'\b(2019|2020|2021|2022|2023)\b', question)
        if year_match:
            result['year'] = int(year_match.group(1))
        
        # Extract limit (top N, first N, etc.)
        limit_match = re.search(r'\b(?:top|first|next)\s*(\d+)', q)
        if limit_match:
            result['limit'] = int(limit_match.group(1))
        
        # Check for "next" queries (pagination) - handled in main loop
        if 'next' in q:
            result['type'] = 'top_employers'
            return result  # offset will be set by main loop
        
        # Detect query type - ORDER MATTERS (most specific first)
        if any(word in q for word in ['state', 'states', 'location', 'where']):
            result['type'] = 'state_summary'
        elif any(word in q for word in ['top', 'most', 'highest', 'best', 'leading', 'rank']):
            result['type'] = 'top_employers'
        elif any(word in q for word in ['summary', 'overview', 'total', 'how many records', 'overall']):
            result['type'] = 'summary'
        
        # Extract employer name - check common companies first
        companies = {
            'amazon': 'AMAZON', 'google': 'GOOGLE', 'microsoft': 'MICROSOFT',
            'apple': 'APPLE', 'meta': 'META', 'facebook': 'FACEBOOK',
            'infosys': 'INFOSYS', 'tcs': 'TATA CONSULTANCY', 'wipro': 'WIPRO',
            'cognizant': 'COGNIZANT', 'accenture': 'ACCENTURE', 'ibm': 'IBM',
            'intel': 'INTEL', 'cisco': 'CISCO', 'oracle': 'ORACLE',
            'salesforce': 'SALESFORCE', 'uber': 'UBER', 'tesla': 'TESLA',
            'nvidia': 'NVIDIA', 'deloitte': 'DELOITTE', 'capgemini': 'CAPGEMINI'
        }
        
        for keyword, search_term in companies.items():
            if keyword in q:
                result['employer'] = search_term
                result['type'] = 'employer_stats'
                break
        
        # Check for "how many" + company pattern
        if 'how many' in q and result['employer']:
            result['type'] = 'employer_stats'
        
        return result
    
    def _format_response(self, query: dict) -> str:
        """Generate response based on parsed query."""
        
        if query['type'] == 'employer_stats' and query['employer']:
            stats = self.data.get_employer_stats(query['employer'], query['year'])
            if not stats:
                return f"No data found for '{query['employer']}'"
            
            year_str = f" in {query['year']}" if query['year'] else " (2019-2023)"
            return f"""📊 **{query['employer']} H1B Stats{year_str}**

• Total H1Bs Sponsored: **{stats['total_sponsored']:,}**
  - New petitions approved: {stats['initial_approvals']:,}
  - Extensions approved: {stats['continuing_approvals']:,}
• Total Denials: {stats['total_denials']:,}
• Approval Rate: {stats['approval_rate']}
• Top States: {', '.join(stats['top_states'])}"""

        elif query['type'] == 'top_employers':
            df = self.data.get_top_employers(
                year=query['year'], 
                limit=query['limit'],
                offset=query['offset']
            )
            year_str = f" ({query['year']})" if query['year'] else " (2019-2023)"
            start_rank = query['offset'] + 1
            
            lines = [f"📊 **Top H1B Employers{year_str}** (Ranked #{start_rank}-{start_rank + len(df) - 1})\n"]
            for i, row in enumerate(df.itertuples(), start=start_rank):
                lines.append(f"{i}. **{row.Employer}** - {int(row._6):,} total approvals")
            
            return "\n".join(lines)

        elif query['type'] == 'state_summary':
            df = self.data.get_state_summary(limit=10)
            lines = ["📊 **Top States by H1B Approvals (2019-2023)**\n"]
            for i, row in enumerate(df.itertuples(), 1):
                lines.append(f"{i}. **{row.State}** - {int(row.Total):,} approvals ({int(row._4):,} employers)")
            return "\n".join(lines)

        elif query['type'] == 'summary':
            s = self.data.get_summary()
            return f"""📊 **H1B Data Summary (2019-2023)**

• Total Records: {s['total_records']:,}
• Years Covered: {s['years']}
• Unique Employers: {s['unique_employers']:,}
• Total Approvals: {s['total_approvals']:,}
• Total Denials: {s['total_denials']:,}"""

        else:
            # Unknown query - try to help
            return """I can answer questions like:
• "How many H1Bs did Amazon sponsor in 2021?"
• "What are the top 10 H1B employers?"
• "Show me the next 5 companies" 
• "Which states have the most H1B approvals?"
• "Give me an overall summary"

Try asking about a specific company or the top employers!"""
    
    def ask(self, question: str, offset: int = 0) -> str:
        """Process question and return answer."""
        query = self._parse_query(question)
        query['offset'] = offset  # Apply offset from main loop
        return self._format_response(query)


def main():
    print("=" * 60)
    print("  H1B Visa Data Chatbot (Smart Query Engine)")
    print("=" * 60)
    print()
    
    chatbot = H1BChatbot()
    
    print("Ask me about H1B visa data (2019-2023)!")
    print("Examples:")
    print("  • How many H1Bs did Amazon sponsor in 2021?")
    print("  • What are the top 10 H1B employers?")
    print("  • Show me the next 5")
    print("  • Which states have the most approvals?")
    print("\nType 'exit' to quit.\n")
    
    last_query = {'offset': 0, 'limit': 10, 'year': None}
    
    while True:
        try:
            user_input = input("You: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ['exit', 'quit', 'bye', 'q']:
                print("\nGoodbye!")
                break
            
            # Handle "next" queries with context
            if 'next' in user_input.lower():
                last_query['offset'] += last_query['limit']
            else:
                last_query['offset'] = 0
            
            response = chatbot.ask(user_input, offset=last_query['offset'])
            print(f"\n{response}\n")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break


if __name__ == "__main__":
    main()
