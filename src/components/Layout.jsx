import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col font-sans shadow-2xl">
            {/* Plain Warm Sandy/Beige Background */}
            <div className="absolute inset-0 bg-amber-100 z-0" />

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col">
                {children}
            </main>
        </div>
    );
}
