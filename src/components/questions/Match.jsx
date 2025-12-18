import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Flag } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function Match({ question, onAnswer, onUpdate, disabled = false }) {
    const { reportQuestion } = useGameStore();
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [matches, setMatches] = useState({}); // { leftId: rightId }
    const [completed, setCompleted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const handleReport = async () => {
        if (!reportReason.trim()) return;
        const result = await reportQuestion(question.id, question, reportReason);
        if (result.success) {
            alert('تم الإبلاغ عن السؤال بنجاح');
            setShowReportModal(false);
            setReportReason('');
        } else {
            alert(result.message || 'حدث خطأ أثناء الإبلاغ');
        }
    };

    useEffect(() => {
        // Initialize items with IDs
        const lefts = question.pairs.map((p, i) => ({ id: `l-${i}`, text: p.left }));
        // Shuffle right items
        const rights = question.pairs.map((p, i) => ({ id: `r-${i}`, text: p.right }))
            .sort(() => Math.random() - 0.5);

        setLeftItems(lefts);
        setRightItems(rights);
        setMatches({});
        setSelectedLeft(null);
        setCompleted(false);
    }, [question]);

    // Draft updates (no submit required)
    useEffect(() => {
        if (!onUpdate) return;
        if (disabled) return;
        onUpdate(matches);
    }, [matches, onUpdate, disabled]);

    const handleLeftClick = (id) => {
        if (matches[id]) return; // Already matched
        setSelectedLeft(id);
    };

    const handleRightClick = (rightId) => {
        if (!selectedLeft) return;

        // Check if this right item is already matched
        if (Object.values(matches).includes(rightId)) return;

        // Create match
        const newMatches = { ...matches, [selectedLeft]: rightId };
        setMatches(newMatches);
        setSelectedLeft(null);

        // Check if all matched
        if (Object.keys(newMatches).length === leftItems.length) {
            setCompleted(true);
        }
    };

    const undoMatch = (leftId) => {
        const newMatches = { ...matches };
        delete newMatches[leftId];
        setMatches(newMatches);
        setCompleted(false);
    };

    const handleSubmit = () => {
        // Convert matches to answer format for validation
        // We need to map back to original indices or values
        // For simplicity, let's assume the answer validator expects an array of pairs
        // But here we'll just pass the matches object and let the parent validate
        onAnswer(matches);
    };

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden relative">
            <button
                onClick={() => setShowReportModal(true)}
                className="absolute top-0 left-0 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                title="الإبلاغ عن السؤال"
            >
                <Flag size={20} />
            </button>
            <div className="flex-none">
                <h2 className="text-xl font-bold text-center text-gray-800">
                    {question.question}
                </h2>
                <p className="text-center text-sm text-gray-700 font-bold mt-1">اختار يمين ويسار عشان توصل</p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto content-start min-h-0">
                <div className="flex flex-col gap-3">
                    {leftItems.map((item) => {
                        const isMatched = !!matches[item.id];
                        const isSelected = selectedLeft === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => isMatched ? undoMatch(item.id) : handleLeftClick(item.id)}
                                disabled={disabled}
                                className={`p-4 rounded-xl text-sm font-bold text-left transition-all border-2 relative
                  ${isMatched
                                        ? 'bg-green-50 border-green-500 text-green-700'
                                        : isSelected
                                            ? 'bg-omani-red/10 border-omani-red text-omani-red'
                                            : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300'
                                    }`}
                                whileTap={{ scale: 0.98 }}
                            >
                                {item.text}
                                {isMatched && <Check size={16} className="absolute top-2 right-2 text-green-600" />}
                            </motion.button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3">
                    {rightItems.map((item) => {
                        const isMatched = Object.values(matches).includes(item.id);
                        // Find which left item matches this right item
                        const matchedLeftId = Object.keys(matches).find(key => matches[key] === item.id);
                        const isSelectedMatch = selectedLeft && !isMatched; // Can be selected

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => handleRightClick(item.id)}
                                disabled={disabled || (isMatched && !matchedLeftId)} // Should always have a match if isMatched
                                className={`p-4 rounded-xl text-sm font-bold text-left transition-all border-2
                  ${isMatched
                                        ? 'bg-green-50 border-green-500 text-green-700 opacity-80'
                                        : selectedLeft
                                            ? 'bg-white border-omani-red/30 text-gray-700 animate-pulse cursor-pointer'
                                            : 'bg-white border-gray-200 text-gray-600'
                                    }`}
                                whileTap={{ scale: 0.98 }}
                            >
                                {item.text}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <Button
                disabled={!completed}
                onClick={handleSubmit}
                className="mt-auto mb-4"
            >
                تأكيد التوصيل
            </Button>

            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4">الإبلاغ عن السؤال</h3>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="اكتب سبب الإبلاغ..."
                            className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-red-500 outline-none text-gray-900 placeholder-gray-500 min-h-[100px] resize-none"
                        />
                        <div className="flex gap-3">
                            <Button onClick={() => { setShowReportModal(false); setReportReason(''); }} variant="ghost" className="flex-1 text-gray-600">
                                إلغاء
                            </Button>
                            <Button onClick={handleReport} className="flex-1" disabled={!reportReason.trim()}>
                                إبلاغ
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
