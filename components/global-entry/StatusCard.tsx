import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, User } from 'lucide-react';
import { useUser } from '../UserContext';
import { calculateVisaWeeksCountdown } from '../../utils/dateUtils';

interface StatusCardProps {
    mostRecentSlot: string | null;
    lastChecked: Date | null;
    isRunning: boolean;
}

export const MostRecentSlot: React.FC<Pick<StatusCardProps, 'mostRecentSlot'> & { profileMode?: boolean }> = ({ mostRecentSlot, profileMode = false }) => {
    const { user } = useUser();
    const [showCountdown, setShowCountdown] = React.useState(false);
    const lastExpiryRef = React.useRef<string | null>(null);

    const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
    const hasExpiry = Boolean(user?.visaExpirationDate);
    const countdownValue = hasExpiry ? calculateVisaWeeksCountdown(user!.visaExpirationDate!) : '';
    const canShowCountdown = profileMode && hasExpiry && countdownValue !== '';

    React.useEffect(() => {
        if (!canShowCountdown) {
            setShowCountdown(false);
            lastExpiryRef.current = null;
            return;
        }
        if (user?.visaExpirationDate !== lastExpiryRef.current) {
            setShowCountdown(true);
            lastExpiryRef.current = user?.visaExpirationDate || null;
        }
    }, [canShowCountdown, user?.visaExpirationDate]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const headerTitle = profileMode
        ? (showCountdown && canShowCountdown ? 'Visa Expiry Countdown' : 'Profile Overview')
        : 'Most Recent Slot';

    const headerValue = profileMode
        ? (showCountdown && canShowCountdown ? countdownValue : userName)
        : (mostRecentSlot ? formatDate(mostRecentSlot) : '--');

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {headerTitle}
                </h3>
                {canShowCountdown && (
                    <button
                        onClick={() => setShowCountdown((prev) => !prev)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        {showCountdown ? (
                            <User className="w-3 h-3 text-gray-500" />
                        ) : (
                            <Clock className="w-3 h-3 text-gray-500" />
                        )}
                        <span>{showCountdown ? 'Name' : 'Countdown'}</span>
                    </button>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <motion.div
                    key={headerValue || 'none'}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={profileMode
                        ? "text-4xl sm:text-5xl font-semibold tracking-tight text-gray-800 leading-none"
                        : "text-6xl sm:text-7xl font-semibold tracking-tight text-gray-800 leading-none"}
                >
                    {headerValue}
                </motion.div>
                {!profileMode && mostRecentSlot && (
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
