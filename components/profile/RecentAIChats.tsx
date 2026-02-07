import React from 'react';
import { Bot } from 'lucide-react';

export const RecentAIChats: React.FC = () => {
    const chats = [
        {
            id: 1,
            question: 'What are my H1B transfer options?',
            summary: 'Discussed H1B transfer timeline, premium processing, and required...',
            timestamp: '1 hour ago'
        },
        {
            id: 2,
            question: 'How to apply for visa extension?',
            summary: 'Explained visa extension process, required documents, and fees...',
            timestamp: '2 days ago'
        },
        {
            id: 3,
            question: 'Green card processing time',
            summary: 'Provided current processing times by category and country...',
            timestamp: '5 days ago'
        }
    ];

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Bot className="w-4 h-4 text-gray-600" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Recent AI Chats
                </h3>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className="pb-3 border-b border-gray-100 last:border-0 cursor-pointer"
                    >
                        <p className="text-sm font-semibold text-gray-900 truncate">{chat.question}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{chat.summary}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5">{chat.timestamp}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
