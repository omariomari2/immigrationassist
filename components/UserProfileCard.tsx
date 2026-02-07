import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, MessageCircle, Calendar, Newspaper, Settings, Shield, Clock, ExternalLink, Bell } from 'lucide-react';
import { useUser } from './UserContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

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

    const recentChats = [
        { id: 1, message: 'How do I check my visa status?', time: '2 hours ago' },
        { id: 2, message: 'What documents do I need for renewal?', time: '1 day ago' },
        { id: 3, message: 'Explain the H1B lottery process', time: '3 days ago' },
    ];

    const recentSlots = [
        { id: 1, location: 'San Francisco', date: 'Feb 15, 2026', status: 'Available' },
        { id: 2, location: 'Los Angeles', date: 'Feb 18, 2026', status: 'Limited' },
        { id: 3, location: 'New York', date: 'Feb 20, 2026', status: 'Available' },
    ];

    const newsItems = [
        { id: 1, title: 'USCIS Updates Premium Processing', source: 'USCIS', time: '1 hour ago' },
        { id: 2, title: 'New H1B Cap Season Announced', source: 'DOL', time: '3 hours ago' },
        { id: 3, title: 'Travel Advisory Update', source: 'State Dept', time: '5 hours ago' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Profile components hidden */}
        </div>
    );
};
