import React, { useEffect, useRef, useState } from 'react';
import Button from '../Button';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

// Check if text is primarily Arabic
function isArabic(text) {
    if (!text) return true;
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text.trim().charAt(0));
}

// Helper to get a stable question identifier
function getQuestionId(question) {
    return question?.id || question?.question || '';
}

export default function FillBlank({ question, onAnswer, onUpdate, disabled = false }) {
    const { reportQuestion } = useGameStore();
    // Use a ref to track which question we've reset for
    const initializedForRef = useRef(null);
    const [typedAnswer, setTypedAnswer] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const updateTimerRef = useRef(null);

    // Detect if answer should be in English or Arabic
    const answerIsArabic = isArabic(question.answer);
    const languageHint = answerIsArabic ? 'الإجابة بالعربي' : 'Answer in English';

    // Reset answer ONLY ONCE per question (using ref to prevent re-runs)
    useEffect(() => {
        const currentQuestionId = getQuestionId(question);
        // Only reset if we haven't initialized for this question yet
        if (initializedForRef.current === currentQuestionId) {
            return; // Already initialized for this question
        }
        
        initializedForRef.current = currentQuestionId;
        setTypedAnswer('');
    }, [question]);

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

    const parts = question.question.split('______');

    // Draft updates (no submit required). Debounced so we don't spam the server.
    useEffect(() => {
        if (!onUpdate) return;
        if (disabled) return;

        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        updateTimerRef.current = setTimeout(() => {
            onUpdate(typedAnswer.trim());
        }, 250);

        return () => {
            if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        };
    }, [typedAnswer, onUpdate, disabled]);

    const handleSubmit = () => {
        if (typedAnswer.trim()) {
            onAnswer(typedAnswer.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && typedAnswer.trim()) {
            handleSubmit();
        }
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
            <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-0 overflow-y-auto">
                <h2 className="text-2xl font-bold text-center text-white leading-relaxed engraved-text">
                    {parts[0]}
                    <span className={`inline-block min-w-[120px] border-b-2 px-2 text-center mx-1 transition-colors ${typedAnswer ? 'border-primary text-primary' : 'border-white/20 text-sand/50'}`}>
                        {typedAnswer || "?"}
                    </span>
                    {parts[1]}
                </h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-4"
            >
                {/* Language hint */}
                <p className={`text-center text-sm font-bold mb-2 ${answerIsArabic ? 'text-primary' : 'text-primary'}`}>
                    💡 {languageHint}
                </p>
                <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={answerIsArabic ? "كتب إجابتك..." : "Type your answer..."}
                    className="w-full p-4 text-lg bg-wood-dark/50 border-2 border-white/10 rounded-xl focus:border-primary outline-none text-center font-bold text-white placeholder-sand/30"
                    autoFocus
                    dir={answerIsArabic ? "rtl" : "ltr"}
                    disabled={disabled}
                />
            </motion.div>

            <Button
                disabled={!typedAnswer.trim()}
                onClick={handleSubmit}
                className="mb-4"
            >
                تأكيد
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

