import React from 'react';
import { Grid3X3, List, Plus } from 'lucide-react';

const ToolbarButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-gray-500 hover:bg-gray-50 border border-gray-200/50 transition-colors">
        {children}
    </button>
);

const avatarImages = [
    'https://picsum.photos/seed/user1/64/64',
    'https://picsum.photos/seed/user2/64/64',
    'https://picsum.photos/seed/user3/64/64',
];

export const HeaderToolbar: React.FC = () => {
    return (
        <div className="flex items-center gap-1.5">
            <ToolbarButton>
                <Grid3X3 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton>
                <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton>
                <Plus className="w-4 h-4" />
            </ToolbarButton>

            <div className="flex items-center bg-black text-white pl-3 pr-1 py-1 rounded-lg shadow-sm ml-1">
                <span className="text-xs font-semibold mr-2">+23</span>
                <div className="flex -space-x-2">
                    {avatarImages.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`User ${i + 1}`}
                            className="w-6 h-6 rounded-full border border-black object-cover"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
