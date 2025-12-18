import React from 'react';

export default function Layout({ children, variant = 'dark' }) {
    // variant: 'dark' for main menu / wood theme, 'light' for other screens
    const isDark = variant === 'dark';

    return (
        <div className={`w-full h-full relative flex flex-col font-sans overflow-hidden selection:bg-primary selection:text-white ${isDark ? 'bg-wood-pattern text-white' : 'bg-omani-pattern text-gray-800'}`}>
            {/* Background layers for dark theme */}
            {isDark && (
                <>
                    {/* Subtle dark wood grain texture */}
                    <div 
                        className="absolute inset-0 z-0 opacity-20 mix-blend-multiply"
                        style={{ backgroundColor: '#221510' }}
                    />
                    {/* Geometric pattern overlay */}
                    <div 
                        className="absolute inset-0 z-0 opacity-5 rotate-45"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='60' font-size='50' fill='%23EC4913'%3E◇%3C/text%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#181311]/80 via-transparent to-[#181311]/90 pointer-events-none" />
                </>
            )}

            {/* Corner Ornaments for light theme */}
            {!isDark && (
                <>
                    <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full border-t-8 border-l-8 border-omani-gold rounded-tl-3xl" />
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-0 opacity-10">
                        <div className="absolute top-0 right-0 w-full h-full border-t-8 border-r-8 border-omani-gold rounded-tr-3xl" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none z-0 opacity-10">
                        <div className="absolute bottom-0 left-0 w-full h-full border-b-8 border-l-8 border-omani-gold rounded-bl-3xl" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-0 opacity-10">
                        <div className="absolute bottom-0 right-0 w-full h-full border-b-8 border-r-8 border-omani-gold rounded-br-3xl" />
                    </div>
                </>
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="max-w-md mx-auto w-full h-full flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
