import json
import os
import requests
from typing import List, Dict, Any

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "employerData.json")

class DataLoader:
    def __init__(self):
        self.employers = []
        self.search_index = {}
        self.metadata = {}
        self.loaded = False

    def load_data(self):
        if self.loaded:
            return
        
        try:
            print(f"Loading H1B data from {DATA_PATH}...")
            with open(DATA_PATH, "r", encoding="utf8") as f:
                data = json.load(f)
                self.employers = data.get("employers", [])
                self.search_index = data.get("searchIndex", {})
                self.metadata = data.get("metadata", {})
                self.loaded = True
            print(f"Loaded {len(self.employers)} employers.")
        except Exception as e:
            print(f"Error loading H1B data: {e}")

    def _collect_indices(self, query: str, limit: int) -> List[int]:
        if not self.loaded:
            self.load_data()

        query = query.lower().strip()
        if not query or len(query) < 2:
            return []

        indices = set()

        direct_match = self.search_index.get(query)
        if direct_match is not None:
            if isinstance(direct_match, list):
                for idx in direct_match:
                    indices.add(idx)
            else:
                indices.add(direct_match)

        words = [w for w in query.split() if len(w) > 2]
        for word in words:
            match = self.search_index.get(word)
            if match is not None:
                if isinstance(match, list):
                    for idx in match:
                        indices.add(idx)
                else:
                    indices.add(match)

        if not indices:
            # Fallback to partial matches
            for i, emp in enumerate(self.employers):
                if query in emp["name"].lower():
                    indices.add(i)
                    if len(indices) >= limit:
                        break

        ordered = []
        for idx in indices:
            if 0 <= idx < len(self.employers):
                ordered.append(idx)
                if len(ordered) >= limit:
                    break

        return ordered

    def _employer_summary(self, idx: int) -> Dict[str, Any]:
        emp = self.employers[idx]
        return {
            "id": idx,
            "name": emp.get("name"),
            "city": emp.get("city"),
            "state": emp.get("state"),
            "approvalRate": emp.get("approvalRate"),
            "totalCases": emp.get("totalCases"),
        }

    def search_employers(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        indices = self._collect_indices(query, limit)
        return [self.employers[idx] for idx in indices]

    def search_employers_with_ids(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        indices = self._collect_indices(query, limit)
        return [self._employer_summary(idx) for idx in indices]

    def get_top_employers(self, limit: int = 10) -> List[Dict[str, Any]]:
        if not self.loaded:
            self.load_data()
        top = []
        for idx, _ in enumerate(self.employers[:limit]):
            top.append(self._employer_summary(idx))
        return top

    def get_employer_by_id(self, idx: int) -> Dict[str, Any] | None:
        if not self.loaded:
            self.load_data()
        if idx < 0 or idx >= len(self.employers):
            return None
        emp = dict(self.employers[idx])
        emp["id"] = idx
        return emp

    def get_summary(self, top_n: int = 10) -> Dict[str, Any]:
        if not self.loaded:
            self.load_data()

        year_range = self.metadata.get("yearRange", "")
        latest_year = 0
        if isinstance(year_range, str):
            parts = year_range.replace(" ", "").split("-")
            if len(parts) == 2 and parts[1].isdigit():
                latest_year = int(parts[1])

        if latest_year == 0:
            for emp in self.employers:
                for entry in emp.get("yearlyHistory", []):
                    y = entry.get("year", 0)
                    if y > latest_year:
                        latest_year = y

        total_filings = 0
        if latest_year:
            for emp in self.employers:
                for entry in emp.get("yearlyHistory", []):
                    if entry.get("year") == latest_year:
                        total_filings += entry.get("approvals", 0) + entry.get("denials", 0)

        return {
            "metadata": self.metadata,
            "latestYear": latest_year,
            "totalFilingsLatestYear": total_filings,
            "topEmployers": self.get_top_employers(top_n),
        }

    def get_context_for_query(self, query: str) -> str:
        matches = self.search_employers(query)
        if not matches:
            return ""

        context_parts = []
        for emp in matches:
            yearly = emp.get("yearlyHistory") or []
            recent_year = max(yearly, key=lambda y: y.get("year", 0), default={})
            approvals = recent_year.get("approvals", 0)
            denials = recent_year.get("denials", 0)
            recent_total = approvals + denials
            recent_rate = (approvals / recent_total * 100) if recent_total > 0 else 0

            overall_rate = emp.get("approvalRate")
            overall_denial = emp.get("denialRate")

            summary = (
                f"Employer: {emp.get('name')}\n"
                f"Location: {emp.get('city')}, {emp.get('state')} {emp.get('zipCode', '')}\n"
                f"Overall Approval Rate: {overall_rate}% (Denial Rate: {overall_denial}%)\n"
                f"Total Cases: {emp.get('totalCases')} (Approvals: {emp.get('totalApprovals')}, Denials: {emp.get('totalDenials')})\n"
                f"Most Recent Year: {recent_year.get('year')} (Approvals/Denials: {approvals}/{denials}, Rate: {recent_rate:.1f}%)\n"
            )
            context_parts.append(summary)

        return "\n---\n".join(context_parts)

    def fetch_external_context(self, user_context: dict) -> str:
        parts = []
        user = user_context.get("user", {})
        if isinstance(user, str):
            user = {}
        
        try:
            resp = requests.get("http://localhost:4000/api/locations", timeout=2)
            if resp.status_code == 200:
                locs = resp.json().get("locations", [])
                loc_names = [l["name"] for l in locs[:10]]
                parts.append(f"AVAILABLE SLOT LOCATIONS (Partial List): {', '.join(loc_names)} (and {len(locs)-10} others)")
        except Exception as e:
            print(f"Error fetching locations: {e}")

        try:
            visa_type = user.get("visaType", "h1b")
            payload = {"profile": {"visaType": visa_type}}
            resp = requests.post("http://localhost:3000/api/news", json=payload, timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                articles = data.get("articles", [])
                if articles:
                    news_summary = "LATEST IMMIGRATION NEWS:\n"
                    for art in articles[:3]:
                        news_summary += f"- {art['title']} ({art['url']})\n"
                    parts.append(news_summary)
        except Exception as e:
            print(f"Error fetching news: {e}")

        return "\n\n".join(parts)

data_loader = DataLoader()
