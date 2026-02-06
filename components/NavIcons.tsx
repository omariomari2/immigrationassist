import React from 'react';

// Mock icons for the nav group
const NavIconWrapper: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
    <button
        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${active ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200'
            }`}
    >
        {children}
    </button>
);

// Simple SVG shapes for the nav icons to match design perfectly
const IconPie = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const IconFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconFile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconColumns = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path></svg>;

export const NavIcons: React.FC = () => {
    return (
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-100/50">
            <NavIconWrapper active><IconPie /></NavIconWrapper>
            <NavIconWrapper><IconFolder /></NavIconWrapper>
            <NavIconWrapper><IconFile /></NavIconWrapper>
            <NavIconWrapper><IconUser /></NavIconWrapper>
            <NavIconWrapper><IconGrid /></NavIconWrapper>
            <NavIconWrapper><IconColumns /></NavIconWrapper>
        </div>
    );
};
