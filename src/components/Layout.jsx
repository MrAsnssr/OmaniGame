import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-full h-full relative flex flex-col font-sans shadow-2xl" style={{ backgroundColor: '#7a5602' }}>
            {/* Main Content Area - allows scrolling */}
            <main className="flex-1 relative z-10 flex flex-col min-h-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
