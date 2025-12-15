import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { CheckCircle, User, Clock } from 'lucide-react';

import socketService from '../../services/socketService';

const SELECTION_TIME = 15; // 15 seconds to pick

export default function TurnSelection({ onSelectCategory, onSelectType }) {
    const {
        categories,
        turnPhase, // 'category' or 'type'
        categorySelectorId,
        typeSelectorId,
        players,
        turnIndex,
        turnCategoryIds,
        selectedTurnCategoryId
    } = useGameStore();

    const [timeLeft, setTimeLeft] = useState(SELECTION_TIME);

    const currentPlayerId = socketService.getSocket()?.id;
    const categorySelector = players.find(p => p.id === categorySelectorId);
    const typeSelector = players.find(p => p.id === typeSelectorId);

    const isMyTurnToPickCategory = currentPlayerId === categorySelectorId && turnPhase === 'category';
    const isMyTurnToPickType = currentPlayerId === typeSelectorId && turnPhase === 'type';

    // Get categories for this turn from store
    const turnCategories = useMemo(() => {
        if (!turnCategoryIds || turnCategoryIds.length === 0) return [];
        return categories.filter(c => turnCategoryIds.includes(c.id));
    }, [categories, turnCategoryIds]);

    // Get the selected category object for display during type phase
    const selectedCategory = useMemo(() => {
        if (!selectedTurnCategoryId) return null;
        return categories.find(c => c.id === selectedTurnCategoryId);
    }, [categories, selectedTurnCategoryId]);

    const allTypes = [
        { id: 'multiple-choice', label: 'اختيار', emoji: '🔘' },
        { id: 'fill-blank', label: 'كمل', emoji: '✏️' },
        { id: 'order', label: 'ترتيب', emoji: '📋' },
        { id: 'match', label: 'توصيل', emoji: '🔗' },
    ];

    // Reset timer when phase changes
    useEffect(() => {
        setTimeLeft(SELECTION_TIME);
    }, [turnPhase, turnIndex]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            // Auto-select random option when time runs out
            if (isMyTurnToPickCategory && turnCategories.length > 0) {
                const randomCat = turnCategories[Math.floor(Math.random() * turnCategories.length)];
                onSelectCategory(randomCat.id);
            } else if (isMyTurnToPickType && allTypes.length > 0) {
                const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
                onSelectType(randomType.id);
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isMyTurnToPickCategory, isMyTurnToPickType, turnCategories, allTypes, onSelectCategory, onSelectType]);

    // Timer progress percentage
    const timerProgress = (timeLeft / SELECTION_TIME) * 100;
    const timerColor = timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-yellow-600' : 'text-omani-dark';

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-2xl font-black text-omani-dark mb-2">
                    {turnPhase === 'category' ? 'اختيار المجال' : 'اختيار نوع السؤال'}
                </h2>

                {/* Timer Display */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock size={20} className={timerColor} />
                    <span className={`text-2xl font-black ${timerColor}`}>{timeLeft}</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${timeLeft <= 5 ? 'bg-red-400' : timeLeft <= 10 ? 'bg-yellow-400' : 'bg-omani-gold'}`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${timerProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Active Player Indicator */}
                <div className="flex items-center justify-center gap-2 glass-panel rounded-full py-2 px-4 w-fit mx-auto">
                    <User size={20} className="text-omani-gold" />
                    <span className="text-omani-dark font-bold">
                        الدور عند: {turnPhase === 'category' ? categorySelector?.name : typeSelector?.name}
                    </span>
                </div>
            </div>

            {/* Show selected category during type selection phase */}
            {turnPhase === 'type' && selectedCategory && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${selectedCategory.color} p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl mb-4 border-4 border-omani-gold ring-4 ring-omani-gold/50`}
                >
                    <CheckCircle size={28} className="text-omani-gold" />
                    <span className="text-3xl">{selectedCategory.icon}</span>
                    <span className="text-lg">{selectedCategory.name}</span>
                </motion.div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0">
                {/* Category Selection Phase */}
                {turnPhase === 'category' && (
                    <div className="flex flex-col gap-4 pb-4">
                        {turnCategories.map((category, index) => (
                            <motion.button
                                key={category.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileTap={isMyTurnToPickCategory ? { scale: 0.95 } : {}}
                                onClick={() => isMyTurnToPickCategory && onSelectCategory(category.id)}
                                disabled={!isMyTurnToPickCategory}
                                className={`${category.color} p-6 rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-2 shadow-lg border-b-4 border-black/20 h-32 ${!isMyTurnToPickCategory ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                                <span className="text-4xl">{category.icon}</span>
                                <span className="text-sm text-center">{category.name}</span>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Type Selection Phase */}
                {turnPhase === 'type' && (
                    <div className="flex flex-col gap-4 pb-4">
                        {allTypes.map((type, index) => (
                            <motion.button
                                key={type.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileTap={isMyTurnToPickType ? { scale: 0.95 } : {}}
                                onClick={() => isMyTurnToPickType && onSelectType(type.id)}
                                disabled={!isMyTurnToPickType}
                                className={`bg-white p-6 rounded-2xl text-gray-800 font-bold flex items-center gap-4 shadow-lg border-b-4 border-gray-300 h-24 ${!isMyTurnToPickType ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-3xl">{type.emoji}</span>
                                <span className="text-lg">{type.label}</span>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Waiting Message */}
                {((turnPhase === 'category' && !isMyTurnToPickCategory) ||
                    (turnPhase === 'type' && !isMyTurnToPickType)) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 text-center glass-panel rounded-xl p-4"
                        >
                            <p className="text-omani-brown text-lg animate-pulse font-bold">
                                نتريا {turnPhase === 'category' ? categorySelector?.name : typeSelector?.name} يختار...
                            </p>
                        </motion.div>
                    )}
            </div>
        </div>
    );
}
