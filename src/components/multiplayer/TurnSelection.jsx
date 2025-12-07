import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { CheckSquare, Square, User } from 'lucide-react';

import socketService from '../../services/socketService';

export default function TurnSelection({ onSelectCategory, onSelectType }) {
    const {
        categories,
        turnPhase, // 'category' or 'type'
        categorySelectorId,
        typeSelectorId,
        players,
        turnIndex,
        turnCategoryIds
    } = useGameStore();

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

    const allTypes = [
        { id: 'multiple-choice', label: 'اختيار', emoji: '🔘' },
        { id: 'fill-blank', label: 'كمل', emoji: '✏️' },
        { id: 'order', label: 'ترتيب', emoji: '📋' },
        { id: 'match', label: 'توصيل', emoji: '🔗' },
    ];

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {turnPhase === 'category' ? 'اختيار المجال' : 'اختيار نوع السؤال'}
                </h2>

                {/* Active Player Indicator */}
                <div className="flex items-center justify-center gap-2 bg-white/10 rounded-full py-2 px-4 w-fit mx-auto">
                    <User size={20} className="text-omani-gold" />
                    <span className="text-white font-bold">
                        الدور عند: {turnPhase === 'category' ? categorySelector?.name : typeSelector?.name}
                    </span>
                </div>
            </div>

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
                                className={`bg-white p-6 rounded-2xl text-gray-800 font-bold flex items-center gap-4 shadow-lg border-b-4 border-gray-300 h-32 ${!isMyTurnToPickType ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            className="mt-8 text-center bg-black/40 backdrop-blur-md rounded-xl p-4"
                        >
                            <p className="text-white text-lg animate-pulse">
                                نتريا {turnPhase === 'category' ? categorySelector?.name : typeSelector?.name} يختار...
                            </p>
                        </motion.div>
                    )}
            </div>
        </div>
    );
}
