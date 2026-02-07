import React from 'react';
import { ExternalLink, BookOpen, Newspaper, Video, ArrowRight } from 'lucide-react';

interface ResourceLink {
    id: string;
    title: string;
    description: string;
    category: string;
    url: string;
    icon: React.ReactNode;
}

export const Resources: React.FC = () => {
    const resources: ResourceLink[] = [
        {
            id: '1',
            title: 'USCIS Official',
            description: 'Official source for U.S. immigration information and forms.',
            category: 'Official',
            url: 'https://www.uscis.gov',
            icon: <BookOpen className="w-4 h-4" />,
        },
        {
            id: '4',
            title: 'Visa Bulletin',
            description: 'Current visa availability and priority dates.',
            category: 'Official',
            url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html',
            icon: <BookOpen className="w-4 h-4" />,
        },
        {
            id: '2',
            title: 'Immigration Daily',
            description: 'Latest updates on immigration policies and changes.',
            category: 'News',
            url: '#',
            icon: <Newspaper className="w-4 h-4" />,
        },
        {
            id: '5',
            title: 'AILA News',
            description: 'American Immigration Lawyers Association updates.',
            category: 'News',
            url: '#',
            icon: <Newspaper className="w-4 h-4" />,
        },
        {
            id: '3',
            title: 'Application Guide',
            description: 'Step-by-step video guide for visa applications.',
            category: 'Tutorial',
            url: '#',
            icon: <Video className="w-4 h-4" />,
        },
    ];

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-2xl font-medium text-textPrimary">Resources</h1>
                    <div className="flex items-center gap-2 text-xs text-textTertiary">
                        <span className="w-2 h-2 bg-gray-300 rounded-sm"></span>
                        <span>External Links</span>
                        <span className="text-gray-300">/</span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span className="font-medium text-gray-500">Verified</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                    <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white p-6 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 block relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                                {resource.icon}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-4 h-4 text-gray-900" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-black">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {resource.description}
                            </p>
                        </div>

                        <div className="absolute bottom-6 left-6">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">
                                {resource.category}
                            </span>
                        </div>
                    </a>
                ))}

                {/* Add New Resource Card (Placeholder) */}
                <button className="group bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                        <ExternalLink className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">Suggest a Resource</span>
                </button>
            </div>
        </div>
    );
};
