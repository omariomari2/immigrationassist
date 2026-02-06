import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

interface StatusCardProps {
    mostRecentSlot: string | null;
    lastChecked: Date | null;
    isRunning: boolean;
}

export const MostRecentSlot: React.FC<Pick<StatusCardProps, 'mostRecentSlot'>> = ({ mostRecentSlot }) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Most Recent Slot
            </h3>
            <div className="flex items-baseline gap-2">
                <motion.div
                    key={mostRecentSlot || 'none'}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl sm:text-7xl font-semibold tracking-tight text-gray-800 leading-none"
                >
                    {mostRecentSlot ? formatDate(mostRecentSlot) : '--'}
                </motion.div>
                {mostRecentSlot && (
                    <span className="text-xl text-gray-400 font-medium">
                        {new Date(mostRecentSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    );
};

export const SystemStatus: React.FC<Pick<StatusCardProps, 'isRunning' | 'lastChecked'>> = ({ isRunning, lastChecked }) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft flex flex-col justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                System Status
            </h3>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRunning ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                    {isRunning ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">
                        {isRunning ? 'Monitoring Active' : 'System Idle'}
                    </div>
                    <div className="text-xs text-gray-400">
                        {lastChecked
                            ? `Last checked ${lastChecked.toLocaleTimeString()}`
                            : 'Waiting to start...'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StatusCard: React.FC<StatusCardProps> = ({ mostRecentSlot, lastChecked, isRunning }) => {
    return (
        <div className="flex gap-4 mb-8">
            <MostRecentSlot mostRecentSlot={mostRecentSlot} />
            <div className="flex-1">
                <SystemStatus isRunning={isRunning} lastChecked={lastChecked} />
            </div>
        </div>
    );
};
