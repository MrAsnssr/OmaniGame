import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ArrowLeft, Plus, Edit2, Trash2, Book, HelpCircle, FileJson, Play, Flag, Folder } from 'lucide-react';
import Button from '../Button';
import QuestionFormModal from './QuestionFormModal';

export default function AdminDashboard({ onBack }) {
    const navigate = useNavigate();
    const { categories, questions, subjects, deleteCategory, deleteQuestion, deleteSubject, startAdminReviewGame } = useGameStore();
    const [activeTab, setActiveTab] = useState('subjects');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showSubjectForm, setShowSubjectForm] = useState(false);
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const filteredQuestions = questions.filter(q => {
        const matchCat = filterCategory === 'all' || q.category === filterCategory;
        const matchType = filterType === 'all' || q.type === filterType;
        return matchCat && matchType;
    });

    const handleStartReviewGame = () => {
        if (filteredQuestions.length === 0) {
            alert('No questions match your filters.');
            return;
        }
        if (filteredQuestions.length > 200) {
            const ok = window.confirm(`Start a review game with ${filteredQuestions.length} questions?`);
            if (!ok) return;
        }
        startAdminReviewGame(filteredQuestions.map(q => q.id), { filterCategory, filterType });
        navigate('/admin/review');
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack || (() => navigate('/'))}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-omani-dark flex-1">Admin Panel</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <button
                    onClick={() => setActiveTab('subjects')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm ${activeTab === 'subjects' ? 'bg-omani-red text-white' : 'glass-card text-omani-dark hover:bg-white/90'}`}
                >
                    <Folder size={16} /> Subjects
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm ${activeTab === 'categories' ? 'bg-omani-red text-white' : 'glass-card text-omani-dark hover:bg-white/90'}`}
                >
                    <Book size={16} /> Topics
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm ${activeTab === 'questions' ? 'bg-omani-red text-white' : 'glass-card text-omani-dark hover:bg-white/90'}`}
                >
                    <HelpCircle size={16} /> Questions
                </button>
                <button
                    onClick={() => navigate('/admin/reports')}
                    className="py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors glass-card text-omani-dark hover:bg-white/90 text-sm"
                >
                    <Flag size={16} /> Reports
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto glass-panel rounded-2xl p-4 min-h-0">
                {activeTab === 'subjects' && (
                    <SubjectList
                        subjects={subjects}
                        categories={categories}
                        onEdit={setEditingSubject}
                        onDelete={deleteSubject}
                        onAdd={() => setShowSubjectForm(true)}
                    />
                )}
                {activeTab === 'categories' && (
                    <CategoryList
                        categories={categories}
                        subjects={subjects}
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
                        onStartReviewGame={handleStartReviewGame}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        filterType={filterType}
                        setFilterType={setFilterType}
                    />
                )}
            </div>

            {/* Modals */}
            {(showSubjectForm || editingSubject) && (
                <SubjectForm
                    subject={editingSubject}
                    onClose={() => { setShowSubjectForm(false); setEditingSubject(null); }}
                />
            )}
            {(showCategoryForm || editingCategory) && (
                <CategoryForm
                    category={editingCategory}
                    subjects={subjects}
                    onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                />
            )}
            {(showQuestionForm || editingQuestion) && (
                <QuestionFormModal
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

// Subject List Component
function SubjectList({ subjects, categories, onEdit, onDelete, onAdd }) {
    return (
        <div className="space-y-3">
            <Button onClick={onAdd} variant="secondary" className="w-full">
                <Plus size={18} /> Add Subject
            </Button>
            {subjects.map(subject => {
                const topicCount = categories.filter(c => c.subjectId === subject.id).length;
                return (
                    <div key={subject.id} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{subject.icon}</span>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block">{subject.name}</span>
                                <span className="text-xs text-gray-500">{topicCount} topics</span>
                            </div>
                            <button onClick={() => onEdit(subject)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(subject.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                    </div>
                );
            })}
            {subjects.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-bold">
                    No subjects yet. Add one to organize your topics!
                </div>
            )}
        </div>
    );
}

// Topic List Component (was CategoryList)
function CategoryList({ categories, subjects, onEdit, onDelete, onAdd }) {
    // Group by subject
    const uncategorized = categories.filter(c => !c.subjectId);
    const categorized = subjects.map(s => ({
        subject: s,
        topics: categories.filter(c => c.subjectId === s.id)
    })).filter(g => g.topics.length > 0);

    return (
        <div className="space-y-3">
            <Button onClick={onAdd} variant="secondary" className="w-full">
                <Plus size={18} /> Add Topic
            </Button>
            
            {/* Uncategorized Topics */}
            {uncategorized.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-amber-700 font-bold text-sm mb-2">⚠️ Uncategorized ({uncategorized.length}) - Won't appear in game!</p>
                    {uncategorized.map(cat => (
                        <div key={cat.id} className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm mb-2 last:mb-0">
                            <span className="text-xl">{cat.icon}</span>
                            <span className="flex-1 font-bold text-gray-800 text-sm">{cat.name}</span>
                            <button onClick={() => onEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => onDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Categorized Topics by Subject */}
            {categorized.map(group => (
                <div key={group.subject.id} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-600 font-bold text-sm mb-2 flex items-center gap-2">
                        <span>{group.subject.icon}</span> {group.subject.name}
                    </p>
                    {group.topics.map(cat => (
                        <div key={cat.id} className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm mb-2 last:mb-0">
                            <span className="text-xl">{cat.icon}</span>
                            <span className="flex-1 font-bold text-gray-800 text-sm">{cat.name}</span>
                            <button onClick={() => onEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => onDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

function QuestionList({
    questions, allQuestionsCount, categories,
    onEdit, onDelete, onAdd, onImport, onStartReviewGame,
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

                <Button
                    onClick={onStartReviewGame}
                    disabled={questions.length === 0}
                    className="w-full"
                >
                    <Play size={18} /> Play filtered ({questions.length})
                </Button>

                {(filterCategory !== 'all' || filterType !== 'all') && questions.length > 0 && (
                    <button
                        onClick={handleDeleteFiltered}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> Delete {questions.length} Filtered Questions
                    </button>
                )}
            </div>

            <div className="text-xs text-gray-600 font-bold px-1">
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
                <div className="text-center py-8 text-gray-500 font-bold">
                    No questions match your filters.
                </div>
            )}
        </div>
    );
}

// Subject Form
function SubjectForm({ subject, onClose }) {
    const { addSubject, editSubject } = useGameStore();
    const [name, setName] = useState(subject?.name || '');
    const [icon, setIcon] = useState(subject?.icon || '📁');

    const handleSubmit = () => {
        if (!name.trim()) return;
        if (subject) {
            editSubject(subject.id, { name, icon });
        } else {
            addSubject({ name, icon });
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
                <h3 className="text-xl font-bold text-gray-800 mb-4">{subject ? 'Edit' : 'Add'} Subject</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Subject Name (e.g., التاريخ)"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
                <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Emoji Icon (e.g., 📁)"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-gray-600">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1">Save</Button>
                </div>
            </motion.div>
        </div>
    );
}

// Topic Form (was CategoryForm)
function CategoryForm({ category, subjects, onClose }) {
    const { addCategory, editCategory } = useGameStore();
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || '📚');
    const [color, setColor] = useState(category?.color || 'bg-blue-500');
    const [subjectId, setSubjectId] = useState(category?.subjectId || '');

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];

    const handleSubmit = () => {
        if (!name.trim()) return;
        const topicData = { name, icon, color, subjectId: subjectId || null };
        if (category) {
            editCategory(category.id, topicData);
        } else {
            addCategory(topicData);
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
                <h3 className="text-xl font-bold text-gray-800 mb-4">{category ? 'Edit' : 'Add'} Topic</h3>
                
                {/* Subject Selection */}
                <div className="mb-3">
                    <label className="block text-sm font-bold text-gray-600 mb-1">Subject (Required for game)</label>
                    <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className={`w-full p-3 border-2 rounded-xl outline-none ${subjectId ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'} text-gray-900`}
                    >
                        <option value="">-- No Subject (Won't appear in game) --</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                        ))}
                    </select>
                </div>
                
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Topic Name"
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

function JsonImportModal({ onClose }) {
    const { categories, addQuestion } = useGameStore();
    const [jsonInput, setJsonInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [status, setStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImport = async () => {
        if (!jsonInput.trim()) {
            setStatus('⚠️ Please paste JSON data first');
            return;
        }

        if (!selectedCategory) {
            setStatus('⚠️ Please select a category');
            return;
        }

        setIsProcessing(true);
        setStatus('📤 Processing JSON...');

        try {
            const parsed = JSON.parse(jsonInput);

            // Normalize to array of questions
            let questionsToImport = [];
            if (Array.isArray(parsed)) {
                questionsToImport = parsed;
            } else if (parsed.questions && Array.isArray(parsed.questions)) {
                questionsToImport = parsed.questions;
            } else if (typeof parsed === 'object' && parsed !== null) {
                questionsToImport = [parsed];
            }

            if (questionsToImport.length === 0) {
                setStatus('⚠️ No questions found in the JSON');
                setIsProcessing(false);
                return;
            }

            let successCount = 0;
            let errorCount = 0;

            for (const q of questionsToImport) {
                try {
                    // Map various field names to our standard format
                    const questionType = q.type || q.questionTypeId || q.questionType || 'multiple-choice';
                    const questionText = q.question || q.text || q.questionText || '';

                    if (!questionText) {
                        errorCount++;
                        continue;
                    }

                    const newQuestion = {
                        category: selectedCategory,
                        question: questionText,
                        type: questionType,
                    };

                    // Handle different question types
                    if (questionType === 'multiple-choice' || questionType === 'four-options') {
                        newQuestion.type = 'multiple-choice';
                        if (q.options && Array.isArray(q.options)) {
                            if (typeof q.options[0] === 'object') {
                                newQuestion.options = q.options.map(o => o.text || o);
                                const correct = q.options.find(o => o.isCorrect);
                                newQuestion.answer = correct ? (correct.text || correct) : (q.answer || q.correctAnswer || newQuestion.options[0]);
                            } else {
                                newQuestion.options = q.options;
                                newQuestion.answer = q.answer || q.correctAnswer || q.options[0];
                            }
                        }
                    } else if (questionType === 'fill-blank') {
                        newQuestion.answer = q.answer || q.correctAnswer || '';
                        newQuestion.options = q.options || [newQuestion.answer];
                    } else if (questionType === 'order' || questionType === 'order-challenge') {
                        newQuestion.type = 'order';
                        if (q.items) {
                            newQuestion.items = q.items.map((item, idx) => ({
                                id: String(item.id || idx + 1),
                                text: item.text || item
                            }));
                            newQuestion.correctOrder = q.correctOrder || newQuestion.items.map(i => i.id);
                        } else if (q.orderItems) {
                            newQuestion.items = q.orderItems.map(i => ({
                                id: String(i.id),
                                text: i.text
                            }));
                            const sorted = [...q.orderItems].sort((a, b) => a.correctPosition - b.correctPosition);
                            newQuestion.correctOrder = sorted.map(i => String(i.id));
                        }
                    } else if (questionType === 'match' || questionType === 'who-and-who') {
                        newQuestion.type = 'match';
                        if (q.pairs) {
                            newQuestion.pairs = q.pairs;
                        } else if (q.whoAndWhoData) {
                            const { people, achievements } = q.whoAndWhoData;
                            newQuestion.pairs = achievements.map(a => {
                                const person = people.find(p => p.id === a.personId);
                                return { left: person ? person.name : 'Unknown', right: a.text };
                            });
                        }
                    }

                    await addQuestion(newQuestion);
                    successCount++;
                } catch (err) {
                    console.error('Error importing question:', err);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                setStatus(`✅ Imported ${successCount} question${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
                setTimeout(() => onClose(), 2000);
            } else {
                setStatus(`❌ Failed to import any questions. Check your JSON format.`);
            }
        } catch (error) {
            setStatus(`❌ Invalid JSON: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const exampleJSON = `[
  {
    "text": "السؤال هنا ______.",
    "questionTypeId": "fill-blank",
    "correctAnswer": "الجواب"
  },
  {
    "text": "من هو...؟",
    "questionTypeId": "four-options",
    "options": [
      { "text": "Option 1", "isCorrect": false },
      { "text": "Option 2", "isCorrect": true }
    ]
  }
]`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl flex flex-col h-[80vh]"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-2">Import Questions from JSON</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Supports: <b>fill-blank</b>, <b>four-options</b>, <b>order-challenge</b>, <b>who-and-who</b>
                </p>

                {/* Category Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Import to Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full p-3 border-2 rounded-xl focus:border-blue-500 outline-none bg-white ${selectedCategory ? 'border-gray-300 text-gray-900' : 'border-amber-400 text-gray-500'}`}
                        disabled={isProcessing}
                    >
                        <option value="" disabled>-- Select a category --</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                </div>

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

