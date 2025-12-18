import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function MainMenu({ onStart, onAdmin, onMultiplayer, onLogin, user, onLogout }) {
    const navigate = useNavigate();
    const { dirhams, avatarV2, avatarFaceTemplates, getBuiltinFaceTemplates } = useGameStore();
    // Only show static (uneditable) avatars
    const allTemplates = [...getBuiltinFaceTemplates(), ...avatarFaceTemplates];
    const staticTemplates = allTemplates.filter(t => t?.uneditable && t?.active !== false);
    const selectedTemplate = staticTemplates.find(t => t.id === avatarV2?.templateId) || staticTemplates[0] || null;
    
    const handleLeaderboardClick = () => {
        navigate('/leaderboard');
    };

    const handleSouqClick = () => {
        navigate('/market');
    };

    const handleCoinShopClick = () => {
        navigate('/shop');
    };

    return (
        // Outer wrapper: fills screen, allows vertical scroll on small heights
        // NOTE: The design in NEWFRONTENDEXAMPLE.html is LTR-based. Our app is globally RTL,
        // so we force LTR here to avoid mirroring (start/end in flex) on mobile/desktop.
        <div dir="ltr" className="relative h-full w-full bg-[#221510] text-white overflow-x-hidden overflow-y-auto">
            {/* Centered mobile-frame container for desktop */}
            <div className="relative w-full max-w-md mx-auto min-h-screen min-h-[100dvh] shadow-2xl overflow-hidden bg-[#221510] flex flex-col">
                {/* Background Layers */}
                <div className="absolute inset-0 z-0">
                    {/* Subtle dark wood grain texture pattern */}
                    <div className="absolute inset-0 bg-repeat opacity-20 mix-blend-multiply" style={{ backgroundColor: '#33221E' }} />
                    {/* Repeating Omani geometric diamond pattern */}
                    <div 
                        className="absolute inset-0 opacity-5 rotate-45"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='60' font-size='50' fill='%23EC4913'%3E◇%3C/text%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#181311]/80 via-transparent to-[#181311]/90 pointer-events-none" />
                </div>

            {/* Header Bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
                {/* User Profile */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={user ? () => navigate('/profile') : onLogin}
                    className="flex items-center gap-3 bg-wood-light/80 backdrop-blur-sm p-1.5 pr-4 rounded-full border border-white/10 shadow-lg hover:border-primary/30 transition-colors"
                >
                    <div className="relative size-10 rounded-full overflow-hidden ring-2 ring-primary/50 bg-wood-dark">
                        {user ? (
                            selectedTemplate?.previewAsset?.dataUrl || selectedTemplate?.previewAsset?.url ? (
                                <img
                                    src={selectedTemplate.previewAsset.dataUrl || selectedTemplate.previewAsset.url}
                                    alt="avatar"
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />
                            ) : (
                                <div className="size-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </div>
                            )
                        ) : (
                            <div className="size-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-sand font-medium uppercase tracking-wider">
                            {user ? 'Player' : 'Guest'}
                        </span>
                        <span className="text-sm font-bold leading-none engraved-text">
                            {user ? (user.displayName || 'اللاعب') : 'تسجيل دخول'}
                        </span>
                    </div>
                </motion.button>

                {/* Currency Display - Game Coins (دراهم) */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCoinShopClick}
                    className="flex items-center gap-2 bg-wood-light/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shadow-lg hover:border-primary/30 transition-colors"
                >
                    <span className="material-symbols-outlined text-[#FFD700] text-[20px]">toll</span>
                    <span className="text-sm font-bold tracking-wide engraved-text">
                        {dirhams.toLocaleString()} <span className="text-xs text-sand font-normal">دراهم</span>
                    </span>
                    <span className="material-symbols-outlined text-sand/50 text-[16px]">add_circle</span>
                </motion.button>
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col w-full">
                {/* Animated Path Background */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path 
                            className="drop-shadow-lg path-animated" 
                            d="M 30,20 C 30,45 70,35 70,50 C 70,65 50,70 50,85" 
                            fill="none" 
                            stroke="#ec4913" 
                            strokeDasharray="3 3" 
                            strokeLinecap="round" 
                            strokeWidth="0.8"
                        />
                        <circle className="drop-shadow-md opacity-50" cx="30" cy="20" fill="#221510" r="4" stroke="#ec4913" strokeWidth="0.5" />
                        <circle className="drop-shadow-md opacity-50" cx="70" cy="50" fill="#221510" r="4" stroke="#ec4913" strokeWidth="0.5" />
                        <circle className="drop-shadow-md opacity-50" cx="50" cy="85" fill="#221510" r="4" stroke="#ec4913" strokeWidth="0.5" />
                    </svg>
                </div>

                {/* Game Mode Buttons */}
                <div className="relative z-10 flex flex-col justify-evenly flex-1 px-6 py-4 gap-4">
                    {/* الحجرة - Offline (Top Left) */}
                    <div className="flex justify-start w-full">
                        <GameModeButton
                            title="الحجرة"
                            subtitle="Offline"
                            icon="castle"
                            onClick={onStart}
                            delay={0}
                        />
                    </div>

                    {/* السبلة - Online (Top Right) */}
                    <div className="flex justify-end w-full">
                        <GameModeButton
                            title="السبلة"
                            subtitle="Online"
                            icon="groups"
                            onClick={onMultiplayer}
                            delay={0.1}
                            showLiveBadge
                        />
                    </div>

                    {/* الكبارية - Leaderboard (Center Bottom) */}
                    <div className="flex justify-center w-full mt-2">
                        <LeaderboardButton onClick={handleLeaderboardClick} />
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <div className="relative z-10 px-6 pb-6 pt-2">
                <div className="flex items-center justify-between gap-4">
                    {/* Souq Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSouqClick}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-wood-light/50 border border-white/5 hover:bg-wood-light transition-colors"
                    >
                        <span className="material-symbols-outlined text-sand text-2xl">storefront</span>
                        <span className="text-[10px] font-bold text-sand uppercase tracking-wider">Souq</span>
                    </motion.button>

                    {/* Coin Shop Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCoinShopClick}
                        className="flex flex-col items-center justify-center size-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] border border-[#FFD700]/50 hover:brightness-110 transition-all shadow-lg"
                    >
                        <span className="material-symbols-outlined text-wood-dark text-xl">toll</span>
                    </motion.button>

                    {/* Settings Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAdmin}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-wood-light/50 border border-white/5 hover:bg-wood-light transition-colors"
                    >
                        <span className="material-symbols-outlined text-sand text-2xl">settings</span>
                        <span className="text-[10px] font-bold text-sand uppercase tracking-wider">Settings</span>
                    </motion.button>
                </div>

                {/* Home Indicator */}
                <div className="mt-4 flex justify-center">
                    <div className="w-1/3 h-1 bg-white/10 rounded-full" />
                </div>
            </div>
            </div>
        </div>
    );
}

function GameModeButton({ title, subtitle, icon, onClick, delay = 0, showLiveBadge = false }) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="group relative w-[55%] aspect-square max-w-[200px] flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] bg-gradient-to-br from-wood-light to-wood-dark border-2 border-wood-light/50 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10"
        >
            {/* Live Badge */}
            {showLiveBadge && (
                <div className="absolute -top-3 -right-2 z-20 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-wood-dark animate-bounce">
                    LIVE
                </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-[2rem] bg-primary/0 group-hover:bg-primary/5 transition-colors" />
            
            {/* Top accent bar */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-sand/20 rounded-full" />
            
            {/* Icon container */}
            <div className="size-16 rounded-2xl bg-[#1e120e] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group-hover:ring-primary/60 transition-all mb-1">
                <span className="material-symbols-outlined text-4xl text-sand group-hover:text-primary transition-colors drop-shadow-lg">
                    {icon}
                </span>
            </div>

            {/* Text */}
            <div className="text-center w-full">
                <h3 className="text-xl font-bold text-white font-arabic leading-tight engraved-text">{title}</h3>
                <div className="w-8 h-0.5 bg-white/10 mx-auto my-1.5" />
                <p className="text-[10px] text-sand/80 font-bold uppercase tracking-[0.15em]">{subtitle}</p>
            </div>
        </motion.button>
    );
}

function LeaderboardButton({ onClick }) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="w-full max-w-[320px] group relative flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-wood-light via-[#2a1b17] to-wood-light border-2 border-wood-light/50 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#FFD700]/40 overflow-hidden"
        >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            {/* Icon */}
            <div className="size-14 rounded-xl bg-[#1e120e] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group-hover:ring-[#FFD700]/70 transition-all shrink-0">
                <span className="material-symbols-outlined text-3xl text-[#FFD700] drop-shadow-md">emoji_events</span>
            </div>

            {/* Text */}
            <div className="flex flex-col items-start flex-1 relative z-10">
                <h3 className="text-xl font-bold text-white font-arabic leading-tight engraved-text">الكبارية</h3>
                <p className="text-[10px] text-sand/70 font-bold uppercase tracking-widest mt-1">Leaderboards</p>
            </div>

            {/* Arrow */}
            <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-sm text-sand/50 group-hover:text-white">arrow_forward_ios</span>
            </div>
        </motion.button>
    );
}
