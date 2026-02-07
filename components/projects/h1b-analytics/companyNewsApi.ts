export interface CompanyNewsItem {
    title: string;
    url: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
}

const clientCache = new Map<string, CompanyNewsItem[]>();

export async function fetchCompanyNews(
    company: string,
    forceRefresh: boolean = false
): Promise<CompanyNewsItem[]> {
    const cacheKey = company.toLowerCase().trim();

    if (!forceRefresh && clientCache.has(cacheKey)) {
        return clientCache.get(cacheKey)!;
    }

    const res = await fetch("/api/company-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, forceRefresh }),
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch company news (${res.status})`);
    }

    const data = await res.json();
    const articles: CompanyNewsItem[] = data?.articles || [];

    clientCache.set(cacheKey, articles);
    return articles;
}

export function clearCompanyNewsCache(company?: string) {
    if (company) {
        clientCache.delete(company.toLowerCase().trim());
    } else {
        clientCache.clear();
    }
}
