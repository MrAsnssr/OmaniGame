import React from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, Trophy, Users } from 'lucide-react';

export default function MainMenu({ onStart, onAdmin, onMultiplayer }) {
    const menuItems = [
        { id: 'play', icon: Play, color: 'bg-blue-400', border: 'border-blue-500', shadow: 'shadow-blue-600', onClick: onStart },
        { id: 'multiplayer', icon: Users, color: 'bg-purple-500', border: 'border-purple-600', shadow: 'shadow-purple-700', onClick: onMultiplayer },
        { id: 'admin', icon: Settings, color: 'bg-green-500', border: 'border-green-600', shadow: 'shadow-green-700', onClick: onAdmin },
        { id: 'leaderboard', icon: Trophy, color: 'bg-yellow-400', border: 'border-yellow-500', shadow: 'shadow-yellow-600', onClick: () => { } },
    ];

    return (
        <div className="flex flex-col h-full relative">
            {/* Character & Title Section */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 pb-20">

                {/* Silhouette/Castle Background (CSS shapes) */}
                <div className="absolute bottom-20 w-64 h-64 bg-black/20 rounded-full blur-xl" />

                {/* Title Banner */}
                <div className="relative z-30 w-full px-4">
                    <div className="bg-gradient-to-b from-omani-sand to-amber-200 border-4 border-amber-700 rounded-2xl p-2 shadow-xl transform -rotate-1">
                        <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-3 text-center shadow-inner">
                            <h1 className="text-3xl font-black text-amber-800 tracking-wider drop-shadow-sm stroke-white" style={{ textShadow: '2px 2px 0px #FFF' }}>
                                OMANI QUIZ QUEST
                            </h1>
                        </div>
                        {/* Decorative corners */}
                        <div className="absolute -top-2 -left-2 text-amber-500">✦</div>
                        <div className="absolute -top-2 -right-2 text-amber-500">✦</div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-700 rotate-45 border-4 border-amber-200" />
                    </div>
                </div>
            </div>

            {/* Circular Buttons Menu */}
            <div className="flex-none py-8 px-4 relative z-20">
                <div className="flex justify-center gap-4 items-end">
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.9 }}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={item.onClick}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={`w-16 h-16 rounded-full ${item.color} border-b-4 ${item.border} ${item.shadow} flex items-center justify-center text-white shadow-lg group-hover:-translate-y-1 transition-transform`}>
                                <item.icon size={28} strokeWidth={3} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
