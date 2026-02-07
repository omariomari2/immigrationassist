import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ExternalLink, Newspaper } from 'lucide-react';
import { fetchCompanyNews, CompanyNewsItem, clearCompanyNewsCache } from './companyNewsApi';

interface CompanyNewsPanelProps {
    employerName: string;
}

export function CompanyNewsPanel({ employerName }: CompanyNewsPanelProps) {
    const [articles, setArticles] = useState<CompanyNewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNews = useCallback(async (forceRefresh: boolean = false) => {
        if (forceRefresh) {
            setIsRefreshing(true);
            clearCompanyNewsCache(employerName);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const data = await fetchCompanyNews(employerName, forceRefresh);
            setArticles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load news');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [employerName]);

    useEffect(() => {
        loadNews(false);
    }, [loadNews]);

    const handleRefresh = () => {
        loadNews(true);
    };

    const getPriorityDot = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-green-400';
            case 'MEDIUM':
                return 'bg-yellow-400';
            default:
                return 'bg-gray-300';
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-soft p-6 h-[280px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Company News
                    </h3>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading && !isRefreshing ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-gray-400">Loading news...</div>
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-red-400">{error}</div>
                </div>
            ) : articles.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-gray-400">No recent news found</div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                    {articles.map((article, index) => (
                        <motion.a
                            key={index}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="block p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                            <div className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getPriorityDot(article.priority)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-700 line-clamp-2 group-hover:text-gray-900 transition-colors">
                                        {article.title}
                                    </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            )}
        </div>
    );
}
