import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
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

    function getPriorityColor(priority: NewsItem["priority"]) {
        if (priority === "HIGH") return "bg-green-400 text-gray-900";
        if (priority === "MEDIUM") return "bg-gray-800 text-white";
        return "bg-gray-200 text-gray-600";
    }

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="animate-pulse space-y-3 w-full max-w-md">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-white p-1 rounded-xl shadow-sm w-fit">
                <button
                    onClick={() => setFilter("RELEVANT")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === "RELEVANT"
                            ? "bg-black text-white"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    For You
                </button>
                <button
                    onClick={() => setFilter("ALL")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === "ALL"
                            ? "bg-black text-white"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    All News
                </button>
            </div>

            {displayedNews.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-soft p-8">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">No articles found</h3>
                    <p className="text-sm text-gray-500">
                        We couldn't find any matching stories right now.
                    </p>
                    {error && (
                        <p className="text-sm text-red-500 font-medium mt-3">{error}</p>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {displayedNews.map((item, i) => (
                        <a
                            key={i}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-2xl shadow-soft p-5 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-gray-600 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getPriorityColor(item.priority)}`}>
                                    {item.priority}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
