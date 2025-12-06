import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ArrowLeft, Plus, Edit2, Trash2, Book, HelpCircle, FileJson } from 'lucide-react';
import Button from '../Button';

export default function AdminDashboard() {
    const { categories, questions, resetGame, deleteCategory, deleteQuestion } = useGameStore();
    const [activeTab, setActiveTab] = useState('categories');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const filteredQuestions = questions.filter(q => {
        const matchCat = filterCategory === 'all' || q.category === filterCategory;
        const matchType = filterType === 'all' || q.type === filterType;
        return matchCat && matchType;
    });

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={resetGame}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'categories' ? 'bg-white text-gray-800' : 'bg-white/20 text-white'}`}
                >
                    <Book size={18} /> Categories
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'questions' ? 'bg-white text-gray-800' : 'bg-white/20 text-white'}`}
                >
                    <HelpCircle size={18} /> Questions
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-h-0">
                {activeTab === 'categories' && (
                    <CategoryList
                        categories={categories}
                        onEdit={setEditingCategory}
                        onDelete={deleteCategory}
                        onAdd={() => setShowCategoryForm(true)}
                    />
                )}
                {activeTab === 'questions' && (
                    <QuestionList
                        questions={filteredQuestions}
                        allQuestionsCount={questions.length}
                        categories={categories}
                        onEdit={setEditingQuestion}
                        onDelete={deleteQuestion}
                        onAdd={() => setShowQuestionForm(true)}
                        onImport={() => setShowJsonImport(true)}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        filterType={filterType}
                        setFilterType={setFilterType}
                    />
                )}
            </div>

            {/* Modals */}
            {(showCategoryForm || editingCategory) && (
                <CategoryForm
                    category={editingCategory}
                    onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                />
            )}
            {(showQuestionForm || editingQuestion) && (
                <QuestionForm
                    question={editingQuestion}
                    categories={categories}
                    onClose={() => { setShowQuestionForm(false); setEditingQuestion(null); }}
                />
            )}
            {showJsonImport && (
                <JsonImportModal
                    categories={categories}
                    onClose={() => setShowJsonImport(false)}
                />
            )}
        </div>
    );
}

function CategoryList({ categories, onEdit, onDelete, onAdd }) {
    return (
        <div className="space-y-3">
            <Button onClick={onAdd} variant="secondary" className="w-full">
                <Plus size={18} /> Add Category
            </Button>
            {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="flex-1 font-bold text-gray-800">{cat.name}</span>
                    <button onClick={() => onEdit(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => onDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
            ))}
        </div>
    );
}

