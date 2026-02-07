import React, { ReactNode } from 'react';
import { MegaTab, TabOption } from '../types';
import { NavIcons } from './NavIcons';

interface PageHeaderProps {
    title: string;
    breadcrumbs: ReactNode;
    activeMegaTab: MegaTab;
    activeTab: TabOption;
    onMegaTabChange: (tab: MegaTab) => void;
    onUserClick: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    breadcrumbs,
    activeMegaTab,
    activeTab,
    onMegaTabChange,
    onUserClick
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-medium text-textPrimary">{title}</h1>
                {breadcrumbs}
            </div>

            <NavIcons
                activeMegaTab={activeMegaTab}
                activeTab={activeTab}
                onMegaTabChange={onMegaTabChange}
                onUserClick={onUserClick}
            />
        </div>
    );
};
