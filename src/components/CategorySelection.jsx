import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Shuffle, Clock, Hash, CheckSquare, Square } from 'lucide-react';

export default function CategorySelection({ onBack }) {
    const navigate = useNavigate();
    const {
        categories, startGame,
        questionCount, setQuestionCount,
        timePerQuestion, setTimePerQuestion,
        selectedTypes, toggleType
    } = useGameStore();

    const handleStartGame = (categoryId) => {
        startGame(categoryId);
        navigate('/play');
    };


    const allTypes = [
        { id: 'multiple-choice', label: 'اختيار', emoji: '🔘' },
        { id: 'fill-blank', label: 'كمل', emoji: '✏️' },
        { id: 'order', label: 'ترتيب', emoji: '📋' },
        { id: 'match', label: 'توصيل', emoji: '🔗' },
    ];

    return (
        <div className="flex flex-col h-full min-h-0 p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack || (() => navigate('/'))}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">خطفة</h2>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Settings */}
                <div className="space-y-4 pr-2">
                    {/* Game Settings Panel */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-4">
                        {/* Question Count */}
                        <div>
                            <div className="flex items-center gap-2 text-white mb-2">
                                <Hash size={18} />
                                <span className="font-bold">عدد الأسئلة: {questionCount}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-white/50 mt-1">
                                <span>5</span>
                                <span>50</span>
                            </div>
                        </div>

                        {/* Time Per Question */}
                        <div>
                            <div className="flex items-center gap-2 text-white mb-2">
                                <Clock size={18} />
                                <span className="font-bold">الوقت: {timePerQuestion} ثانية</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="120"
                                step="10"
                                value={timePerQuestion}
                                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-white/50 mt-1">
                                <span>10s</span>
                                <span>120s</span>
                            </div>
                        </div>

                        {/* Question Types */}
                        <div>
                            <span className="font-bold text-white block mb-2">أنواع الأسئلة:</span>
                            <div className="grid grid-cols-2 gap-2">
                                {allTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => toggleType(type.id)}
                                        className={`flex items-center gap-2 p-2 rounded-lg font-bold text-sm transition-colors ${selectedTypes.includes(type.id)
                                            ? 'bg-white text-gray-800'
                                            : 'bg-white/20 text-white/60'
                                            }`}
                                    >
                                        {selectedTypes.includes(type.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                        <span>{type.emoji}</span>
                                        <span className="truncate">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Categories */}
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3 md:hidden">نقي مجال:</h3>

                    {/* All Categories Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStartGame(null)}
                        className="w-full p-4 mb-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg border-b-4 border-amber-700 shrink-0"
                    >
                        <Shuffle size={24} />
                        كوكتيل
                    </motion.button>

                    {/* Category Grid */}
                    <div className="pr-2">
                        <div className="grid grid-cols-2 gap-4 pb-20 md:pb-4">
                            {categories.map((category, index) => (
                                <motion.button
                                    key={category.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStartGame(category.id)}
                                    className={`${category.color} p-4 rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-2 shadow-lg border-b-4 border-black/20 h-32`}
                                >
                                    <span className="text-3xl">{category.icon}</span>
                                    <span className="text-xs text-center">{category.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