function QuestionList({
    questions, allQuestionsCount, categories,
    onEdit, onDelete, onAdd, onImport,
    filterCategory, setFilterCategory, filterType, setFilterType
}) {
    const { deleteQuestions } = useGameStore();

    const handleDeleteFiltered = () => {
        if (questions.length === 0) return;
        if (window.confirm(`Are you sure you want to delete all ${questions.length} visible questions? This cannot be undone.`)) {
            const idsToDelete = questions.map(q => q.id);
            deleteQuestions(idsToDelete);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
                <Button onClick={onAdd} variant="secondary" className="w-full">
                    <Plus size={18} /> Add
                </Button>
                <Button onClick={onImport} variant="ghost" className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500">
                    <FileJson size={18} /> Import
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white/50 p-3 rounded-xl flex flex-col gap-2">
                <div className="flex gap-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="flex-1 p-2 rounded-lg border-2 border-gray-200 text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="flex-1 p-2 rounded-lg border-2 border-gray-200 text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="fill-blank">Fill Blank</option>
                        <option value="order">Order</option>
                        <option value="match">Match</option>
                    </select>
                </div>

                {(filterCategory !== 'all' || filterType !== 'all') && questions.length > 0 && (
                    <button
                        onClick={handleDeleteFiltered}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> Delete {questions.length} Filtered Questions
                    </button>
                )}
            </div>

            <div className="text-xs text-white/70 font-bold px-1">
                Showing {questions.length} of {allQuestionsCount} questions
            </div>

            {questions.map(q => {
                const cat = categories.find(c => c.id === q.category);
                return (
                    <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">{cat?.icon || '❓'}</span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 text-sm line-clamp-2">{q.question}</p>
                                <span className="text-xs text-gray-400 capitalize">{q.type}</span>
                            </div>
                            <button onClick={() => onEdit(q)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                    </div>
                );
            })}

            {questions.length === 0 && (
                <div className="text-center py-8 text-white/50">
                    No questions match your filters.
                </div>
            )}
        </div>
    );
}

function CategoryForm({ category, onClose }) {
    const { addCategory, editCategory } = useGameStore();
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || '📚');
    const [color, setColor] = useState(category?.color || 'bg-blue-500');

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];

    const handleSubmit = () => {
        if (!name.trim()) return;
        if (category) {
            editCategory(category.id, { name, icon, color });
        } else {
            addCategory({ name, icon, color });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">{category ? 'Edit' : 'Add'} Category</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Category Name"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
                <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Emoji Icon (e.g., 📚)"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
                <div className="flex gap-2 flex-wrap mb-4">
                    {colors.map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`} />
                    ))}
                </div>
                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-gray-600">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1">Save</Button>
                </div>
            </motion.div>
        </div>
    );
}

function QuestionForm({ question, categories, onClose }) {
    const { addQuestion, editQuestion } = useGameStore();
    const [type, setType] = useState(question?.type || 'multiple-choice');
    const [category, setCategory] = useState(question?.category || categories[0]?.id);
    const [questionText, setQuestionText] = useState(question?.question || '');
    const [answer, setAnswer] = useState(question?.answer || '');
    const [options, setOptions] = useState(question?.options?.join('\n') || '');
    const [items, setItems] = useState(question?.items?.map(i => i.text).join('\n') || '');
    const [pairs, setPairs] = useState(question?.pairs?.map(p => `${p.left}|${p.right}`).join('\n') || '');

    const handleSubmit = () => {
        if (!questionText.trim()) return;

        let newQuestion = { type, category, question: questionText };

        if (type === 'multiple-choice') {
            newQuestion.options = options.split('\n').filter(o => o.trim());
            newQuestion.answer = answer;
        } else if (type === 'fill-blank') {
            newQuestion.options = options.split('\n').filter(o => o.trim());
            newQuestion.answer = answer;
        } else if (type === 'order') {
            newQuestion.items = items.split('\n').filter(i => i.trim()).map((text, idx) => ({ id: String(idx + 1), text }));
            newQuestion.correctOrder = newQuestion.items.map(i => i.id);
        } else if (type === 'match') {
            newQuestion.pairs = pairs.split('\n').filter(p => p.includes('|')).map(p => {
                const [left, right] = p.split('|');
                return { left: left.trim(), right: right.trim() };
            });
        }

        if (question) {
            editQuestion(question.id, newQuestion);
        } else {
            addQuestion(newQuestion);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl my-4"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">{question ? 'Edit' : 'Add'} Question</h3>

                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 text-gray-900 bg-white">
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="fill-blank">Fill in the Blank</option>
                    <option value="order">Order</option>
                    <option value="match">Match</option>
                </select>

                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 text-gray-900 bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>

                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Question text (use ______ for blanks)"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 h-20 resize-none text-gray-900 placeholder-gray-500"
                />

                {(type === 'multiple-choice' || type === 'fill-blank') && (
                    <>
                        <textarea
                            value={options}
                            onChange={(e) => setOptions(e.target.value)}
                            placeholder="Options (one per line)"
                            className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 h-24 resize-none text-gray-900 placeholder-gray-500"
                        />
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Correct Answer"
                            className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 text-gray-900 placeholder-gray-500"
                        />
                    </>
                )}

                {type === 'order' && (
                    <textarea
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        placeholder="Items in correct order (one per line)"
                        className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 h-24 resize-none text-gray-900 placeholder-gray-500"
                    />
                )}

                {type === 'match' && (
                    <textarea
                        value={pairs}
                        onChange={(e) => setPairs(e.target.value)}
                        placeholder="Pairs (Left|Right, one per line)"
                        className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 h-24 resize-none text-gray-900 placeholder-gray-500"
                    />
                )}

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-gray-600">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1">Save</Button>
                </div>
            </motion.div>
        </div>
    );
}

function JsonImportModal({ onClose }) {
    const { importQuestionsFromJSON } = useGameStore();
    const [jsonInput, setJsonInput] = useState('');
    const [status, setStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImport = async () => {
        if (!jsonInput.trim()) {
            setStatus('⚠️ Please paste JSON data first');
            return;
        }

        setIsProcessing(true);
        setStatus('📤 Processing JSON...');

        try {
            const parsed = JSON.parse(jsonInput);
            const result = await importQuestionsFromJSON(parsed);

            if (result.success) {
                setStatus(`✅ ${result.message}`);
                setTimeout(() => onClose(), 2000);
            } else {
                setStatus(`❌ Error: ${result.message}`);
            }
        } catch (error) {
            setStatus(`❌ Invalid JSON format: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const exampleJSON = `{
  "categories": [
    {
      "id": "custom",
      "name": "Custom Category",
      "icon": "🎯",
      "color": "bg-blue-500"
    }
  ],
  "questions": [
    {
      "type": "multiple-choice",
      "category": "geography",
      "question": "What is the capital?",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    },
    {
      "type": "fill-blank",
      "category": "history",
      "question": "The year was ______.",
      "answer": "1970"
    }
  ]
}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl flex flex-col h-[80vh]"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-2">Import Questions from JSON</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Paste JSON with categories and/or questions. Both are optional in the JSON structure.
                </p>

                <div className="flex-1 mb-4 flex flex-col overflow-hidden">
                    <label className="text-sm font-medium text-gray-700 mb-1">JSON Data:</label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={exampleJSON}
                        className="flex-1 p-4 border-2 border-gray-300 rounded-xl font-mono text-sm resize-none focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                        disabled={isProcessing}
                    />
                </div>

                {status && (
                    <div className={`mb-4 p-3 rounded-lg font-medium ${status.includes('✅') ? 'bg-green-100 text-green-700' :
                            status.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {status}
                    </div>
                )}

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-gray-600" disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleImport} className="flex-1" disabled={isProcessing}>
                        {isProcessing ? 'Importing...' : 'Import'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

