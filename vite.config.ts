import path from 'path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const CACHE_TTL_MS = 10 * 60 * 1000;

type CachedResponse = { expiresAt: number; articles: any[] };
type SimpleItem = { title: string; url: string };

const responseCache = new Map<string, CachedResponse>();
const inFlight = new Map<string, Promise<{ articles: any[] }>>();

function makeCacheKey(visa: string) {
  return visa.toLowerCase();
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isGenericVisa(visa: string) {
  const normalized = normalizeToken(visa);
  return normalized === "" || normalized === "visa" || normalized === "immigration" || normalized === "immigrationvisa";
}

function isF1Visa(visa: string) {
  const normalized = normalizeToken(visa);
  return normalized === "f1" || normalized === "f1visa" || normalized === "f1student";
}

function hasImmigrationContext(title: string) {
  const value = title.toLowerCase();
  return (
    value.includes("visa") ||
    value.includes("immigration") ||
    value.includes("uscis") ||
    value.includes("sevis") ||
    value.includes("i-20") ||
    value.includes("i20") ||
    value.includes("opt") ||
    value.includes("cpt") ||
    value.includes("student")
  );
}

function buildVisaKeywords(visa: string) {
  const keywords: string[] = [];
  const trimmed = visa.trim();
  if (trimmed) {
    keywords.push(trimmed, `${trimmed} visa`);
    const compact = trimmed.replace(/[^a-z0-9]/gi, "");
    if (compact && compact.toLowerCase() !== trimmed.toLowerCase()) {
      keywords.push(compact);
    }
  }

  if (isF1Visa(visa)) {
    keywords.push(
      "F-1 visa",
      "F1 visa",
      "student visa",
      "SEVIS",
      "I-20",
      "OPT",
      "CPT"
    );
  }

  if (isGenericVisa(visa)) {
    keywords.push("immigration", "USCIS", "DHS", "Department of State", "visa");
  }

  return Array.from(new Set(keywords));
}

function filterByVisa(items: SimpleItem[], visa: string) {
  if (isGenericVisa(visa)) return items;
  const keywords = buildVisaKeywords(visa)
    .map((keyword) => normalizeToken(keyword))
    .filter(Boolean);
  if (keywords.length === 0) return items;

  const filtered = items.filter((item) => {
    const title = normalizeToken(item.title);
    return keywords.some((keyword) => title.includes(keyword));
  });

  if (isF1Visa(visa)) {
    const withContext = filtered.filter((item) => hasImmigrationContext(item.title));
    if (withContext.length > 0) return withContext;

    const contextFallback = items.filter((item) => hasImmigrationContext(item.title));
    if (contextFallback.length > 0) return contextFallback;
  }

  return filtered.length > 0 ? filtered : items;
}

function mapToPriority(items: SimpleItem[]) {
  return items.slice(0, 15).map((item, i) => {
    let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (i < 3) priority = "HIGH";
    else if (i < 8) priority = "MEDIUM";
    return {
      title: item.title,
      url: item.url,
      priority,
    };
  });
}

async function fetchSerpApi(visa: string, apiKey: string): Promise<SimpleItem[]> {
  const queryTerms = buildVisaKeywords(visa);
  const searchQuery = queryTerms.length > 0
    ? queryTerms.map((term) => `"${term}"`).join(" OR ")
    : "immigration visa";
  const serpUrl = new URL("https://serpapi.com/search.json");
  serpUrl.searchParams.set("engine", "google_news");
  serpUrl.searchParams.set("q", searchQuery);
  serpUrl.searchParams.set("gl", "us");
  serpUrl.searchParams.set("hl", "en");
  serpUrl.searchParams.set("api_key", apiKey);

  const newsRes = await fetch(serpUrl.toString());

  if (!newsRes.ok) {
    console.error("SerpAPI Error:", newsRes.status);
    return [];
  }

  const data = await newsRes.json();
  const newsResults = data.news_results || [];

  const items = newsResults
    .map((item: any) => ({
      title: item?.title,
      url: item?.link,
    }))
    .filter((item: SimpleItem) => item.title && item.url);

  return filterByVisa(items, visa);
}

function readJson(req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function handleNewsRequest(req: IncomingMessage, res: ServerResponse, apiKey?: string) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  if (!apiKey) {
    return sendJson(res, 500, { error: "Server misconfiguration: Missing SERPAPI_KEY" });
  }

  let body: any;
  try {
    body = await readJson(req);
  } catch (error) {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  const visa = body?.profile?.visaType || "immigration";
  const cacheKey = makeCacheKey(visa);

  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return sendJson(res, 200, { articles: cached.articles });
  }

  const existing = inFlight.get(cacheKey);
  if (existing) {
    const result = await existing;
    return sendJson(res, 200, result);
  }

  const work = (async () => {
    const items = await fetchSerpApi(visa, apiKey);
    const articles = mapToPriority(items);
    return { articles };
  })();

  inFlight.set(cacheKey, work);

  try {
    const result = await work;
    responseCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      articles: result.articles,
    });
    return sendJson(res, 200, result);
  } finally {
    inFlight.delete(cacheKey);
  }
}

function newsApiPlugin(apiKey?: string) {
  return {
    name: "news-api",
    configureServer(server: any) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith("/api/news")) return next();
        handleNewsRequest(req, res, apiKey).catch((error) => {
          console.error("News API error:", error);
          if (!res.headersSent) {
            sendJson(res, 500, { error: "Internal Server Error" });
          }
        });
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith("/api/news")) return next();
        handleNewsRequest(req, res, apiKey).catch((error) => {
          console.error("News API error:", error);
          if (!res.headersSent) {
            sendJson(res, 500, { error: "Internal Server Error" });
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const serpApiKey = env.SERPAPI_KEY || env.VITE_SERPAPI_KEY;
    return {
      server: {
        port: 5500,
        host: '0.0.0.0',
      },
      plugins: [react(), newsApiPlugin(serpApiKey)],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
