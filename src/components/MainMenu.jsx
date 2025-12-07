import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
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
                className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center overflow-hidden z-20"
                title={user ? 'الإعدادات' : 'تسجيل الدخول'}
            >
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : user ? (
                    <span className="text-sm font-bold text-gray-700">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                ) : (
                    <User size={20} className="text-gray-600" />
                )}
            </motion.button>

            {/* Settings Button - Top Right Corner */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdmin}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-xl z-20"
                title="إعدادات"
            >
                ⚙️
            </motion.button>

            {/* Logo Section - BIGGER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-6 flex justify-center"
            >
                <img
                    src={logo}
                    alt="Omani Game Logo"
                    className="w-40 md:w-52 h-auto object-contain drop-shadow-xl"
                />
            </motion.div>

            {/* All Main Buttons - Full width for mobile */}
            <div className="flex flex-col gap-4 w-full max-w-md items-center px-4">
                {/* Row 1: Singleplayer (خطفة) */}
                <motion.button
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    onClick={onStart}
                    className="w-full"
                >
                    <img
                        src={singlePlayerBtn}
                        alt="خطفة - Singleplayer"
                        className="w-full h-auto rounded-xl shadow-lg"
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
                    className="w-full"
                >
                    <img
                        src={multiplayerBtn}
                        alt="السبلة - Multiplayer"
                        className="w-full h-auto rounded-xl shadow-lg"
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
                    className="w-full"
                >
                    <img
                        src={leaderboardBtn}
                        alt="الكبارية - Leaderboards"
                        className="w-full h-auto rounded-xl shadow-lg"
                    />
                </motion.button>
            </div>
        </div>
    );
}
