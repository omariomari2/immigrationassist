import { useEffect, useState } from "react";
import { NewsItem, UserProfile } from "./types";
import { fetchNews } from "./news-service";

interface NewsFeedProps {
    profile: UserProfile;
}

export function NewsFeed({ profile }: NewsFeedProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"ALL" | "RELEVANT">("RELEVANT");

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchNews(profile);
                setNews(data);
            } catch (err) {
                setNews([]);
                setError(err instanceof Error ? err.message : "Failed to load news.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [profile]);

    const displayedNews =
        filter === "RELEVANT"
            ? [...news].sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
            : news;

    function priorityRank(priority: NewsItem["priority"]) {
        if (priority === "HIGH") return 3;
        if (priority === "MEDIUM") return 2;
        return 1;
    }

    if (loading) {
        return (
            <div className="py-12 text-center animate-pulse">
                <div className="h-4 bg-gray-200 w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 w-1/2 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            {/* Tabs */}
            <div className="flex border-b-2 border-black">
                <button
                    onClick={() => setFilter("RELEVANT")}
                    className={`flex-1 py-3 font-bold uppercase tracking-widest text-sm md:text-base transition-colors ${filter === "RELEVANT"
                        ? "bg-black text-white"
                        : "text-gray-400 hover:text-black hover:bg-gray-100"
                        }`}
                >
                    For You ({profile.visaType})
                </button>
                <button
                    onClick={() => setFilter("ALL")}
                    className={`flex-1 py-3 font-bold uppercase tracking-widest text-sm md:text-base transition-colors ${filter === "ALL"
                        ? "bg-black text-white"
                        : "text-gray-400 hover:text-black hover:bg-gray-100"
                        }`}
                >
                    All News
                </button>
            </div>

            {/* Feed */}
            {displayedNews.length === 0 ? (
                <div className="border-2 border-dashed border-black/30 p-6 bg-white">
                    <h3 className="text-lg font-black tracking-tight mb-2">No articles yet</h3>
                    <p className="text-sm text-gray-500">
                        We couldn't find any matching stories right now.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        If this persists, check the browser network tab and the server logs for <span className="font-mono">/api/news</span>.
                    </p>
                    {error && (
                        <p className="text-sm text-red-600 font-bold mt-3">{error}</p>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {displayedNews.map((item, i) => (
                        <a
                            key={i}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block border-2 border-transparent hover:border-black transition-all p-6 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>

                            <h3 className="text-xl md:text-2xl font-black tracking-tight mb-3 group-hover:underline decoration-2 underline-offset-4">
                                {item.title}
                            </h3>

                            <div className="mt-2">
                                <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1">
                                    {item.priority} PRIORITY
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
