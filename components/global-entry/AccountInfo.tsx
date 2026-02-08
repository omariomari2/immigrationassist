import React from 'react';
import { User } from 'lucide-react';
import { useUser } from '../UserContext';
import { VISA_STATUS_OPTIONS } from '../../userTypes';

export const AccountInfo: React.FC = () => {
    const { user, update } = useUser();
    const [isEditing, setIsEditing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [formState, setFormState] = React.useState({
        visaStatus: '',
        visaExpirationDate: ''
    });

    if (!user) return null;

    React.useEffect(() => {
        setFormState({
            visaStatus: user.visaStatus || '',
            visaExpirationDate: user.visaExpirationDate || ''
        });
    }, [user.visaStatus, user.visaExpirationDate]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSave = () => {
        const result = update({
            visaStatus: formState.visaStatus,
            visaExpirationDate: formState.visaExpirationDate
        });
        if (!result.success) {
            setError(result.error || 'Failed to update visa status');
            return;
        }
        setError(null);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setError(null);
        setFormState({
            visaStatus: user.visaStatus || '',
            visaExpirationDate: user.visaExpirationDate || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Account Overview
                </h3>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-black"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
                    >
                        Edit
                    </button>
                )}
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
                    {isEditing ? (
                        <select
                            value={formState.visaStatus}
                            onChange={(e) => setFormState((prev) => ({ ...prev, visaStatus: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 border-none focus:ring-2 focus:ring-black/5 outline-none transition-all"
                        >
                            <option value="">Select visa status</option>
                            {VISA_STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700">
                            {user.visaStatus || 'N/A'}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">EXPIRATION DATE</label>
                    {isEditing ? (
                        <input
                            type="date"
                            value={formState.visaExpirationDate}
                            onChange={(e) => setFormState((prev) => ({ ...prev, visaExpirationDate: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 border-none focus:ring-2 focus:ring-black/5 outline-none transition-all"
                        />
                    ) : (
                        <div className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700">
                            {formatDate(user.visaExpirationDate)}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-[10px] font-medium text-red-600">
                        {error}
                    </div>
                )}

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
