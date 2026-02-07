import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon } from 'lucide-react';
import { useUser } from './UserContext';

export const UserProfileCard: React.FC = () => {
    const { user } = useUser();

    if (!user) {
        return null;
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not specified';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=""
        >
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <UserIcon className="w-3 h-3" />
                <span>Member since {formatDate(user.createdAt)}</span>
            </div>
        </motion.div>
    );
};
