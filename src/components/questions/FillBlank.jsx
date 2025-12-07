import React, { useState } from 'react';
import Button from '../Button';
import { motion } from 'framer-motion';

export default function FillBlank({ question, onAnswer }) {
    const [typedAnswer, setTypedAnswer] = useState('');

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
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-0 overflow-y-auto">
                <h2 className="text-2xl font-bold text-center text-gray-800 leading-relaxed">
                    {parts[0]}
                    <span className={`inline-block min-w-[120px] border-b-2 px-2 text-center mx-1 transition-colors ${typedAnswer ? 'border-omani-red text-omani-red' : 'border-gray-300 text-gray-400'}`}>
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
        </div>
    );
}

