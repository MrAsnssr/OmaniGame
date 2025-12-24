import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Trophy, Crown, Medal } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function Leaderboard({ onBack, currentUserId }) {
    const { 
        streakLeaderboard, 
        streakLoading, 
        fetchStreakLeaderboard,
        currentStreak,
        longestStreak 
    } = useGameStore();

    useEffect(() => {
        fetchStreakLeaderboard();
    }, []);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="text-[#FFD700]" size={24} />;
            case 2:
                return <Medal className="text-[#C0C0C0]" size={22} />;
            case 3:
                return <Medal className="text-[#CD7F32]" size={22} />;
            default:
                return <span className="text-sand/50 font-bold text-sm w-6 text-center">{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-[#FFD700]/20 to-transparent border-[#FFD700]/30';
            case 2:
                return 'bg-gradient-to-r from-[#C0C0C0]/15 to-transparent border-[#C0C0C0]/20';
            case 3:
                return 'bg-gradient-to-r from-[#CD7F32]/15 to-transparent border-[#CD7F32]/20';
            default:
                return 'bg-wood-dark/30 border-white/5';
        }
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text flex-1">لوحة المتصدرين</h2>
                <Trophy className="text-primary" size={28} />
            </div>

            {/* Your Stats Card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/20 to-orange-700/10 border border-primary/30 rounded-2xl p-4 mb-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sand/70 text-sm mb-1">سلسلتك الحالية</p>
                        <div className="flex items-center gap-2">
                            <Flame className="text-primary" size={28} />
                            <span className="text-4xl font-black text-white">{currentStreak}</span>
                            <span className="text-sand/50 text-sm">يوم</span>
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="text-sand/70 text-sm mb-1">أطول سلسلة</p>
                        <div className="flex items-center gap-1 justify-end">
                            <span className="text-2xl font-bold text-[#FFD700]">{longestStreak}</span>
                            <span className="text-sand/50 text-xs">يوم</span>
                        </div>
                    </div>
                </div>
                
                {/* Streak Info */}
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-sand/60 text-center">
                        🎮 العب لعبة أونلاين يومياً للحفاظ على سلسلتك!
                    </p>
                </div>
            </motion.div>

            {/* Streak Rewards Info */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-wood-dark/50 border border-white/5 rounded-xl p-3 mb-4"
            >
                <p className="text-xs text-sand/70 text-center mb-2 font-bold">مكافآت السلسلة اليومية 🎁</p>
                <div className="flex justify-around text-center">
                    <div>
                        <span className="text-[#FFD700] text-xs">+10</span>
                        <p className="text-[10px] text-sand/50">يوم 1</p>
                    </div>
                    <div>
                        <span className="text-[#FFD700] text-xs">+50</span>
                        <p className="text-[10px] text-sand/50">3 أيام</p>
                    </div>
                    <div>
                        <span className="text-[#FFD700] text-xs">+100</span>
                        <p className="text-[10px] text-sand/50">7+ أيام</p>
                    </div>
                </div>
            </motion.div>

            {/* Leaderboard Header */}
            <div className="flex items-center gap-2 mb-2 px-2">
                <Flame className="text-primary" size={18} />
                <span className="text-sm font-bold text-sand/70">أطول السلاسل</span>
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {streakLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin text-4xl">🔥</div>
                    </div>
                ) : streakLeaderboard.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <Flame className="text-sand/30 mb-2" size={40} />
                        <p className="text-sand/50">لا توجد سلاسل بعد</p>
                        <p className="text-sand/30 text-xs mt-1">كن أول من يبدأ سلسلة!</p>
                    </div>
                ) : (
                    streakLeaderboard.map((player, index) => (
                        <motion.div
                            key={player.oduserId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${getRankBg(player.rank)} ${
                                player.oduserId === currentUserId ? 'ring-2 ring-primary/50' : ''
                            }`}
                        >
                            {/* Rank */}
                            <div className="w-8 flex justify-center">
                                {getRankIcon(player.rank)}
                            </div>

                            {/* Avatar placeholder */}
                            <div className={`size-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                player.rank === 1 ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                                player.rank === 2 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                                player.rank === 3 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                                'bg-wood-light text-sand/50'
                            }`}>
                                {player.odisplayName?.charAt(0) || '?'}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold truncate ${
                                    player.oduserId === currentUserId ? 'text-primary' : 'text-white'
                                }`}>
                                    {player.odisplayName}
                                    {player.oduserId === currentUserId && (
                                        <span className="text-xs text-sand/50 mr-1">(أنت)</span>
                                    )}
                                </p>
                                <p className="text-xs text-sand/50">
                                    أطول سلسلة: {player.longestStreak} يوم
                                </p>
                            </div>

                            {/* Current Streak */}
                            <div className="flex items-center gap-1 bg-wood-dark/50 px-3 py-1.5 rounded-full">
                                <Flame className="text-primary" size={16} />
                                <span className="text-white font-bold">{player.currentStreak}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-sand/40 text-xs text-center">
                    يتم تحديث اللوحة بعد كل لعبة أونلاين
                </p>
            </div>
        </div>
    );
}

