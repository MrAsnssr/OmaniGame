import React, { useState, useEffect } from 'react';
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

export default function Order({ question, onAnswer }) {
    const { reportQuestion } = useGameStore();
    const [items, setItems] = useState(question.items);
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

    // Reset items when question changes
    useEffect(() => {
        setItems(question.items);
    }, [question]);

    const handleSubmit = () => {
        const currentOrder = items.map(item => item.id);
        onAnswer(currentOrder);
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
            <div className="flex-none pb-4">
                <h2 className="text-xl font-bold text-center text-gray-800 leading-relaxed">
                    {question.question}
                </h2>
                <p className="text-center text-sm text-gray-700 font-bold mt-2">اسحب عشان ترتبهم</p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-3">
                    {items.map((item) => (
                        <Reorder.Item key={item.id} value={item}>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-omani-gold/50">
                                <div className="text-gray-500">
                                    <GripVertical size={20} />
                                </div>
                                <span className="font-medium text-gray-700">{removeYears(item.text)}</span>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            <Button onClick={handleSubmit} className="mt-auto mb-4">
                تأكيد الترتيب
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
