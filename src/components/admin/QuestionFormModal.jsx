import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';
import { useGameStore } from '../../store/gameStore';

export default function QuestionFormModal({ question, categories, onClose, onSaved }) {
    const { addQuestion, editQuestion } = useGameStore();
    const isEdit = !!question;

    const defaultCategoryId = useMemo(() => {
        if (question?.category) return question.category;
        return categories?.[0]?.id || '';
    }, [question?.category, categories]);

    const [type, setType] = useState(question?.type || 'multiple-choice');
    const [category, setCategory] = useState(defaultCategoryId);
    const [questionText, setQuestionText] = useState(question?.question || '');
    const [answer, setAnswer] = useState(question?.answer || '');
    const [options, setOptions] = useState(question?.options?.join('\n') || '');
    const [items, setItems] = useState(question?.items?.map(i => i.text).join('\n') || '');
    const [pairs, setPairs] = useState(question?.pairs?.map(p => `${p.left}|${p.right}`).join('\n') || '');
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when switching between questions (or opening/closing)
    useEffect(() => {
        setType(question?.type || 'multiple-choice');
        setCategory(question?.category || categories?.[0]?.id || '');
        setQuestionText(question?.question || '');
        setAnswer(question?.answer || '');
        setOptions(question?.options?.join('\n') || '');
        setItems(question?.items?.map(i => i.text).join('\n') || '');
        setPairs(question?.pairs?.map(p => `${p.left}|${p.right}`).join('\n') || '');
    }, [question?.id, categories]);

    const handleSubmit = async () => {
        if (isSaving) return;
        if (!questionText.trim()) return;
        if (!category) return;

        let newQuestion = { type, category, question: questionText.trim() };

        if (type === 'multiple-choice') {
            newQuestion.options = options.split('\n').map(o => o.trim()).filter(Boolean);
            newQuestion.answer = answer;
        } else if (type === 'fill-blank') {
            newQuestion.options = options.split('\n').map(o => o.trim()).filter(Boolean);
            newQuestion.answer = answer;
        } else if (type === 'order') {
            newQuestion.items = items.split('\n').map(i => i.trim()).filter(Boolean).map((text, idx) => ({ id: String(idx + 1), text }));
            newQuestion.correctOrder = newQuestion.items.map(i => i.id);
        } else if (type === 'match') {
            newQuestion.pairs = pairs
                .split('\n')
                .map(p => p.trim())
                .filter(p => p.includes('|'))
                .map(p => {
                    const [left, right] = p.split('|');
                    return { left: left.trim(), right: right.trim() };
                })
                .filter(p => p.left && p.right);
        }

        setIsSaving(true);
        try {
            if (isEdit) {
                await editQuestion(question.id, newQuestion);
                onSaved?.({ id: question.id, ...newQuestion });
            } else {
                await addQuestion(newQuestion);
                onSaved?.({ ...newQuestion });
            }
            onClose?.();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-4"
            >
                <h3 className="text-xl font-bold text-white mb-4 engraved-text">{isEdit ? 'Edit' : 'Add'} Question</h3>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 text-white outline-none focus:border-primary"
                    disabled={isSaving}
                >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="fill-blank">Fill in the Blank</option>
                    <option value="order">Order</option>
                    <option value="match">Match</option>
                </select>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 text-white outline-none focus:border-primary"
                    disabled={isSaving}
                >
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>

                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Question text (use ______ for blanks)"
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 h-20 resize-none text-white placeholder-sand/30 outline-none focus:border-primary"
                    disabled={isSaving}
                />

                {(type === 'multiple-choice' || type === 'fill-blank') && (
                    <>
                        <textarea
                            value={options}
                            onChange={(e) => setOptions(e.target.value)}
                            placeholder="Options (one per line)"
                            className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 h-24 resize-none text-white placeholder-sand/30 outline-none focus:border-primary"
                            disabled={isSaving}
                        />
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Correct Answer"
                            className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 text-white placeholder-sand/30 outline-none focus:border-primary"
                            disabled={isSaving}
                        />
                    </>
                )}

                {type === 'order' && (
                    <textarea
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        placeholder="Items in correct order (one per line)"
                        className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 h-24 resize-none text-white placeholder-sand/30 outline-none focus:border-primary"
                        disabled={isSaving}
                    />
                )}

                {type === 'match' && (
                    <textarea
                        value={pairs}
                        onChange={(e) => setPairs(e.target.value)}
                        placeholder="Pairs (Left|Right, one per line)"
                        className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 h-24 resize-none text-white placeholder-sand/30 outline-none focus:border-primary"
                        disabled={isSaving}
                    />
                )}

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5" disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1 shadow-lg" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}




