import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, Check, X } from 'lucide-react';

export default function RoundLeaderboard({
    results,
    correctAnswer,
    questionIndex,
    totalQuestions,
    isGameOver,
    winner,
    onPlayAgain,
    onLeave
}) {
    const getPositionStyle = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-600';
            case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-500';
            case 3: return 'bg-gradient-to-r from-amber-600 to-orange-700 border-amber-800';
            default: return 'bg-white/80 border-gray-200';
        }
    };

    const getPositionIcon = (rank) => {
        if (rank === 1) return <Trophy size={24} className="text-yellow-300" />;
        if (rank === 2) return <Medal size={24} className="text-gray-100" />;
        if (rank === 3) return <Medal size={24} className="text-amber-300" />;
        return <span className="text-omani-dark font-bold">{rank}</span>;
    };

    const getTextColor = (rank) => {
        if (rank <= 3) return 'text-white';
        return 'text-omani-dark';
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4"
            >
                {isGameOver ? (
                    <>
                        <h2 className="text-3xl font-black text-omani-gold mb-2">🏆 انتهت اللعبة!</h2>
                        <p className="text-omani-dark text-lg font-bold">الفائز هو {winner?.playerName}!</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-black text-omani-dark">الكبارية</h2>
                        <p className="text-gray-600 font-bold">السؤال {questionIndex + 1} من {totalQuestions}</p>
                    </>
                )}
            </motion.div>

            {/* Correct Answer */}
            {!isGameOver && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 border-2 border-green-500 rounded-xl p-3 mb-4 text-center"
                >
                    <p className="text-green-700 text-sm font-bold">الجواب الصح:</p>
                    <p className="text-green-800 font-black text-lg">
                        {Array.isArray(correctAnswer) ? correctAnswer.join(' → ') : correctAnswer}
                    </p>
                </motion.div>
            )}

            {/* Leaderboard */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
                {results.map((result, index) => (
                    <motion.div
                        key={result.playerId}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 ${getPositionStyle(result.rank)}`}
                    >
                        {/* Rank */}
                        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                            {getPositionIcon(result.rank)}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1">
                            <p className={`${getTextColor(result.rank)} font-bold`}>{result.playerName}</p>
                            <div className="flex items-center gap-2 text-sm">
                                {result.isCorrect ? (
                                    <span className={`${result.rank <= 3 ? 'text-green-200' : 'text-green-600'} flex items-center gap-1 font-bold`}>
                                        <Check size={14} /> +{result.points}
                                    </span>
                                ) : (
                                    <span className={`${result.rank <= 3 ? 'text-red-200' : 'text-red-500'} flex items-center gap-1 font-bold`}>
                                        <X size={14} /> +0
                                    </span>
                                )}
                                <span className={`${result.rank <= 3 ? 'text-white/70' : 'text-gray-500'} flex items-center gap-1`}>
                                    <Clock size={12} /> {result.timeTaken.toFixed(1)}s
                                </span>
                            </div>
                        </div>

                        {/* Total Score */}
                        <div className="text-right">
                            <p className={`text-2xl font-black ${getTextColor(result.rank)}`}>{result.totalScore}</p>
                            <p className={`${result.rank <= 3 ? 'text-white/70' : 'text-gray-500'} text-xs font-bold`}>نقطة</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Game Over Actions */}
            {isGameOver && (
                <div className="flex gap-3">
                    <button
                        onClick={onLeave}
                        className="flex-1 p-4 rounded-xl glass-card text-omani-dark font-bold hover:bg-white/90"
                    >
                        خروج
                    </button>
                    <button
                        onClick={onPlayAgain}
                        className="flex-1 p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
                    >
                        لعب مرة ثانية
                    </button>
                </div>
            )}

            {/* Next Question Timer */}
            {!isGameOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-600 font-bold"
                >
                    الجولة الجاية...
                </motion.div>
            )}
        </div>
    );
}
