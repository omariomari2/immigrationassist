import React from 'react';
import { Mail, MessageSquare, Map } from 'lucide-react';

export const ActionButtons: React.FC = () => {
    return (
        <div className="flex flex-col gap-3 mt-auto">
            <div className="flex gap-3">
                {/* Email Update Button */}
                <button className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group">
                    <span className="text-xs font-semibold text-gray-900 text-center">
                        Email Alerts
                    </span>
                </button>

                {/* Text Update Button */}
                <button className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group">
                    <span className="text-xs font-semibold text-gray-900 text-center">
                        Text Alerts
                    </span>
                </button>
            </div>

            {/* Map View Button */}
            <button className="w-full bg-white p-3 rounded-3xl shadow-soft flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-900 pl-1">
                        View text in map
                    </span>
                </div>
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-xs">→</span>
                </div>
            </button>
        </div>
    );
};
