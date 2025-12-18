import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-full h-full relative flex flex-col font-sans bg-omani-pattern overflow-hidden">
            {/* Decorative Top Border */}
            <div className="h-2 w-full bg-gradient-to-r from-omani-red via-omani-white to-omani-green shadow-md z-50 flex-none" />
            
            {/* Corner Ornaments (CSS shapes or simplified) */}
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full border-t-8 border-l-8 border-omani-gold rounded-tl-3xl" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-0 opacity-5">
                <div className="absolute top-0 right-0 w-full h-full border-t-8 border-r-8 border-omani-gold rounded-tr-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none z-0 opacity-5">
                <div className="absolute bottom-0 left-0 w-full h-full border-b-8 border-l-8 border-omani-gold rounded-bl-3xl" />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-0 opacity-5">
                <div className="absolute bottom-0 right-0 w-full h-full border-b-8 border-r-8 border-omani-gold rounded-br-3xl" />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full h-full flex flex-col">
                    {children}
                </div>
            </main>

             {/* Decorative Bottom Border */}
             <div className="h-2 w-full bg-gradient-to-r from-omani-green via-omani-white to-omani-red shadow-md z-50 flex-none" />
        </div>
    );
}
