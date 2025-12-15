import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, List, Pencil, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import Button from '../Button';
import MultipleChoice from '../questions/MultipleChoice';
import FillBlank from '../questions/FillBlank';
import Order from '../questions/Order';
import Match from '../questions/Match';
import QuestionFormModal from './QuestionFormModal';

// Levenshtein distance for fuzzy matching (allows typos)
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function isCorrectAnswer(question, userAnswer) {
    if (!question) return false;
    if (question.type === 'multiple-choice') {
        return userAnswer === question.answer;
    }
    if (question.type === 'fill-blank') {
        const user = String(userAnswer ?? '').toLowerCase().trim();
        const correct = String(question.answer ?? '').toLowerCase().trim();
        const distance = levenshteinDistance(user, correct);
        return distance <= 3;
    }
    if (question.type === 'order') {
        return JSON.stringify(userAnswer) === JSON.stringify(question.correctOrder);
    }
    if (question.type === 'match') {
        const mapping = userAnswer || {};
        return Object.entries(mapping).every(([leftId, rightId]) => {
            const leftIndex = leftId.split('-')[1];
            const rightIndex = rightId.split('-')[1];
            return leftIndex === rightIndex;
        }) && Object.keys(mapping).length === (question.pairs?.length || 0);
    }
    return false;
}

function formatCorrectAnswer(question) {
    if (!question) return '';
    if (question.type === 'multiple-choice' || question.type === 'fill-blank') {
        return question.answer || '';
    }
    if (question.type === 'order') {
        const itemsById = new Map((question.items || []).map(i => [i.id, i.text]));
        return (question.correctOrder || []).map(id => itemsById.get(id) || id).join(' → ');
    }
    if (question.type === 'match') {
        return (question.pairs || []).map(p => `${p.left} — ${p.right}`).join('\n');
    }
    return '';
}

