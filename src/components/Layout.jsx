import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col font-sans shadow-2xl">
            {/* Warm Sandy/Beige Base Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 z-0" />

            {/* Decorative Blurred Color Patches - Omani Flag Colors */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Large Red patch - left side top */}
                <div
                    className="absolute w-80 h-80 bg-red-600/50 rounded-full blur-3xl"
                    style={{ top: '15%', left: '-15%' }}
                />
                {/* Large Red patch - left side middle */}
                <div
                    className="absolute w-72 h-72 bg-red-700/40 rounded-full blur-3xl"
                    style={{ top: '45%', left: '-10%' }}
                />
                {/* Red patch - bottom left */}
                <div
                    className="absolute w-64 h-64 bg-red-600/35 rounded-full blur-3xl"
                    style={{ bottom: '5%', left: '-5%' }}
                />

                {/* Large Green patch - right side top */}
                <div
                    className="absolute w-80 h-80 bg-green-600/50 rounded-full blur-3xl"
                    style={{ top: '20%', right: '-15%' }}
                />
                {/* Large Green patch - right side middle */}
                <div
                    className="absolute w-72 h-72 bg-green-700/40 rounded-full blur-3xl"
                    style={{ top: '55%', right: '-10%' }}
                />
                {/* Green patch - bottom right */}
                <div
                    className="absolute w-64 h-64 bg-green-600/35 rounded-full blur-3xl"
                    style={{ bottom: '10%', right: '-5%' }}
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
