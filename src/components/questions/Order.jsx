import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GripVertical, Flag } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

// Remove 4-digit numbers (years) from text to avoid giving away the order
function removeYears(text) {
    if (!text) return text;
    // First remove years in parentheses like (1970) or ( 1970 )
    let result = text.replace(/\s*\(\s*\d{4}\s*\)\s*/g, ' ');
    // Then remove standalone years
    result = result.replace(/\b\d{4}\b/g, '');
    // Clean up extra spaces
    return result.replace(/\s+/g, ' ').trim();
}

// Shuffle array randomly (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Helper to get a stable question identifier
function getQuestionId(question) {
    return question?.id || question?.question || '';
}

export default function Order({ question, onAnswer, onUpdate, disabled = false }) {
    const { reportQuestion } = useGameStore();
    // Use a ref to track which question we've initialized for
    const initializedForRef = useRef(null);
    const [items, setItems] = useState(() => shuffleArray(question.items));
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

    // Shuffle items ONLY ONCE per question (using ref to prevent re-runs)
    useEffect(() => {
        const currentQuestionId = getQuestionId(question);
        // Only shuffle if we haven't initialized for this question yet
        if (initializedForRef.current === currentQuestionId) {
            return; // Already initialized for this question
        }
        
        initializedForRef.current = currentQuestionId;
        setItems(shuffleArray(question.items));
    }, [question]);

    // Draft updates for multiplayer (no submit required)
    useEffect(() => {
        if (!onUpdate) return;
        if (disabled) return;
        const currentOrder = items.map(item => item.id);
        onUpdate(currentOrder);
    }, [items, onUpdate, disabled]);

    const handleSubmit = () => {
        const currentOrder = items.map(item => item.id);
        onAnswer(currentOrder);
    };

    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden relative">
            <button
                onClick={() => setShowReportModal(true)}
                className="absolute top-0 left-0 p-2 text-sand/40 hover:text-primary transition-colors z-10"
                title="الإبلاغ عن السؤال"
            >
                <Flag size={20} />
            </button>
            <div className="flex-none pb-4">
                <h2 className="text-xl font-bold text-center text-white leading-relaxed engraved-text">
                    {question.question}
                </h2>
                <p className="text-center text-sm text-sand/70 font-bold mt-2">اسحب عشان ترتبهم</p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-3">
                    {items.map((item) => (
                        <Reorder.Item key={item.id} value={item}>
                            <div className="bg-wood-dark/50 border-2 border-white/5 rounded-xl p-4 flex items-center gap-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
                                <div className="text-sand/40">
                                    <GripVertical size={20} />
                                </div>
                                <span className="font-bold text-white">{removeYears(item.text)}</span>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            <Button onClick={handleSubmit} className="mt-auto mb-4" disabled={disabled}>
                تأكيد الترتيب
            </Button>

            {showReportModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">الإبلاغ عن السؤال</h3>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="اكتب سبب الإبلاغ..."
                            className="w-full p-3 bg-wood-dark/50 border-2 border-white/5 rounded-xl mb-4 focus:border-primary outline-none text-white placeholder-sand/40 min-h-[100px] resize-none"
                        />
                        <div className="flex gap-3">
                            <Button onClick={() => { setShowReportModal(false); setReportReason(''); }} variant="ghost" className="flex-1 text-sand border border-white/5">
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
