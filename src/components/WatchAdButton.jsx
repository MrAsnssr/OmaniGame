import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Loader2, Check, Coins } from 'lucide-react';
import { showRewardedAd, recordAdWatch, AD_REWARD } from '../services/adService';
import { useGameStore } from '../store/gameStore';

export default function WatchAdButton({ userId, className = '' }) {
    const [watching, setWatching] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const { addDirhams } = useGameStore();

    const handleWatchAd = async () => {
        if (watching || !userId) return;

        setWatching(true);

        try {
            // Show the ad
            const result = await showRewardedAd(userId);

            if (result.success) {
                // Record the ad watch and update dirhams
                await recordAdWatch(userId, result.reward);

                // Update local state
                addDirhams(result.reward);

                // Show reward animation
                setShowReward(true);
                setTimeout(() => setShowReward(false), 2000);
            }
        } catch (error) {
            console.error('Error watching ad:', error);
        }

        setWatching(false);
    };

    return (
        <div className="relative">
            <motion.button
                onClick={handleWatchAd}
                disabled={watching}
                whileHover={{ scale: watching ? 1 : 1.05 }}
                whileTap={{ scale: watching ? 1 : 0.95 }}
                className={`
                    relative overflow-hidden
                    flex items-center justify-center gap-3
                    px-6 py-4 rounded-2xl
                    bg-gradient-to-r from-green-500 to-emerald-600
                    text-white font-black text-lg
                    shadow-lg shadow-green-500/30
                    disabled:opacity-70 disabled:cursor-not-allowed
                    transition-all duration-300
                    border-2 border-green-400/50
                    ${className}
                `}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />

                {watching ? (
                    <>
                        <Loader2 size={24} className="animate-spin" />
                        <span>جاري المشاهدة...</span>
                    </>
                ) : (
                    <>
                        <Tv size={24} />
                        <span>شاهد إعلان واحصل على</span>
                        <span className="bg-white/20 px-3 py-1 rounded-xl flex items-center gap-1">
                            {AD_REWARD} <Coins size={18} className="text-yellow-300" />
                        </span>
                    </>
                )}
            </motion.button>

            {/* Reward popup */}
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: -60, scale: 1 }}
                        exit={{ opacity: 0, y: -100, scale: 0.5 }}
                        className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-xl">
                            <Check size={24} />
                            +{AD_REWARD} 💰
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
