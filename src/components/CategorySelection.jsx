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
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack || (() => navigate('/'))}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-gray-800 transition-all shadow-md"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-omani-red to-omani-brown drop-shadow-sm">خطفة</h2>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Settings */}
                <div className="space-y-4">
                    {/* Game Settings Panel */}
                    <div className="glass-panel rounded-2xl p-6 space-y-6">
                        <h3 className="text-xl font-bold text-omani-brown mb-4 border-b border-omani-brown/10 pb-2">إعدادات اللعبة</h3>
                        
                        {/* Question Count */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-800 mb-2">
                                <Hash size={20} className="text-omani-red" />
                                <span className="font-bold">عدد الأسئلة: {questionCount}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-omani-red"
                            />
                            <div className="flex justify-between text-xs text-gray-700 mt-1 font-bold">
                                <span>5</span>
                                <span>50</span>
                            </div>
                        </div>

                        {/* Time Per Question */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-800 mb-2">
                                <Clock size={20} className="text-omani-green" />
                                <span className="font-bold">الوقت: {timePerQuestion} ثانية</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="120"
                                step="10"
                                value={timePerQuestion}
                                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-omani-green"
                            />
                            <div className="flex justify-between text-xs text-gray-700 mt-1 font-bold">
                                <span>10s</span>
                                <span>120s</span>
                            </div>
                        </div>

                        {/* Question Types */}
                        <div>
                            <span className="font-bold text-gray-800 block mb-3">أنواع الأسئلة:</span>
                            <div className="grid grid-cols-2 gap-3">
                                {allTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => toggleType(type.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedTypes.includes(type.id)
                                            ? 'bg-omani-sand/30 border-omani-gold text-omani-brown'
                                            : 'bg-white/50 border-transparent text-gray-600 grayscale'
                                            }`}
                                    >
                                        {selectedTypes.includes(type.id) ? <CheckSquare size={18} className="text-omani-green" /> : <Square size={18} />}
                                        <span className="text-lg">{type.emoji}</span>
                                        <span className="truncate">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Categories */}
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-omani-brown mb-4 md:hidden">نقي مجال:</h3>

                    {/* All Categories Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStartGame(null)}
                        className="w-full p-6 mb-6 rounded-2xl bg-gradient-to-r from-omani-red to-red-700 text-white font-bold flex items-center justify-center gap-4 shadow-lg shadow-red-900/20 border border-white/20 relative overflow-hidden group shrink-0"
                    >
                         <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                        <Shuffle size={28} />
                        <span className="text-2xl">كوكتيل (كل شي)</span>
                    </motion.button>

                    {/* Category Grid */}
                    <div className="pr-1 pl-1">
                        <div className="grid grid-cols-2 gap-4 pb-20 md:pb-4">
                            {categories.map((category, index) => (
                                <motion.button
                                    key={category.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => handleStartGame(category.id)}
                                    className={`glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 h-36 relative overflow-hidden group`}
                                >
                                    <div className={`absolute inset-0 opacity-10 ${category.color ? category.color.replace('bg-', 'bg-') : 'bg-gray-500'}`} />
                                    <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform">{category.icon}</span>
                                    <span className="text-sm font-bold text-gray-800 text-center">{category.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
