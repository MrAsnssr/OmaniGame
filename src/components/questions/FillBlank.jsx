import React, { useState } from 'react';
import Button from '../Button';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function FillBlank({ question, onAnswer }) {
    const { reportQuestion } = useGameStore();
    const [typedAnswer, setTypedAnswer] = useState('');
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

    const parts = question.question.split('______');

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
                className="absolute top-0 left-0 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                title="الإبلاغ عن السؤال"
            >
                <Flag size={20} />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-0 overflow-y-auto">
                <h2 className="text-2xl font-bold text-center text-gray-800 leading-relaxed">
                    {parts[0]}
                    <span className={`inline-block min-w-[120px] border-b-2 px-2 text-center mx-1 transition-colors ${typedAnswer ? 'border-omani-red text-omani-red' : 'border-gray-300 text-gray-600'}`}>
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
                <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="كتب إجابتك..."
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-omani-red outline-none text-center font-bold text-gray-800 placeholder-gray-400"
                    autoFocus
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

