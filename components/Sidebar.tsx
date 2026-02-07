import React from 'react';
import { motion } from 'framer-motion';
import { QuantroLogo } from './icons/QuantroLogo';

// Nav icons matching the style from Header
const IconPie = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const IconFolder = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconFile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconGrid = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconHelp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${active
            ? 'bg-black text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
    >
        <span className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}>
            {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
    </motion.button>
);

interface SidebarProps {
    activeItem?: string;
    onItemChange?: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeItem = 'Dashboard',
    onItemChange
}) => {
    const mainNavItems = [
        { icon: <IconPie />, label: 'Dashboard' },
        { icon: <IconFolder />, label: 'Projects' },
        { icon: <IconFile />, label: 'Reports' },
        { icon: <IconUser />, label: 'Users' },
        { icon: <IconShield />, label: 'Ops Status' },
        { icon: <IconGrid />, label: 'Analytics' },
    ];

    const bottomNavItems = [
        { icon: <IconSettings />, label: 'Settings' },
        { icon: <IconHelp />, label: 'Help' },
    ];

    return (
        <aside className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shadow-soft">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-3 mb-8">
                <QuantroLogo className="text-textPrimary w-7 h-7" />
                <span className="font-semibold text-lg tracking-tight text-textPrimary">Immigration</span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col gap-1">
                {mainNavItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={activeItem === item.label}
                        onClick={() => onItemChange?.(item.label)}
                    />
                ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-4" />

            {/* Bottom Navigation */}
            <nav className="flex flex-col gap-1">
                {bottomNavItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={activeItem === item.label}
                        onClick={() => onItemChange?.(item.label)}
                    />
                ))}
            </nav>

            {/* User Card */}
            <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src="https://picsum.photos/64/64"
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-50 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Tuki Joshua</p>
                        <p className="text-xs text-gray-400 truncate">Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
