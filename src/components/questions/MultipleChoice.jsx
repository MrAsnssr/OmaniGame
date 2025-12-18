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
                className="absolute top-0 left-0 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                title="الإبلاغ عن السؤال"
            >
                <Flag size={20} />
            </button>
            <div className="flex-1 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-center text-gray-800 leading-relaxed">
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
                            className="w-full group"
                            disabled={disabled}
                        >
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 mr-3 group-hover:bg-omani-red/10 group-hover:text-omani-red transition-colors">
                                {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                        </Button>
                    </motion.div>
                ))}
            </div>

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
