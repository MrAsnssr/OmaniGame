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
        <div className="flex flex-col h-full items-center justify-center relative z-10 p-4">
            {/* Logo Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-4 flex justify-center"
            >
                <img
                    src={logo}
                    alt="Omani Game Logo"
                    className="w-28 md:w-36 h-auto object-contain drop-shadow-xl"
                />
            </motion.div>

            {/* All Buttons in a container */}
            <div className="flex flex-col gap-3 w-full max-w-md items-center px-2">
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

                {/* Bottom Row - Two equal buttons */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    {/* Settings Button */}
                    <motion.button
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        onClick={onAdmin}
                        className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center gap-1 aspect-[4/3]"
                    >
                        <span className="text-4xl">⚙️</span>
                        <span className="text-gray-700 font-bold text-sm">إعدادات</span>
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
                        className="w-full overflow-hidden rounded-2xl shadow-lg"
                    >
                        <img
                            src={leaderboardBtn}
                            alt="الكبارية - Leaderboards"
                            className="w-full h-full object-contain bg-white rounded-2xl"
                        />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
