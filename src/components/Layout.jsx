import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col font-sans shadow-2xl bg-gray-900">
            {/* Night Sky Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-night-start)] to-[var(--color-night-end)] z-0" />

            {/* Stars (CSS generated) */}
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 50}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Moon/Crescent Logo Area - Top Left */}
            <div className="absolute top-4 left-4 z-10 flex flex-col items-center opacity-50">
                <div className="text-omani-gold text-4xl filter drop-shadow-lg">☪</div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col">
                {children}
            </main>

            {/* Sand Foreground */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-sand-end)] to-[var(--color-sand-start)] z-0 rounded-t-[50%] scale-x-150 translate-y-10" />
        </div>
    );
}
