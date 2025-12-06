import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/شعار.png';
import singlePlayerBtn from '../assets/خطفة.png';
import multiplayerBtn from '../assets/السبلة.png';
import leaderboardBtn from '../assets/كبارية.png';

export default function MainMenu({ onStart, onAdmin, onMultiplayer }) {
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
        hover: { scale: 1.02, transition: { duration: 0.2 } },
        tap: { scale: 0.98 }
    };

    return (
        <div className="flex flex-col h-full items-center justify-start relative z-10 p-4 pt-8 overflow-y-auto">
            {/* Logo Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-6 flex justify-center"
            >
                <img
                    src={logo}
                    alt="Omani Game Logo"
                    className="w-32 md:w-40 h-auto object-contain drop-shadow-xl"
                />
            </motion.div>

            {/* Main Buttons Section - Stacked vertically */}
            <div className="flex flex-col gap-3 w-full max-w-sm items-center">
                {/* Singleplayer Button - Large */}
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
                        className="w-full h-auto rounded-2xl shadow-lg"
                    />
                </motion.button>

                {/* Multiplayer Button - Large */}
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
                        className="w-full h-auto rounded-2xl shadow-lg"
                    />
                </motion.button>

                {/* Bottom Row - Two smaller buttons side by side */}
                <div className="flex gap-3 w-full">
                    {/* Settings Button */}
                    <motion.button
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        onClick={onAdmin}
                        className="flex-1 bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center gap-2"
                    >
                        <span className="text-3xl">⚙️</span>
                        <span className="text-gray-800 font-bold text-sm">إعدادات</span>
                    </motion.button>

                    {/* Leaderboard Button */}
                    <motion.button
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        onClick={() => { }}
                        className="flex-1"
                    >
                        <img
                            src={leaderboardBtn}
                            alt="الكبارية - Leaderboards"
                            className="w-full h-full object-cover rounded-2xl shadow-lg"
                        />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
