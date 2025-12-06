import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/شعار.png';
import singlePlayerBtn from '../assets/خطفة.png';
import multiplayerBtn from '../assets/السبلة.png';
import leaderboardBtn from '../assets/كبارية.png';

export default function MainMenu({ onStart, onAdmin, onMultiplayer }) {
    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }),
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center relative z-10 p-4">
            {/* Logo Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8 w-full flex justify-center"
            >
                <img
                    src={logo}
                    alt="Omani Game Logo"
                    className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl filter"
                />
            </motion.div>

            {/* Buttons Section */}
            <div className="flex flex-col gap-6 w-full items-center">
                <motion.button
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={variants}
                    onClick={onStart}
                    className="relative group flex justify-center"
                >
                    <img src={singlePlayerBtn} alt="Singleplayer" className="h-24 md:h-32 w-auto drop-shadow-lg" />
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform scale-75" />
                </motion.button>

                <motion.button
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={variants}
                    onClick={onMultiplayer}
                    className="relative group flex justify-center"
                >
                    <img src={multiplayerBtn} alt="Multiplayer" className="h-24 md:h-32 w-auto drop-shadow-lg" />
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform scale-75" />
                </motion.button>

                <motion.button
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={variants}
                    onClick={() => { }}
                    className="relative group flex justify-center"
                >
                    <img src={leaderboardBtn} alt="Leaderboards" className="h-24 md:h-32 w-auto drop-shadow-lg" />
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform scale-75" />
                </motion.button>
            </div>

            {/* Admin Button (Hidden/Subtle) */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                onClick={onAdmin}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                title="Admin Settings"
            >
                ⚙️
            </motion.button>
        </div>
    );
}
