import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function Match({ question, onAnswer }) {
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [matches, setMatches] = useState({}); // { leftId: rightId }
    const [completed, setCompleted] = useState(false);

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
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex-none">
                <h2 className="text-xl font-bold text-center text-gray-800">
                    {question.question}
                </h2>
                <p className="text-center text-sm text-gray-500 mt-1">اختار يمين ويسار عشان توصل</p>
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
                                disabled={isMatched && !matchedLeftId} // Should always have a match if isMatched
                                className={`p-4 rounded-xl text-sm font-bold text-left transition-all border-2
                  ${isMatched
                                        ? 'bg-green-50 border-green-500 text-green-700 opacity-80'
                                        : selectedLeft
                                            ? 'bg-white border-omani-red/30 text-gray-700 animate-pulse cursor-pointer'
                                            : 'bg-white border-gray-100 text-gray-400'
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
        </div>
    );
}
