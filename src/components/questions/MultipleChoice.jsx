import React from 'react';
import Button from '../Button';
import { motion } from 'framer-motion';

export default function MultipleChoice({ question, onAnswer }) {
    return (
        <div className="flex flex-col gap-6 h-full">
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
                            onClick={() => onAnswer(option)}
                            className="w-full group"
                        >
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 mr-3 group-hover:bg-omani-red/10 group-hover:text-omani-red transition-colors">
                                {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
