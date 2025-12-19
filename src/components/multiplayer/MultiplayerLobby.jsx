import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, LogIn, ArrowLeft, Hash, Clock, CheckSquare, Square, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import Button from '../Button';
import { useGameStore } from '../../store/gameStore';

export default function MultiplayerLobby({ onBack, onRoomCreated, onRoomJoined, user }) {
    const {
        questionCount, setQuestionCount,
        timePerQuestion, setTimePerQuestion,
        selectedTypes, toggleType,
        subjects, getTopicsBySubject
    } = useGameStore();

    const topicsBySubject = getTopicsBySubject();

    const [mode, setMode] = useState('select'); // select, create, join
    const [gameMode, setGameMode] = useState('random'); // random, turn-based
    const [playerName, setPlayerName] = useState(user?.displayName || '');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Topic selection state
    const [selectedTopics, setSelectedTopics] = useState([]); // empty = all topics
    const [expandedSubjects, setExpandedSubjects] = useState({});

    const allTypes = [
        { id: 'multiple-choice', label: 'اختيار', emoji: '🔘' },
        { id: 'fill-blank', label: 'كمل', emoji: '✏️' },
        { id: 'order', label: 'ترتيب', emoji: '📋' },
        { id: 'match', label: 'توصيل', emoji: '🔗' },
    ];

    const toggleExpandSubject = (subjectId) => {
        setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
    };

    const toggleSelectSubject = (subjectId, e) => {
        e.stopPropagation();
        const subjectTopicIds = (topicsBySubject[subjectId]?.topics || []).map(t => t.id);
        const allSelected = subjectTopicIds.every(id => selectedTopics.includes(id));

        if (allSelected) {
            setSelectedTopics(prev => prev.filter(id => !subjectTopicIds.includes(id)));
        } else {
            setSelectedTopics(prev => [...new Set([...prev, ...subjectTopicIds])]);
        }
    };

    const toggleSelectTopic = (topicId, e) => {
        e.stopPropagation();
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
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

    const selectAllTopics = () => {
        const allTopicIds = Object.values(topicsBySubject).flatMap(s => s.topics.map(t => t.id));
        setSelectedTopics(allTopicIds);
    };

    const clearTopicSelection = () => {
        setSelectedTopics([]);
    };

    const handleCreate = () => {
        const finalName = user?.displayName || playerName;
        if (!finalName.trim()) {
            setError('اكتب اسمك لو سمحت');
            return;
        }
        setIsLoading(true);
        setError('');
        // Pass selected topics (empty array = all topics)
        onRoomCreated(finalName.trim(), gameMode, selectedTopics);
    };

    const handleJoin = () => {
        const finalName = user?.displayName || playerName;
        if (!finalName.trim()) {
            setError('اكتب اسمك لو سمحت');
            return;
        }
        if (!roomCode.trim() || roomCode.length !== 6) {
            setError('كتب مفتاح السبلة صح (6 حروف)');
            return;
        }
        setIsLoading(true);
        setError('');
        onRoomJoined(roomCode.toUpperCase(), finalName.trim());
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={mode === 'select' ? onBack : () => setMode('select')}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-white">
                    {mode === 'select' ? 'السبلة' : mode === 'create' ? 'افتح السبلة' : 'دخل السبلة'}
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
                            <p className="text-sand font-bold">لعب مع ربعك وتتحداهم!</p>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMode('create')}
                            className="w-full max-w-xs p-4 rounded-2xl bg-gradient-to-r from-primary to-orange-700 text-white font-bold flex items-center justify-center gap-3 shadow-lg border-b-4 border-black/30"
                        >
                            <Plus size={24} />
                            افتح السبلة
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMode('join')}
                            className="w-full max-w-xs p-4 rounded-2xl bg-gradient-to-br from-wood-light to-wood-dark text-white font-bold flex items-center justify-center gap-3 shadow-lg border-b-4 border-black/30"
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
                        {user ? (
                            <div className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20 text-white font-bold text-center">
                                <span className="text-sand/50 text-xs block">بتلعب باسم</span>
                                {user.displayName || 'اللاعب'}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="اسمك الكريم"
                                maxLength={15}
                                className="w-full p-3 rounded-xl bg-wood-dark/50 border border-white/10 text-white font-bold text-center placeholder-sand/60 outline-none focus:border-primary/50"
                            />
                        )}

                        {/* Game Settings Panel */}
                        <div className="glass-panel rounded-2xl p-3 space-y-3 flex-1 overflow-y-auto min-h-0">
                            <h3 className="text-white font-bold text-center text-sm">إعدادات اللعب</h3>

                            {/* Game Mode Toggle */}
                            <div className="flex bg-wood-dark/40 p-1 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setGameMode('random')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === 'random'
                                        ? 'bg-wood-light text-white shadow-md'
                                        : 'text-sand/70 hover:text-sand'
                                        }`}
                                >
                                    عشوائي
                                </button>
                                <button
                                    onClick={() => setGameMode('turn-based')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === 'turn-based'
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-sand/70 hover:text-sand'
                                        }`}
                                >
                                    بالدور
                                </button>
                            </div>

                            {/* Question Count & Time in one row */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="flex items-center gap-1 text-sand mb-1">
                                        <Hash size={12} className="text-primary" />
                                        <span className="font-bold text-xs">الأسئلة: {questionCount}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="30"
                                        step="5"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                                        className="w-full h-2 bg-wood-dark/50 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-sand mb-1">
                                        <Clock size={12} className="text-primary" />
                                        <span className="font-bold text-xs">الوقت: {timePerQuestion}s</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="60"
                                        step="5"
                                        value={timePerQuestion}
                                        onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                        className="w-full h-2 bg-wood-dark/50 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>

                            {/* Question Types (Only for Random Mode) */}
                            {gameMode === 'random' && (
                                <div>
                                    <span className="font-bold text-sand text-xs block mb-1">أنواع الأسئلة:</span>
                                    <div className="grid grid-cols-4 gap-1">
                                        {allTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => toggleType(type.id)}
                                                className={`flex flex-col items-center p-1.5 rounded-lg font-bold text-xs transition-colors ${selectedTypes.includes(type.id)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-wood-dark/40 text-sand/70'
                                                    }`}
                                            >
                                                <span>{type.emoji}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {gameMode === 'turn-based' && (
                                <div className="bg-primary/10 rounded-lg p-2 text-xs text-sand text-center font-bold border border-primary/30">
                                    كل واحد يختار المجال ونوع السؤال بدوره!
                                </div>
                            )}

                            {/* Topic Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sand text-xs">المواضيع:</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={clearTopicSelection}
                                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${selectedTopics.length === 0 ? 'bg-primary text-white' : 'bg-wood-dark/40 text-sand/70'}`}
                                        >
                                            <Shuffle size={12} className="inline mr-1" />الكل
                                        </button>
                                    </div>
                                </div>

                                {selectedTopics.length > 0 && (
                                    <p className="text-xs text-omani-gold mb-2 font-bold">
                                        {selectedTopics.length} موضوع مختار
                                    </p>
                                )}

                                {/* Subject/Topic Tree */}
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {subjects.map((subject) => {
                                        const subjectTopics = topicsBySubject[subject.id]?.topics || [];
                                        if (subjectTopics.length === 0) return null;

                                        const isExpanded = expandedSubjects[subject.id];
                                        const isFullySelected = isSubjectFullySelected(subject.id);
                                        const isPartiallySelected = isSubjectPartiallySelected(subject.id);

                                        return (
                                            <div key={subject.id} className="bg-wood-dark/30 rounded-lg overflow-hidden">
                                                <div className={`flex items-center gap-2 p-2 ${isFullySelected ? 'bg-primary/20' : isPartiallySelected ? 'bg-omani-gold/10' : ''}`}>
                                                    <button
                                                        onClick={(e) => toggleSelectSubject(subject.id, e)}
                                                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isFullySelected ? 'bg-primary text-white'
                                                                : isPartiallySelected ? 'bg-omani-gold text-white'
                                                                    : 'bg-wood-dark/50 text-sand/60'
                                                            }`}
                                                    >
                                                        {(isFullySelected || isPartiallySelected) ? <CheckSquare size={12} /> : <Square size={12} />}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleExpandSubject(subject.id)}
                                                        className="flex-1 flex items-center gap-2 text-left"
                                                    >
                                                        <span className="text-sm">{subject.icon}</span>
                                                        <span className="text-xs font-bold text-white flex-1">{subject.name}</span>
                                                        <span className="text-[10px] text-sand/60">{subjectTopics.length}</span>
                                                        {isExpanded ? <ChevronUp size={14} className="text-sand/60" /> : <ChevronDown size={14} className="text-sand/60" />}
                                                    </button>
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="grid grid-cols-2 gap-1 p-2 pt-0">
                                                                {subjectTopics.map((topic) => {
                                                                    const isSelected = selectedTopics.includes(topic.id);
                                                                    return (
                                                                        <button
                                                                            key={topic.id}
                                                                            onClick={(e) => toggleSelectTopic(topic.id, e)}
                                                                            className={`flex items-center gap-1 p-1.5 rounded text-xs font-bold transition-colors ${isSelected ? 'bg-primary/20 text-white' : 'bg-wood-dark/30 text-sand/70'
                                                                                }`}
                                                                        >
                                                                            {isSelected ? <CheckSquare size={10} /> : <Square size={10} />}
                                                                            <span className="truncate">{topic.icon} {topic.name}</span>
                                                                        </button>
                                                                    );
                                                                })}
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
                            <p className="text-red-400 text-center text-sm font-bold">{error}</p>
                        )}

                        <Button
                            onClick={handleCreate}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'جاري الإنشاء...' : 'إنشاء السبلة'}
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
                            {user ? (
                                <div className="w-full p-4 rounded-xl bg-primary/10 border border-primary/20 text-white font-bold text-center text-lg">
                                    <span className="text-sand/50 text-sm block mb-1">بتلعب باسم</span>
                                    {user.displayName || 'اللاعب'}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="اسمك الكريم"
                                    maxLength={15}
                                    className="w-full p-4 rounded-xl bg-wood-dark/50 border border-white/10 text-white font-bold text-center placeholder-sand/60 text-lg outline-none focus:border-primary/50"
                                />
                            )}

                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="مفتاح السبلة"
                                maxLength={6}
                                className="w-full p-4 rounded-xl bg-wood-dark/50 border border-white/10 text-white font-bold text-center placeholder-sand/50 text-lg tracking-widest outline-none focus:border-primary/50"
                            />

                            {error && (
                                <p className="text-red-400 text-center text-sm font-bold">{error}</p>
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
