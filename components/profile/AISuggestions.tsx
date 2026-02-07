import React from 'react';
import { Lightbulb } from 'lucide-react';

export const AISuggestions: React.FC = () => {
    const suggestions = [
        {
            id: 1,
            title: 'Update your work authorization',
            description: 'Your visa expires in 6 months. Consider starting the renewal process.',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Check H1B transfer timeline',
            description: 'Based on your profile, you may be eligible for premium processing.',
            priority: 'medium'
        },
        {
            id: 3,
            title: 'Review job opportunities',
            description: '12 new positions match your visa status and skills.',
            priority: 'low'
        }
    ];

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-4 h-4 text-gray-600" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    AI Suggestions
                </h3>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className="pb-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                        onClick={() => {
                            const event = new CustomEvent('quantro_open_chat', {
                                detail: { query: suggestion.title }
                            });
                            window.dispatchEvent(event);
                        }}
                    >
                        <p className="text-sm font-semibold text-gray-900">{suggestion.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{suggestion.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
