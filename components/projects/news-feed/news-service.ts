import { NewsItem, UserProfile } from "./types";

const CACHE_TTL_MS = 10 * 60 * 1000;
type CachedResponse = { expiresAt: number; articles: NewsItem[] };

const responseCache = new Map<string, CachedResponse>();
const inFlight = new Map<string, Promise<NewsItem[]>>();

function makeCacheKey(profile: UserProfile) {
    return (profile?.visaType || "f1").toLowerCase();
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

export async function fetchNews(profile: UserProfile): Promise<NewsItem[]> {
    const cacheKey = makeCacheKey(profile);
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.articles;
    }

    const existing = inFlight.get(cacheKey);
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

    inFlight.set(cacheKey, work);

    try {
        const result = await work;
        responseCache.set(cacheKey, {
            expiresAt: Date.now() + CACHE_TTL_MS,
            articles: result,
        });
        return result;
    } finally {
        inFlight.delete(cacheKey);
    }
}
