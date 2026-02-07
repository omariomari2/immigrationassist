import { NewsItem, UserProfile } from "./types";

const CACHE_TTL_MS = 10 * 60 * 1000;
type CachedResponse = { expiresAt: number; articles: NewsItem[] };

const visaCache = new Map<string, CachedResponse>();
const visaInFlight = new Map<string, Promise<NewsItem[]>>();

const companyCache = new Map<string, CachedResponse>();
const companyInFlight = new Map<string, Promise<NewsItem[]>>();

function makeVisaKey(profile: UserProfile) {
    return (profile?.visaType || "f1").toLowerCase();
}

function makeCompanyKey(company?: string) {
    return (company || "").toLowerCase().trim();
}

function mapArticles(items: unknown): NewsItem[] {
    if (!Array.isArray(items)) return [];
    return items.map((article: any) => ({
        title: article?.title,
        url: article?.url,
        priority: article?.priority || "LOW",
        locationTags: article?.locationTags || [],
    }));
}

async function fetchVisaNews(profile: UserProfile): Promise<NewsItem[]> {
    const cacheKey = makeVisaKey(profile);
    const cached = visaCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.articles;
    }

    const existing = visaInFlight.get(cacheKey);
    if (existing) {
        return existing;
    }

    const work = (async () => {
        const res = await fetch("/api/news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile }),
        });

        let data: any = {};
        try {
            data = await res.json();
        } catch (error) {
            data = {};
        }

        if (!res.ok) {
            const message =
                typeof data?.error === "string"
                    ? data.error
                    : `Failed to fetch news (${res.status})`;
            throw new Error(message);
        }

        return mapArticles(data?.articles);
    })();

    visaInFlight.set(cacheKey, work);

    try {
        const result = await work;
        visaCache.set(cacheKey, {
            expiresAt: Date.now() + CACHE_TTL_MS,
            articles: result,
        });
        return result;
    } finally {
        visaInFlight.delete(cacheKey);
    }
}

async function fetchCompanyNews(company?: string): Promise<NewsItem[]> {
    const cacheKey = makeCompanyKey(company);
    if (!cacheKey) return [];

    const cached = companyCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.articles;
    }

    const existing = companyInFlight.get(cacheKey);
    if (existing) {
        return existing;
    }

    const work = (async () => {
        const res = await fetch("/api/company-news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company: company }),
        });

        let data: any = {};
        try {
            data = await res.json();
        } catch (error) {
            data = {};
        }

        if (!res.ok) {
            return [];
        }

        return mapArticles(data?.articles);
    })();

    companyInFlight.set(cacheKey, work);

    try {
        const result = await work;
        companyCache.set(cacheKey, {
            expiresAt: Date.now() + CACHE_TTL_MS,
            articles: result,
        });
        return result;
    } finally {
        companyInFlight.delete(cacheKey);
    }
}

export async function fetchNews(profile: UserProfile, companyName?: string): Promise<NewsItem[]> {
    const [visaNews, companyNews] = await Promise.all([
        fetchVisaNews(profile),
        fetchCompanyNews(companyName),
    ]);

    const seen = new Set<string>();
    const merged: NewsItem[] = [];
    for (const item of [...companyNews, ...visaNews]) {
        const key = item.url || item.title;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
    }

    return merged;
}
