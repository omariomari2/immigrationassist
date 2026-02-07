import React, { useState } from 'react';
import { Mail, MessageSquare, Map } from 'lucide-react';
import { useUser } from '../UserContext';
import { sendNotification } from './api';

export const ActionButtons: React.FC<{ onNavigateToOpsStatus?: () => void }> = ({ onNavigateToOpsStatus }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState<{ email: boolean; sms: boolean }>({ email: false, sms: false });

    const handleNotification = async (type: 'email' | 'sms') => {
        if (!user) {
            alert('Please sign in to enable alerts.');
            return;
        }

        const contact = type === 'email' ? user.email : user.phone;
        if (!contact) {
            alert(`Please add your ${type === 'email' ? 'email' : 'phone number'} in your profile to enable ${type} alerts.`);
            return;
        }

        setLoading(prev => ({ ...prev, [type]: true }));

        try {
            const result = await sendNotification(type, contact, user.id); // Assuming user has an ID
            if (result.success) {
                alert(`${type === 'email' ? 'Email' : 'Text'} alerts enabled! You will be notified of visa extension updates.`);
            } else {
                alert('Failed to enable alerts. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please check your connection.');
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    return (
        <div className="flex flex-col gap-3 mt-auto">
            <div className="flex gap-3">
                {/* Email Update Button */}
                <button
                    onClick={() => handleNotification('email')}
                    disabled={loading.email}
                    className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xs font-semibold text-gray-900 text-center">
                        {loading.email ? 'Sending...' : 'Email Alerts'}
                    </span>
                </button>

                {/* Text Update Button */}
                <button
                    onClick={() => handleNotification('sms')}
                    disabled={loading.sms}
                    className="flex-1 bg-white p-3 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xs font-semibold text-gray-900 text-center">
                        {loading.sms ? 'Sending...' : 'Text Alerts'}
                    </span>
                </button>
            </div>

            {/* Map View Button */}
            <button
                onClick={onNavigateToOpsStatus}
                className="w-full bg-white p-3 rounded-3xl shadow-soft flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-900 pl-1">
                        View In Maps
                    </span>
                </div>
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-xs">→</span>
                </div>
            </button>
        </div>
    );
};
