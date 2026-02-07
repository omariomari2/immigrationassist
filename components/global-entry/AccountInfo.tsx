import React from 'react';
import { User } from 'lucide-react';
import { useUser } from '../UserContext';

export const AccountInfo: React.FC = () => {
    const { user } = useUser();

    if (!user) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Account Overview
                </h3>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">VISA STATUS</label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700">
                        {user.visaStatus || 'N/A'}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">EXPIRATION DATE</label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700">
                        {formatDate(user.visaExpirationDate)}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">MEMBER SINCE</label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700">
                        {formatDate(user.createdAt)}
                    </div>
                </div>
            </div>
        </div>
    );
};
