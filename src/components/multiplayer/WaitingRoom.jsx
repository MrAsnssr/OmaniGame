import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Copy, Play, ArrowLeft } from 'lucide-react';
import Button from '../Button';

export default function WaitingRoom({
    roomCode,
    players,
    isHost,
    onStart,
    onLeave,
    canStart
}) {
    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onLeave}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-omani-dark">غرفة الانتظار</h2>
            </div>

            {/* Room Code */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-4 mb-4 text-center"
            >
                <p className="text-gray-600 text-sm mb-1 font-bold">مفتاح السبلة</p>
                <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-black text-omani-red tracking-widest">{roomCode}</span>
                    <button
                        onClick={copyRoomCode}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <Copy size={20} />
                    </button>
                </div>
                <p className="text-gray-500 text-xs mt-2 font-bold">طرش المفتاح لربعك!</p>
            </motion.div>

            {/* Players List */}
            <div className="flex-1 glass-panel rounded-2xl p-4 mb-4 overflow-y-auto min-h-0">
                <div className="flex items-center gap-2 text-omani-dark mb-3">
                    <Users size={20} className="text-omani-green" />
                    <span className="font-bold">الشباب ({players.length}/10)</span>
                </div>

                <div className="space-y-2">
                    {players.map((player, index) => (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-xl ${player.isHost ? 'bg-omani-gold/20 border border-omani-gold/50' : 'bg-gray-50'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-omani-dark font-bold flex-1">{player.name}</span>
                            {player.isHost && (
                                <Crown size={20} className="text-omani-gold" />
                            )}
                            {!player.connected && (
                                <span className="text-red-500 text-xs font-bold">فصل</span>
                            )}
                        </motion.div>
                    ))}
                </div>

                {players.length < 2 && (
                    <p className="text-gray-500 text-center mt-4 text-sm font-bold">
                        ننتظر الشباب يدخلوا...
                    </p>
                )}
            </div>

            {/* Start Button (Host Only) */}
            {isHost ? (
                <Button
                    onClick={onStart}
                    disabled={!canStart}
                    className="w-full"
                >
                    <Play size={20} className="mr-2" />
                    {canStart ? 'بدينا!' : 'لازم 2 عالأقل'}
                </Button>
            ) : (
                <div className="glass-panel rounded-xl p-4 text-center">
                    <p className="text-gray-700 font-bold">ننتظر راعي الغرفة يبدأ...</p>
                </div>
            )}
        </div>
    );
}
