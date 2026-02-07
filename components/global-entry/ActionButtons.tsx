import React from 'react';
import { Map, TrendingUp, LogOut, Mail, MessageSquare } from 'lucide-react';
import { useUser } from '../UserContext';

export const ActionButtons: React.FC<{
    onNavigateToOpsStatus?: () => void;
    onNavigateToProjects?: () => void;
    isProfile?: boolean;
}> = ({ onNavigateToOpsStatus, onNavigateToProjects, isProfile = false }) => {
    const { logout } = useUser();

    return (
        <div className="flex flex-col gap-3 mt-auto">
            <div className="flex gap-3">
                {isProfile ? (
                    <>
                        <button
                            onClick={onNavigateToOpsStatus}
                            className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group"
                        >
                            <Map className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            <span className="text-xs font-semibold text-gray-900 text-center">
                                View Map
                            </span>
                        </button>

                        <button
                            onClick={onNavigateToProjects}
                            className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group"
                        >
                            <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            <span className="text-xs font-semibold text-gray-900 text-center">
                                Visa Trends
                            </span>
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group"
                        >
                            <Mail className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            <span className="text-xs font-semibold text-gray-900 text-center">
                                Email Alerts
                            </span>
                        </button>

                        <button
                            className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group"
                        >
                            <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            <span className="text-xs font-semibold text-gray-900 text-center">
                                Text Alerts
                            </span>
                        </button>
                    </>
                )}
            </div>

            <button
                onClick={logout}
                className="w-full bg-white p-3 rounded-3xl shadow-soft flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    <span className="text-xs font-semibold text-gray-900 pl-1">
                        Logout
                    </span>
                </div>
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-xs">→</span>
                </div>
            </button>
        </div>
    );
};
