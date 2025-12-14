import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings } from 'lucide-react';
import logo from '../assets/شعار.png';
import singlePlayerBtn from '../assets/خطفة.png';
import multiplayerBtn from '../assets/السبلة.png';
import leaderboardBtn from '../assets/كبارية.png';

export default function MainMenu({ onStart, onAdmin, onMultiplayer, onLogin, user, onLogout }) {
    const buttonVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                type: "spring",
                stiffness: 120,
                damping: 12
            }
        }),
        hover: { scale: 1.03, transition: { duration: 0.2 } },
        tap: { scale: 0.97 }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center relative z-10 p-4">
            {/* Login/User Button - Top Left Corner */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={user ? onAdmin : onLogin}
                className="absolute top-6 left-6 w-12 h-12 glass-card rounded-full flex items-center justify-center overflow-hidden z-20 text-omani-brown hover:text-omani-red transition-colors"
                title={user ? 'الإعدادات' : 'تسجيل الدخول'}
            >
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : user ? (
                    <span className="text-lg font-bold text-omani-red">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                ) : (
                    <User size={24} />
                )}
            </motion.button>

            {/* Settings Button - Top Right Corner */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdmin}
                className="absolute top-6 right-6 w-12 h-12 glass-card rounded-full flex items-center justify-center text-omani-brown hover:text-omani-red transition-colors z-20"
                title="إعدادات"
            >
                <Settings size={24} />
            </motion.button>

            {/* Logo Section - BIGGER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-8 flex justify-center"
            >
                <img
                    src={logo}
                    alt="Omani Game Logo"
                    className="w-48 md:w-64 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
            </motion.div>

            {/* All Main Buttons - Full width for mobile */}
            <div className="flex flex-col gap-5 w-full max-w-sm items-center px-4">
                {/* Row 1: Singleplayer (خطفة) */}
                <motion.button
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onClick={onStart}
                    className="w-full relative group"
                >
                    <div className="absolute inset-0 bg-omani-gold blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-xl" />
                    <img
                        src={singlePlayerBtn}
                        alt="خطفة - Singleplayer"
                        className="w-full h-auto rounded-xl shadow-xl relative z-10 border-2 border-white/20"
                    />
                </motion.button>

                {/* Row 2: Multiplayer (السبلة) */}
                <motion.button
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onClick={onMultiplayer}
                    className="w-full relative group"
                >
                    <div className="absolute inset-0 bg-omani-green blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-xl" />
                    <img
                        src={multiplayerBtn}
                        alt="السبلة - Multiplayer"
                        className="w-full h-auto rounded-xl shadow-xl relative z-10 border-2 border-white/20"
                    />
                </motion.button>

                {/* Row 3: Leaderboard (الكبارية) */}
                <motion.button
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onClick={() => { }}
                    className="w-full relative group"
                >
                     <div className="absolute inset-0 bg-omani-red blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-xl" />
                    <img
                        src={leaderboardBtn}
                        alt="الكبارية - Leaderboards"
                        className="w-full h-auto rounded-xl shadow-xl relative z-10 border-2 border-white/20"
                    />
                </motion.button>
            </div>
        </div>
    );
}
