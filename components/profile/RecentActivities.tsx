import React, { useState, useEffect } from 'react';
import { getRecents, RECENTS_EVENT, RecentItem } from '../recents';

export const RecentActivities: React.FC = () => {
    const [activities, setActivities] = useState<RecentItem[]>([]);

    useEffect(() => {
        const loadRecents = () => {
            const items = getRecents();
            setActivities(items);
        };

        // Initial load
        loadRecents();

        // Listen for updates
        window.addEventListener(RECENTS_EVENT, loadRecents);
        return () => window.removeEventListener(RECENTS_EVENT, loadRecents);
    }, []);

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Recent Activities
                </h3>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {activities.length}
                </span>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
                {activities.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-4">
                        No recent activities
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="pb-3 border-b border-gray-100 last:border-0 cursor-pointer"
                        >
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {formatTimeAgo(activity.timestamp)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
