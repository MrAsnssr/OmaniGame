import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col font-sans shadow-2xl">
            {/* Warm Sandy Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 z-0" />

            {/* Decorative Blurred Color Patches - Omani Colors */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Red patch - left side */}
                <div
                    className="absolute w-64 h-64 bg-red-600/40 rounded-full blur-3xl"
                    style={{ top: '30%', left: '-10%' }}
                />
                {/* Green patch - right side */}
                <div
                    className="absolute w-64 h-64 bg-green-600/40 rounded-full blur-3xl"
                    style={{ top: '50%', right: '-10%' }}
                />
                {/* Red patch - bottom left */}
                <div
                    className="absolute w-48 h-48 bg-red-500/30 rounded-full blur-3xl"
                    style={{ bottom: '10%', left: '5%' }}
                />
                {/* Green patch - top right */}
                <div
                    className="absolute w-48 h-48 bg-green-500/30 rounded-full blur-3xl"
                    style={{ top: '5%', right: '10%' }}
                />
            </div>

            {/* Subtle decorative star in corner */}
            <div className="absolute bottom-4 right-4 text-amber-400/50 text-2xl z-0">
                ✦
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col">
                {children}
            </main>
        </div>
    );
}
