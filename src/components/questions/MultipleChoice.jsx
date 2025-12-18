import React, { useState } from 'react';
import Button from '../Button';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function MultipleChoice({ question, onAnswer, onUpdate, disabled = false }) {
    const { reportQuestion } = useGameStore();
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

    return (
        <div className="flex flex-col gap-6 h-full relative">
            <button
                onClick={() => setShowReportModal(true)}
                className="absolute top-0 left-0 p-2 text-sand/40 hover:text-primary transition-colors z-10"
                title="الإبلاغ عن السؤال"
            >
                <Flag size={20} />
            </button>
            <div className="flex-1 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-center text-white leading-relaxed engraved-text">
                    {question.question}
                </h2>
            </div>
            <div className="grid gap-3 pb-4 overflow-y-auto min-h-0">
                {question.options.map((option, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Button
                            variant="option"
                            onClick={() => {
                                if (disabled) return;
                                onUpdate?.(option);
                                onAnswer?.(option);
                            }}
                            className="w-full group border-white/5"
                            disabled={disabled}
                        >
                            <span className="w-8 h-8 rounded-full bg-wood-dark flex items-center justify-center text-sm font-bold text-sand/70 mr-3 group-hover:bg-primary/20 group-hover:text-primary transition-colors border border-white/5">
                                {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                        </Button>
                    </motion.div>
                ))}
            </div>

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
