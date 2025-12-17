import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, LogIn, ArrowLeft, Hash, Clock, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../Button';
import { useGameStore } from '../../store/gameStore';

export default function MultiplayerLobby({ onBack, onRoomCreated, onRoomJoined }) {
    const {
        questionCount, setQuestionCount,
        timePerQuestion, setTimePerQuestion,
        selectedTypes, toggleType,
        categories, subjects, getCategorizedTopics, getTopicsBySubject,
        setMultiplayerSelectedTopics
    } = useGameStore();

    const [mode, setMode] = useState('select'); // select, create, join
    const [gameMode, setGameMode] = useState('standard'); // standard, turn-based
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Topic selection
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});
    
    const categorizedTopics = getCategorizedTopics();
    const topicsBySubject = getTopicsBySubject();
    
    const toggleExpandSubject = (subjectId) => {
        setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
    };
    
    const toggleSelectTopic = (topicId) => {
        setSelectedTopics(prev => 
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };
    
    const toggleSelectAllSubjectTopics = (subjectId) => {
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        const allSelected = subjectTopicIds.every(id => selectedTopics.includes(id));
        
        if (allSelected) {
            setSelectedTopics(prev => prev.filter(id => !subjectTopicIds.includes(id)));
        } else {
            setSelectedTopics(prev => [...new Set([...prev, ...subjectTopicIds])]);
        }
    };
    
    const selectAllTopics = () => {
        setSelectedTopics(categorizedTopics.map(t => t.id));
    };
    
    const clearAllTopics = () => {
        setSelectedTopics([]);
    };
    
    const isSubjectFullySelected = (subjectId) => {
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        return subjectTopicIds.length > 0 && subjectTopicIds.every(id => selectedTopics.includes(id));
    };
    
    const isSubjectPartiallySelected = (subjectId) => {
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        const selectedCount = subjectTopicIds.filter(id => selectedTopics.includes(id)).length;
        return selectedCount > 0 && selectedCount < subjectTopicIds.length;
    };
    
    // Minimum topics for turn-based
    const minTopicsForTurnBased = 3;

    const allTypes = [
        { id: 'multiple-choice', label: 'اختيار', emoji: '🔘' },
        { id: 'fill-blank', label: 'كمل', emoji: '✏️' },
        { id: 'order', label: 'ترتيب', emoji: '📋' },
        { id: 'match', label: 'توصيل', emoji: '🔗' },
    ];

    const handleCreate = () => {
        if (!playerName.trim()) {
            setError('اكتب اسمك لو سمحت');
            return;
        }
        if (selectedTopics.length === 0) {
            setError('اختار موضوع واحد على الأقل');
            return;
        }
        if (gameMode === 'turn-based' && selectedTopics.length < minTopicsForTurnBased) {
            setError(`اختار ${minTopicsForTurnBased} مواضيع على الأقل للعب بالدور`);
            return;
        }
        setIsLoading(true);
        setError('');
        // Store selected topics in the store for later use when starting game
        setMultiplayerSelectedTopics(selectedTopics);
        onRoomCreated(playerName.trim(), gameMode, selectedTopics);
    };

    const handleJoin = () => {
        if (!playerName.trim()) {
            setError('اكتب اسمك لو سمحت');
            return;
        }
        if (!roomCode.trim() || roomCode.length !== 6) {
            setError('كتب مفتاح السبلة صح (6 حروف)');
            return;
        }
        setIsLoading(true);
        setError('');
        onRoomJoined(roomCode.toUpperCase(), playerName.trim());
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={mode === 'select' ? onBack : () => setMode('select')}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-omani-dark">
                    {mode === 'select' ? 'السبلة' : mode === 'create' ? 'سبلة جديدة' : 'دخل السبلة'}
                </h2>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-0">
                {mode === 'select' && (
                    <div className="flex flex-col items-center justify-center flex-1 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-4"
                        >
                            <Users size={64} className="text-omani-gold mx-auto mb-2" />
                            <p className="text-omani-brown font-bold">لعب مع ربعك وتتحداهم!</p>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMode('create')}
                            className="w-full max-w-xs p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg border-b-4 border-green-700"
                        >
                            <Plus size={24} />
                            سبلة جديدة
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMode('join')}
                            className="w-full max-w-xs p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg border-b-4 border-blue-700"
                        >
                            <LogIn size={24} />
                            دخل السبلة
                        </motion.button>
                    </div>
                )}

                {mode === 'create' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-2 h-full overflow-hidden"
                    >
                        {/* Nickname */}
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="اسمك الكريم"
                            maxLength={15}
                            className="w-full p-4 rounded-xl bg-white/90 text-gray-800 font-bold text-center placeholder-gray-600 text-lg"
                        />

                        {/* Game Settings Panel */}
                        <div className="glass-panel rounded-2xl p-3 space-y-2 flex-1 overflow-y-auto min-h-0">
                            <h3 className="text-omani-dark font-bold text-center">إعدادات اللعب</h3>

                            {/* Game Mode Toggle */}
                            <div className="flex bg-gray-200 p-1 rounded-xl">
                                <button
                                    onClick={() => setGameMode('standard')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === 'standard'
                                        ? 'bg-white text-gray-800 shadow-md'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    عادي
                                </button>
                                <button
                                    onClick={() => setGameMode('turn-based')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === 'turn-based'
                                        ? 'bg-omani-gold text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    بالدور
                                </button>
                            </div>

                            {/* Question Count */}
                            <div>
                                <div className="flex items-center gap-2 text-omani-dark mb-2">
                                    <Hash size={16} className="text-omani-red" />
                                    <span className="font-bold text-sm">عدد الأسئلة: {questionCount}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    step="5"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-omani-red"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-1 font-bold">
                                    <span>5</span>
                                    <span>30</span>
                                </div>
                            </div>

                            {/* Time Per Question */}
                            <div>
                                <div className="flex items-center gap-2 text-omani-dark mb-2">
                                    <Clock size={16} className="text-omani-green" />
                                    <span className="font-bold text-sm">الوقت: {timePerQuestion} ثانية</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="60"
                                    step="5"
                                    value={timePerQuestion}
                                    onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-omani-green"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-1 font-bold">
                                    <span>10s</span>
                                    <span>60s</span>
                                </div>
                            </div>

                            {/* Question Types (Only for Standard Mode) */}
                            {gameMode === 'standard' && (
                                <div>
                                    <span className="font-bold text-omani-dark text-sm block mb-2">أنواع الأسئلة:</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {allTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => toggleType(type.id)}
                                                className={`flex items-center gap-2 p-2 rounded-lg font-bold text-xs transition-colors ${selectedTypes.includes(type.id)
                                                    ? 'bg-omani-green text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {selectedTypes.includes(type.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                                                <span>{type.emoji}</span>
                                                <span className="truncate">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {gameMode === 'turn-based' && (
                                <div className="bg-omani-gold/10 rounded-lg p-3 text-xs text-omani-brown text-center font-bold border border-omani-gold/30">
                                    كل واحد يختار المجال ونوع السؤال بدوره!
                                </div>
                            )}
                            
                            {/* Topic Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-omani-dark text-sm">
                                        المواضيع: {selectedTopics.length} مختار
                                        {gameMode === 'turn-based' && selectedTopics.length < minTopicsForTurnBased && (
                                            <span className="text-red-500 text-xs mr-2">(لازم {minTopicsForTurnBased}+)</span>
                                        )}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={selectAllTopics}
                                            className="text-xs px-2 py-1 bg-omani-green/20 text-omani-green rounded font-bold"
                                        >
                                            الكل
                                        </button>
                                        <button
                                            onClick={clearAllTopics}
                                            className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded font-bold"
                                        >
                                            مسح
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {subjects.map((subject) => {
                                        const subjectTopics = topicsBySubject[subject.id]?.topics || [];
                                        if (subjectTopics.length === 0) return null;
                                        
                                        const isExpanded = expandedSubjects[subject.id];
                                        const isFullySelected = isSubjectFullySelected(subject.id);
                                        const isPartiallySelected = isSubjectPartiallySelected(subject.id);
                                        
                                        return (
                                            <div key={subject.id} className="bg-white/50 rounded-lg overflow-hidden">
                                                {/* Subject Header */}
                                                <div className={`flex items-center gap-2 p-2 ${isFullySelected ? 'bg-omani-green/10' : isPartiallySelected ? 'bg-omani-gold/10' : ''}`}>
                                                    <button
                                                        onClick={() => toggleSelectAllSubjectTopics(subject.id)}
                                                        className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                                                            isFullySelected ? 'bg-omani-green text-white' : 
                                                            isPartiallySelected ? 'bg-omani-gold text-white' : 
                                                            'bg-gray-200 text-gray-400'
                                                        }`}
                                                    >
                                                        {isFullySelected || isPartiallySelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleExpandSubject(subject.id)}
                                                        className="flex-1 flex items-center gap-2 text-sm"
                                                    >
                                                        <span>{subject.icon}</span>
                                                        <span className="font-bold text-gray-700 flex-1 text-right">{subject.name}</span>
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                </div>
                                                
                                                {/* Topics */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="flex flex-wrap gap-1 p-2 pt-0">
                                                                {subjectTopics.map(topic => (
                                                                    <button
                                                                        key={topic.id}
                                                                        onClick={() => toggleSelectTopic(topic.id)}
                                                                        className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                                                                            selectedTopics.includes(topic.id)
                                                                                ? 'bg-omani-green text-white'
                                                                                : 'bg-gray-100 text-gray-600'
                                                                        }`}
                                                                    >
                                                                        <span>{topic.icon}</span>
                                                                        <span>{topic.name}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-600 text-center text-sm font-bold">{error}</p>
                        )}

                        <Button
                            onClick={handleCreate}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'جاري الإنشاء...' : 'إنشاء'}
                        </Button>
                    </motion.div>
                )}

                {mode === 'join' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center gap-4"
                    >
                        <div className="w-full max-w-xs space-y-4">
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="اسمك الكريم"
                                maxLength={15}
                                className="w-full p-4 rounded-xl bg-white/90 text-gray-800 font-bold text-center placeholder-gray-600 text-lg"
                            />

                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="مفتاح السبلة"
                                maxLength={6}
                                className="w-full p-4 rounded-xl bg-white/90 text-gray-800 font-bold text-center placeholder-gray-400 text-lg tracking-widest"
                            />

                            {error && (
                                <p className="text-red-600 text-center text-sm font-bold">{error}</p>
                            )}

                            <Button
                                onClick={handleJoin}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? 'دخول...' : 'دخول'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