function QuestionListModal({ items, categoriesById, answersById, onGo, onEdit, onClose }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return items;
        return items.filter(({ question }) => {
            const text = String(question?.question || '').toLowerCase();
            const ans = String(question?.answer || '').toLowerCase();
            return text.includes(s) || ans.includes(s);
        });
    }, [items, search]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[80vh] overflow-hidden"
            >
                <div className="p-4 border-b flex items-center gap-3">
                    <div className="font-black text-gray-800 text-lg flex-1">Questions</div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-700" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search question / answer..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-omani-red text-gray-900"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filtered.map(({ question, index }) => {
                        const cat = categoriesById.get(question.category);
                        const isAnswered = Object.prototype.hasOwnProperty.call(answersById, question.id);
                        const correct = isAnswered ? isCorrectAnswer(question, answersById[question.id]) : null;
                        return (
                            <div key={question.id} className="border rounded-xl p-3 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-700 shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-500 font-bold">
                                        {cat?.icon || '❓'} {cat?.name || 'Unknown'} • <span className="capitalize">{question.type}</span>
                                        {isAnswered && (
                                            <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {correct ? 'Correct' : 'Wrong'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-800 font-medium text-sm truncate">{question.question}</div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => onEdit(question.id)}
                                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onGo(index)}
                                        className="px-3 py-2 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-black"
                                        title="Go"
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No matches.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminReviewGame() {
    const navigate = useNavigate();
    const {
        adminReviewActive,
        adminReviewQuestionIds,
        adminReviewMeta,
        categories,
        questions: allQuestions,
        exitAdminReviewGame
    } = useGameStore();

    const categoriesById = useMemo(() => new Map((categories || []).map(c => [c.id, c])), [categories]);
    const questionById = useMemo(() => new Map((allQuestions || []).map(q => [q.id, q])), [allQuestions]);

    const reviewQuestions = useMemo(() => {
        const ids = adminReviewQuestionIds || [];
        return ids.map(id => questionById.get(id)).filter(Boolean);
    }, [adminReviewQuestionIds, questionById]);

    const [index, setIndex] = useState(0);
    const [answersById, setAnswersById] = useState({});
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [isListOpen, setIsListOpen] = useState(false);

    const total = reviewQuestions.length;
    const currentQuestion = reviewQuestions[index];
    const currentCategory = currentQuestion ? categoriesById.get(currentQuestion.category) : null;
    const userAnswer = currentQuestion ? answersById[currentQuestion.id] : undefined;
    const isAnswered = currentQuestion ? Object.prototype.hasOwnProperty.call(answersById, currentQuestion.id) : false;
    const isCorrect = currentQuestion && isAnswered ? isCorrectAnswer(currentQuestion, userAnswer) : false;
    const correctAnswerText = currentQuestion ? formatCorrectAnswer(currentQuestion) : '';

    // Reset local state when starting a new review session
    useEffect(() => {
        if (adminReviewActive) {
            setIndex(0);
            setAnswersById({});
        }
    }, [adminReviewActive]);

    // Keep index in range if list changes (e.g. deletions)
    useEffect(() => {
        if (index >= total) setIndex(Math.max(0, total - 1));
    }, [index, total]);

    const listItems = useMemo(() => {
        return reviewQuestions.map((q, i) => ({ question: q, index: i }));
    }, [reviewQuestions]);

    const openEditorForId = (id) => {
        setEditingQuestionId(id);
    };

    const closeEditor = () => setEditingQuestionId(null);

    const handleSaved = ({ id }) => {
        if (!id) return;
        // If the question changes, clear the old answer so you can re-answer with the updated version
        setAnswersById(prev => {
            if (!Object.prototype.hasOwnProperty.call(prev, id)) return prev;
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const handleAnswer = (answer) => {
        if (!currentQuestion) return;
        if (Object.prototype.hasOwnProperty.call(answersById, currentQuestion.id)) return;
        setAnswersById(prev => ({ ...prev, [currentQuestion.id]: answer }));
    };

    const handleRetry = () => {
        if (!currentQuestion) return;
        setAnswersById(prev => {
            const copy = { ...prev };
            delete copy[currentQuestion.id];
            return copy;
        });
    };

    const QuestionRenderer = ({ question, onAnswer }) => {
        if (!question) return null;
        switch (question.type) {
            case 'multiple-choice':
                return <MultipleChoice question={question} onAnswer={onAnswer} />;
            case 'fill-blank':
                return <FillBlank question={question} onAnswer={onAnswer} />;
            case 'order':
                return <Order question={question} onAnswer={onAnswer} />;
            case 'match':
                return <Match question={question} onAnswer={onAnswer} />;
            default:
                return null;
        }
    };

    const handleBackToAdmin = () => {
        navigate('/admin');
    };

    const handleExitReview = () => {
        exitAdminReviewGame();
        navigate('/admin');
    };

    if (!adminReviewActive) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="bg-white/90 rounded-3xl p-8 max-w-md w-full">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">No review game running</h2>
                    <p className="text-gray-500 text-sm mb-6">Start a review game from the Admin page (Questions tab) after applying your filters.</p>
                    <Button onClick={() => navigate('/admin')} className="w-full">Go to Admin</Button>
                </div>
            </div>
        );
    }

    if (total === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="bg-white/90 rounded-3xl p-8 max-w-md w-full">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">No questions in this review set</h2>
                    <p className="text-gray-500 text-sm mb-6">Your filter returned 0 questions.</p>
                    <div className="flex gap-3">
                        <Button onClick={handleBackToAdmin} variant="ghost" className="flex-1 text-gray-700">Back</Button>
                        <Button onClick={handleExitReview} className="flex-1">Exit</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleBackToAdmin}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors"
                    title="Back to Admin"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="text-omani-dark font-black text-lg truncate">Admin Review Game</div>
                    <div className="text-gray-600 text-xs font-bold truncate">
                        {adminReviewMeta?.filterCategory && adminReviewMeta.filterCategory !== 'all'
                            ? `Category: ${categoriesById.get(adminReviewMeta.filterCategory)?.name || adminReviewMeta.filterCategory}`
                            : 'Category: All'}
                        {' • '}
                        {adminReviewMeta?.filterType && adminReviewMeta.filterType !== 'all'
                            ? `Type: ${adminReviewMeta.filterType}`
                            : 'Type: All'}
                    </div>
                </div>

                <button
                    onClick={() => setIsListOpen(true)}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors"
                    title="Question list"
                >
                    <List size={18} />
                </button>

                <button
                    onClick={() => openEditorForId(currentQuestion?.id)}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    title="Edit current question"
                    disabled={!currentQuestion}
                >
                    <Pencil size={18} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4 text-sm font-bold text-gray-700 glass-panel p-2 rounded-lg">
                <span>Question {index + 1}/{total}</span>
                <span className="truncate">{currentCategory?.icon || '❓'} {currentCategory?.name || 'Unknown'}</span>
            </div>

            {/* Question Card */}
            <div className="flex-1 overflow-y-auto bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border-4 border-white/50">
                <QuestionRenderer question={currentQuestion} onAnswer={handleAnswer} />

                {/* Result */}
                {isAnswered && (
                    <div className={`mt-6 border-2 rounded-2xl p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className={`font-black text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? 'Correct' : 'Wrong'}
                        </div>

                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                            <span className="font-bold">Correct answer:</span> {correctAnswerText || '(not set)'}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button onClick={() => openEditorForId(currentQuestion.id)} variant="secondary" className="w-full">
                                <Pencil size={18} /> Edit
                            </Button>
                            <Button onClick={handleRetry} variant="outline" className="w-full">
                                Retry
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="mt-4 flex gap-2">
                <Button
                    onClick={() => setIndex(i => Math.max(0, i - 1))}
                    variant="ghost"
                    className="flex-1 w-auto text-omani-brown hover:bg-white/50 hover:text-omani-dark"
                    disabled={index === 0}
                >
                    <ChevronLeft size={18} /> Prev
                </Button>
                <Button
                    onClick={() => setIndex(i => Math.min(total - 1, i + 1))}
                    variant="ghost"
                    className="flex-1 w-auto text-omani-brown hover:bg-white/50 hover:text-omani-dark"
                    disabled={index >= total - 1}
                >
                    Next <ChevronRight size={18} />
                </Button>
            </div>

            {/* Exit */}
            <div className="mt-2">
                <Button onClick={handleExitReview} variant="ghost" className="w-full text-omani-brown hover:bg-white/50 hover:text-omani-dark font-bold">
                    End review session
                </Button>
            </div>

            {/* Modals */}
            {isListOpen && (
                <QuestionListModal
                    items={listItems}
                    categoriesById={categoriesById}
                    answersById={answersById}
                    onGo={(idx) => { setIndex(idx); setIsListOpen(false); }}
                    onEdit={(id) => { setIsListOpen(false); openEditorForId(id); }}
                    onClose={() => setIsListOpen(false)}
                />
            )}

            {editingQuestionId && (
                <QuestionFormModal
                    question={questionById.get(editingQuestionId)}
                    categories={categories}
                    onClose={closeEditor}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}


