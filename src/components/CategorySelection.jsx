import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Shuffle, Clock, Hash, CheckSquare, Square, ChevronDown, ChevronUp, Play } from 'lucide-react';

export default function CategorySelection({ onBack }) {
    const navigate = useNavigate();
    const {
        startGame, startGameWithTopics, getCategorizedTopics, getTopicsBySubject, subjects,
        questionCount, setQuestionCount,
        timePerQuestion, setTimePerQuestion,
        selectedTypes, toggleType
    } = useGameStore();
    
    // Get only categorized topics (those with a subject) for game play
    const categorizedTopics = getCategorizedTopics();
    const topicsBySubject = getTopicsBySubject();
    
    // Track expanded subjects
    const [expandedSubjects, setExpandedSubjects] = useState(() => {
        // Expand all subjects by default
        return subjects.reduce((acc, s) => ({ ...acc, [s.id]: true }), {});
    });
    
    // Track selected topics (individual topic IDs)
    const [selectedTopics, setSelectedTopics] = useState([]);
    
    const toggleExpandSubject = (subjectId) => {
        setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
    };
    
    // Toggle all topics in a subject
    const toggleSelectSubject = (subjectId, e) => {
        e.stopPropagation();
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        const allSelected = subjectTopicIds.every(id => selectedTopics.includes(id));
        
        if (allSelected) {
            // Deselect all topics in this subject
            setSelectedTopics(prev => prev.filter(id => !subjectTopicIds.includes(id)));
        } else {
            // Select all topics in this subject
            setSelectedTopics(prev => [...new Set([...prev, ...subjectTopicIds])]);
        }
    };
    
    // Toggle individual topic
    const toggleSelectTopic = (topicId, e) => {
        e.stopPropagation();
        setSelectedTopics(prev => 
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };
    
    // Check if all topics in a subject are selected
    const isSubjectFullySelected = (subjectId) => {
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        return subjectTopicIds.length > 0 && subjectTopicIds.every(id => selectedTopics.includes(id));
    };
    
    // Check if some (but not all) topics in a subject are selected
    const isSubjectPartiallySelected = (subjectId) => {
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        const selectedCount = subjectTopicIds.filter(id => selectedTopics.includes(id)).length;
        return selectedCount > 0 && selectedCount < subjectTopicIds.length;
    };

    const handleStartGame = (categoryId) => {
        startGame(categoryId);
        navigate('/play');
    };
    
    const handleStartWithSelectedTopics = () => {
        if (selectedTopics.length === 0) return;
        startGameWithTopics(selectedTopics);
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
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-all shadow-md"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-sand drop-shadow-sm engraved-text">الحجرة</h2>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Settings */}
                <div className="space-y-4">
                    {/* Game Settings Panel */}
                    <div className="glass-panel rounded-2xl p-6 space-y-6">
                        <h3 className="text-xl font-bold text-sand mb-4 border-b border-white/10 pb-2">إعدادات اللعبة</h3>
                        
                        {/* Question Count */}
                        <div>
                            <div className="flex items-center gap-2 text-sand mb-2">
                                <Hash size={20} className="text-primary" />
                                <span className="font-bold">عدد الأسئلة: {questionCount}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full h-3 bg-wood-dark/50 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-sand/70 mt-1 font-bold">
                                <span>5</span>
                                <span>50</span>
                            </div>
                        </div>

                        {/* Time Per Question */}
                        <div>
                            <div className="flex items-center gap-2 text-sand mb-2">
                                <Clock size={20} className="text-primary" />
                                <span className="font-bold">الوقت: {timePerQuestion} ثانية</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="120"
                                step="10"
                                value={timePerQuestion}
                                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                className="w-full h-3 bg-wood-dark/50 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-sand/70 mt-1 font-bold">
                                <span>10s</span>
                                <span>120s</span>
                            </div>
                        </div>

                        {/* Question Types */}
                        <div>
                            <span className="font-bold text-sand block mb-3">أنواع الأسئلة:</span>
                            <div className="grid grid-cols-2 gap-3">
                                {allTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => toggleType(type.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedTypes.includes(type.id)
                                            ? 'bg-primary/10 border-primary/40 text-white'
                                            : 'bg-wood-dark/30 border-white/5 text-sand/70'
                                            }`}
                                    >
                                        {selectedTypes.includes(type.id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-sand/60" />}
                                        <span className="text-lg">{type.emoji}</span>
                                        <span className="truncate">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Subjects & Topics */}
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-sand mb-4 md:hidden">نقي مجال:</h3>

                    {/* Selected Topics Play Button */}
                    {selectedTopics.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartWithSelectedTopics}
                            className="w-full p-5 mb-4 rounded-2xl bg-gradient-to-r from-omani-green to-green-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-900/20 border border-white/20 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                            <Play size={24} fill="white" />
                            <span className="text-xl">ابدأ ({selectedTopics.length} موضوع مختار)</span>
                        </motion.button>
                    )}

                    {/* All Topics Button (Cocktail) */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStartGame(null)}
                        disabled={categorizedTopics.length === 0}
                        className="w-full p-5 mb-4 rounded-2xl bg-gradient-to-r from-omani-red to-red-700 text-white font-bold flex items-center justify-center gap-4 shadow-lg shadow-red-900/20 border border-white/20 relative overflow-hidden group shrink-0 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                        <Shuffle size={24} />
                        <span className="text-xl">كوكتيل (كل شي)</span>
                    </motion.button>
                    
                    <p className="text-center text-sand/70 text-sm font-bold mb-4">أو اختر مواد معينة ⬇️</p>

                    {/* Subjects with Topics */}
                    <div className="space-y-4 pb-20 md:pb-4">
                        {subjects.map((subject) => {
                            const subjectTopics = topicsBySubject[subject.id]?.topics || [];
                            if (subjectTopics.length === 0) return null;
                            
                            const isExpanded = expandedSubjects[subject.id] !== false;
                            const isFullySelected = isSubjectFullySelected(subject.id);
                            const isPartiallySelected = isSubjectPartiallySelected(subject.id);
                            
                            return (
                                <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-panel rounded-2xl overflow-hidden"
                                >
                                    {/* Subject Header */}
                                    <div className={`w-full p-4 flex items-center gap-3 transition-colors ${isFullySelected ? 'bg-primary/10' : isPartiallySelected ? 'bg-omani-gold/10' : 'hover:bg-white/5'}`}>
                                        {/* Selection Checkbox - selects/deselects all topics */}
                                        <button
                                            onClick={(e) => toggleSelectSubject(subject.id, e)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                isFullySelected 
                                                    ? 'bg-primary text-white' 
                                                    : isPartiallySelected 
                                                        ? 'bg-omani-gold text-white' 
                                                        : 'bg-wood-dark/50 text-sand/60 hover:bg-wood-dark/70'
                                            }`}
                                        >
                                            {isFullySelected ? <CheckSquare size={20} /> : isPartiallySelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                        
                                        {/* Clickable area for expand/collapse */}
                                        <button
                                            onClick={() => toggleExpandSubject(subject.id)}
                                            className="flex-1 flex items-center gap-3"
                                        >
                                            <span className="text-2xl">{subject.icon}</span>
                                            <span className="flex-1 text-right font-bold text-white text-lg">{subject.name}</span>
                                            <span className="text-xs text-sand/60 font-bold">{subjectTopics.length} مواضيع</span>
                                            {isExpanded ? <ChevronUp size={20} className="text-sand/60" /> : <ChevronDown size={20} className="text-sand/60" />}
                                        </button>
                                    </div>
                                    
                                    {/* Topics Grid */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-2 gap-3 p-4 pt-0">
                                                    {subjectTopics.map((topic, index) => {
                                                        const isTopicSelected = selectedTopics.includes(topic.id);
                                                        return (
                                                            <motion.button
                                                                key={topic.id}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: index * 0.03 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => toggleSelectTopic(topic.id, e)}
                                                                className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all p-3 flex flex-col items-center justify-center gap-2 h-24 ${
                                                                    isTopicSelected 
                                                                        ? 'bg-primary/10 ring-2 ring-primary/60' 
                                                                        : 'bg-wood-dark/40 hover:bg-wood-dark/50'
                                                                }`}
                                                            >
                                                                {/* Selection indicator */}
                                                                <div className={`absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                                                    isTopicSelected 
                                                                        ? 'bg-primary text-white' 
                                                                        : 'bg-wood-dark/50 text-sand/60'
                                                                }`}>
                                                                    {isTopicSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                                                </div>
                                                                
                                                                <span className="text-2xl">{topic.icon}</span>
                                                                <span className="text-xs font-bold text-sand text-center line-clamp-2">{topic.name}</span>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                        
                        {/* No categorized topics message */}
                        {categorizedTopics.length === 0 && (
                            <div className="text-center py-8 text-sand/70 font-bold">
                                <p>ما في مواضيع متاحة حالياً</p>
                                <p className="text-sm mt-2 text-sand/60">راجع المسؤول لإضافة مواضيع</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
