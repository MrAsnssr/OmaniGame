import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ArrowLeft, Plus, Edit2, Trash2, Book, HelpCircle, FileJson, Play, Flag, Folder, Store, Smile } from 'lucide-react';
import Button from '../Button';
import QuestionFormModal from './QuestionFormModal';

export default function AdminDashboard({ onBack }) {
    const navigate = useNavigate();
    const { 
        categories, questions, subjects, 
        marketItems, addMarketItem, editMarketItem, deleteMarketItem,
        avatarFaceTemplates, avatarParts,
        addAvatarFaceTemplate, editAvatarFaceTemplate, deleteAvatarFaceTemplate,
        addAvatarPart, editAvatarPart, deleteAvatarPart, saveAvatarPartTransform,
        uploadAvatarAsset,
        deleteCategory, deleteQuestion, deleteSubject, startAdminReviewGame 
    } = useGameStore();
    const [activeTab, setActiveTab] = useState('subjects');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editingMarketItem, setEditingMarketItem] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showSubjectForm, setShowSubjectForm] = useState(false);
    const [showMarketItemForm, setShowMarketItemForm] = useState(false);
    const [showAvatarTemplateForm, setShowAvatarTemplateForm] = useState(false);
    const [showAvatarPartForm, setShowAvatarPartForm] = useState(false);
    const [editingAvatarTemplate, setEditingAvatarTemplate] = useState(null);
    const [editingAvatarPart, setEditingAvatarPart] = useState(null);
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
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-white flex-1 engraved-text">Admin Panel</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <button
                    onClick={() => setActiveTab('subjects')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm border-b-4 ${activeTab === 'subjects' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    <Folder size={16} /> Subjects
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm border-b-4 ${activeTab === 'categories' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    <Book size={16} /> Topics
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm border-b-4 ${activeTab === 'questions' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    <HelpCircle size={16} /> Questions
                </button>
                <button
                    onClick={() => setActiveTab('market')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm border-b-4 ${activeTab === 'market' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    <Store size={16} /> Market
                </button>
                <button
                    onClick={() => setActiveTab('avatar')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm border-b-4 ${activeTab === 'avatar' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    <Smile size={16} /> Avatar
                </button>
                <button
                    onClick={() => navigate('/admin/reports')}
                    className="py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80 border-b-4 text-sm"
                >
                    <Flag size={16} /> Reports
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto glass-panel rounded-2xl p-4 min-h-0 border border-white/5">
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
                {activeTab === 'market' && (
                    <MarketList
                        marketItems={marketItems}
                        categories={categories}
                        onEdit={setEditingMarketItem}
                        onDelete={deleteMarketItem}
                        onAdd={() => setShowMarketItemForm(true)}
                    />
                )}
                {activeTab === 'avatar' && (
                    <AvatarAdmin
                        templates={avatarFaceTemplates}
                        parts={avatarParts}
                        onAddTemplate={() => setShowAvatarTemplateForm(true)}
                        onEditTemplate={setEditingAvatarTemplate}
                        onDeleteTemplate={deleteAvatarFaceTemplate}
                        onAddPart={() => setShowAvatarPartForm(true)}
                        onEditPart={setEditingAvatarPart}
                        onDeletePart={deleteAvatarPart}
                        onSaveTransform={saveAvatarPartTransform}
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
            {(showMarketItemForm || editingMarketItem) && (
                <MarketItemForm
                    item={editingMarketItem}
                    categories={categories}
                    subjects={subjects}
                    onClose={() => { setShowMarketItemForm(false); setEditingMarketItem(null); }}
                    onCreate={addMarketItem}
                    onUpdate={editMarketItem}
                />
            )}
            {(showAvatarTemplateForm || editingAvatarTemplate) && (
                <AvatarTemplateForm
                    template={editingAvatarTemplate}
                    onClose={() => { setShowAvatarTemplateForm(false); setEditingAvatarTemplate(null); }}
                    onCreate={addAvatarFaceTemplate}
                    onUpdate={editAvatarFaceTemplate}
                    uploadAvatarAsset={uploadAvatarAsset}
                />
            )}
            {(showAvatarPartForm || editingAvatarPart) && (
                <AvatarPartForm
                    part={editingAvatarPart}
                    onClose={() => { setShowAvatarPartForm(false); setEditingAvatarPart(null); }}
                    onCreate={addAvatarPart}
                    onUpdate={editAvatarPart}
                    uploadAvatarAsset={uploadAvatarAsset}
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
            <Button onClick={onAdd} variant="primary" className="w-full shadow-lg">
                <Plus size={18} /> Add Subject
            </Button>
            {subjects.map(subject => {
                const topicCount = categories.filter(c => c.subjectId === subject.id).length;
                return (
                    <div key={subject.id} className="bg-wood-dark/50 border border-white/5 rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{subject.icon}</span>
                            <div className="flex-1">
                                <span className="font-bold text-white block">{subject.name}</span>
                                <span className="text-xs text-sand/50">{topicCount} topics</span>
                            </div>
                            <button onClick={() => onEdit(subject)} className="p-2 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(subject.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                    </div>
                );
            })}
            {subjects.length === 0 && (
                <div className="text-center py-8 text-sand/50 font-bold">
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
            <Button onClick={onAdd} variant="primary" className="w-full shadow-lg">
                <Plus size={18} /> Add Topic
            </Button>
            
            {/* Uncategorized Topics */}
            {uncategorized.length > 0 && (
                <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3 mb-4">
                    <p className="text-primary font-bold text-sm mb-2">⚠️ Uncategorized ({uncategorized.length}) - Won't appear in game!</p>
                    {uncategorized.map(cat => (
                        <div key={cat.id} className="bg-wood-dark/50 border border-white/5 rounded-lg p-3 flex items-center gap-3 shadow-sm mb-2 last:mb-0">
                            <span className="text-xl">{cat.icon}</span>
                            <span className="flex-1 font-bold text-white text-sm">{cat.name}</span>
                            <button onClick={() => onEdit(cat)} className="p-1.5 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => onDelete(cat.id)} className="p-1.5 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Categorized Topics by Subject */}
            {categorized.map(group => (
                <div key={group.subject.id} className="bg-wood-dark/30 border border-white/5 rounded-xl p-3">
                    <p className="text-sand font-bold text-sm mb-2 flex items-center gap-2">
                        <span>{group.subject.icon}</span> {group.subject.name}
                    </p>
                    {group.topics.map(cat => (
                        <div key={cat.id} className="bg-wood-dark/50 border border-white/5 rounded-lg p-3 flex items-center gap-3 shadow-sm mb-2 last:mb-0">
                            <span className="text-xl">{cat.icon}</span>
                            <span className="flex-1 font-bold text-white text-sm">{cat.name}</span>
                            <button onClick={() => onEdit(cat)} className="p-1.5 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => onDelete(cat.id)} className="p-1.5 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
                <Button onClick={onAdd} variant="primary" className="w-full">
                    <Plus size={18} /> Add
                </Button>
                <Button onClick={onImport} variant="ghost" className="w-full border-2 border-dashed border-white/10 text-sand hover:border-primary hover:text-white transition-all">
                    <FileJson size={18} /> Import
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-wood-dark/50 border border-white/5 p-3 rounded-xl flex flex-col gap-2 shadow-inner">
                <div className="flex gap-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-wood-dark border-2 border-white/10 text-sm font-bold text-white outline-none focus:border-primary"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-wood-dark border-2 border-white/10 text-sm font-bold text-white outline-none focus:border-primary"
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
                    className="w-full shadow-lg"
                >
                    <Play size={18} /> Play filtered ({questions.length})
                </Button>

                {(filterCategory !== 'all' || filterType !== 'all') && questions.length > 0 && (
                    <button
                        onClick={handleDeleteFiltered}
                        className="w-full py-2 bg-red-400/10 text-red-400 border border-red-400/20 rounded-lg font-bold text-sm hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> Delete {questions.length} Filtered Questions
                    </button>
                )}
            </div>

            <div className="text-xs text-sand/50 font-bold px-1">
                Showing {questions.length} of {allQuestionsCount} questions
            </div>

            {questions.map(q => {
                const cat = categories.find(c => c.id === q.category);
                return (
                    <div key={q.id} className="bg-wood-dark/50 border border-white/5 rounded-xl p-4 shadow-md">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">{cat?.icon || '❓'}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm line-clamp-2">{q.question}</p>
                                <span className="text-xs text-sand/40 capitalize">{q.type}</span>
                            </div>
                            <button onClick={() => onEdit(q)} className="p-2 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(q.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                    </div>
                );
            })}

            {questions.length === 0 && (
                <div className="text-center py-8 text-sand/50 font-bold">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
                <h3 className="text-xl font-bold text-white mb-4 engraved-text">{subject ? 'Edit' : 'Add'} Subject</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Subject Name (e.g., التاريخ)"
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30"
                />
                <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Emoji Icon (e.g., 📁)"
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30"
                />
                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1 shadow-lg">Save</Button>
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
    const [color, setColor] = useState(category?.color || 'bg-primary');
    const [subjectId, setSubjectId] = useState(category?.subjectId || '');
    const [isPremium, setIsPremium] = useState(!!category?.isPremium);
    const [priceDirhams, setPriceDirhams] = useState(
        Number.isFinite(Number(category?.priceDirhams)) ? String(category.priceDirhams) : '0'
    );

    const colors = ['bg-primary', 'bg-orange-700', 'bg-wood-light', 'bg-wood-dark', 'bg-sand', 'bg-red-600', 'bg-green-700'];

    const handleSubmit = () => {
        if (!name.trim()) return;
        const parsedPrice = Math.max(0, Number(priceDirhams || 0));
        const topicData = {
            name,
            icon,
            color,
            subjectId: subjectId || null,
            isPremium: !!isPremium,
            priceDirhams: Number.isFinite(parsedPrice) ? parsedPrice : 0
        };
        if (category) {
            editCategory(category.id, topicData);
        } else {
            addCategory(topicData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-4"
            >
                <h3 className="text-xl font-bold text-white mb-4 engraved-text">{category ? 'Edit' : 'Add'} Topic</h3>
                
                {/* Subject Selection */}
                <div className="mb-3">
                    <label className="block text-sm font-bold text-sand/70 mb-1">Subject (Required for game)</label>
                    <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className={`w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 ${subjectId ? 'border-primary/50 text-white' : 'border-primary/30 text-sand/50'}`}
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
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30"
                />
                <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Emoji Icon (e.g., 📚)"
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30"
                />
                
                {/* Premium Toggle */}
                <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-3">
                    <label className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-bold text-white">Premium Topic</div>
                            <div className="text-xs text-sand/50">Online only: requires purchase in Market</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                            className="size-5 accent-[#FFD700]"
                        />
                    </label>
                    <div className="mt-2">
                        <label className="block text-xs font-bold text-sand/70 mb-1">Price (Dirhams)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={priceDirhams}
                            onChange={(e) => setPriceDirhams(e.target.value)}
                            className={`w-full p-3 bg-wood-dark/50 border-2 rounded-xl outline-none text-white placeholder-sand/30 ${isPremium ? 'border-primary/40 focus:border-primary' : 'border-white/10 focus:border-primary/50'}`}
                            placeholder="0"
                            disabled={!isPremium}
                        />
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                    {colors.map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-primary border-2 border-white/20' : 'border border-white/10'}`} />
                    ))}
                </div>
                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1 shadow-lg">Save</Button>
                </div>
            </motion.div>
        </div>
    );
}

function MarketList({ marketItems, categories, onEdit, onDelete, onAdd }) {
    const active = marketItems.filter(i => i?.active !== false);
    const inactive = marketItems.filter(i => i?.active === false);

    const getTypeLabel = (t) => {
        if (t === 'topic_unlock') return 'Topic Unlock';
        if (t === 'subject_unlock') return 'Subject Unlock';
        if (t === 'hint') return 'Hint';
        if (t === 'cosmetic') return 'Cosmetic';
        return 'Other';
    };

    const getTopicLabel = (topicId) => {
        const t = categories.find(c => c.id === topicId);
        return t ? `${t.icon || '📚'} ${t.name}` : 'Unknown topic';
    };

    const renderItem = (item) => (
        <div key={item.id} className="bg-wood-dark/50 border border-white/5 rounded-xl p-4 shadow-md">
            <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-wood-dark/60 border border-white/5 flex items-center justify-center text-xl">
                    {item.icon || '🛒'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm truncate">{item.title || 'Untitled'}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                            {getTypeLabel(item.type)}
                        </span>
                        {item.active === false && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/10 text-red-300 font-bold border border-red-400/20">
                                Inactive
                            </span>
                        )}
                    </div>
                    {item.description && (
                        <p className="text-xs text-sand/50 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {item.type === 'topic_unlock' && item.topicId && (
                        <p className="text-xs text-sand/60 mt-1">Unlock: {getTopicLabel(item.topicId)}</p>
                    )}
                    <p className="text-xs text-[#FFD700] font-bold mt-2">💰 {Number(item.priceDirhams || 0)} دراهم</p>
                </div>
                <button onClick={() => onEdit(item)} className="p-2 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            <Button onClick={onAdd} variant="primary" className="w-full shadow-lg">
                <Plus size={18} /> Add Market Item
            </Button>
            {active.map(renderItem)}
            {inactive.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <div className="text-xs text-sand/50 font-bold mb-2">Inactive</div>
                    <div className="space-y-2">
                        {inactive.map(renderItem)}
                    </div>
                </div>
            )}
            {marketItems.length === 0 && (
                <div className="text-center py-8 text-sand/50 font-bold">
                    No market items yet.
                </div>
            )}
        </div>
    );
}

function MarketItemForm({ item, categories, subjects, onClose, onCreate, onUpdate }) {
    const [type, setType] = useState(item?.type || 'topic_unlock');
    const [title, setTitle] = useState(item?.title || '');
    const [description, setDescription] = useState(item?.description || '');
    const [icon, setIcon] = useState(item?.icon || '🛒');
    const [priceDirhams, setPriceDirhams] = useState(String(Number(item?.priceDirhams || 0)));
    const [active, setActive] = useState(item?.active !== false);
    const [topicId, setTopicId] = useState(item?.topicId || '');
    const [subjectId, setSubjectId] = useState(item?.subjectId || '');

    const selectedTopic = categories.find(c => c.id === topicId) || null;
    const isTopicUnlock = type === 'topic_unlock';
    const selectedSubject = subjects?.find(s => s.id === subjectId) || null;
    const isSubjectUnlock = type === 'subject_unlock';

    const handleSubmit = () => {
        if (isTopicUnlock && !topicId) return;
        if (isSubjectUnlock && !subjectId) return;
        if (!isTopicUnlock && !isSubjectUnlock && !title.trim()) return;
        const payload = {
            type,
            title: isTopicUnlock ? (selectedTopic?.name || '') : isSubjectUnlock ? (selectedSubject?.name || '') : title.trim(),
            description: description.trim(),
            icon: isTopicUnlock ? (selectedTopic?.icon || '') : isSubjectUnlock ? (selectedSubject?.icon || '') : icon.trim(),
            priceDirhams: Math.max(0, Number(priceDirhams || 0)),
            active: !!active
        };
        if (type === 'topic_unlock') payload.topicId = topicId || null;
        if (type === 'subject_unlock') payload.subjectId = subjectId || null;
        if (item) onUpdate(item.id, payload);
        else onCreate(payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-4"
            >
                <h3 className="text-xl font-bold text-white mb-4 engraved-text">{item ? 'Edit' : 'Add'} Market Item</h3>

                <label className="block text-sm font-bold text-sand/70 mb-1">Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white mb-3"
                >
                    <option value="subject_unlock">Subject Unlock</option>
                    <option value="topic_unlock">Topic Unlock</option>
                    <option value="hint">Hint</option>
                    <option value="cosmetic">Cosmetic</option>
                </select>

                {type === 'subject_unlock' && (
                    <>
                        <label className="block text-sm font-bold text-sand/70 mb-1">Subject</label>
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white mb-3"
                        >
                            <option value="">-- select subject --</option>
                            {(subjects || []).map(s => (
                                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                            ))}
                        </select>
                        <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-3 text-xs text-sand/60">
                            الاسم والإيموجي يتم أخذهم تلقائياً من الـ Subject المختار.
                        </div>
                    </>
                )}

                {type === 'topic_unlock' && (
                    <>
                        <label className="block text-sm font-bold text-sand/70 mb-1">Topic</label>
                        <select
                            value={topicId}
                            onChange={(e) => setTopicId(e.target.value)}
                            className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white mb-3"
                        >
                            <option value="">-- select topic --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                        <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-3 text-xs text-sand/60">
                            الاسم والإيموجي يتم أخذهم تلقائياً من المجال المختار.
                        </div>
                    </>
                )}

                {(!isTopicUnlock && !isSubjectUnlock) && (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30"
                    />
                )}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    rows={3}
                    className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30"
                />
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {(!isTopicUnlock && !isSubjectUnlock) ? (
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="Icon (emoji)"
                            className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl focus:border-primary outline-none text-white placeholder-sand/30"
                        />
                    ) : (
                        <div className="w-full p-3 bg-wood-dark/30 border-2 border-white/5 rounded-xl text-white flex items-center justify-center gap-2">
                            <span className="text-xl">{isSubjectUnlock ? (selectedSubject?.icon || '📁') : (selectedTopic?.icon || '📚')}</span>
                            <span className="text-sm font-bold truncate">{isSubjectUnlock ? (selectedSubject?.name || 'اختر Subject') : (selectedTopic?.name || 'اختر مجال')}</span>
                        </div>
                    )}
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={priceDirhams}
                        onChange={(e) => setPriceDirhams(e.target.value)}
                        placeholder="Price"
                        className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl focus:border-primary outline-none text-white placeholder-sand/30"
                    />
                </div>
                <label className="flex items-center justify-between gap-3 bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-4">
                    <div>
                        <div className="text-sm font-bold text-white">Active</div>
                        <div className="text-xs text-sand/50">Show in Market</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="size-5 accent-primary"
                    />
                </label>

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1 shadow-lg">Save</Button>
                </div>
            </motion.div>
        </div>
    );
}

function AvatarAdmin({
    templates,
    parts,
    onAddTemplate,
    onEditTemplate,
    onDeleteTemplate,
    onAddPart,
    onEditPart,
    onDeletePart,
    onSaveTransform
}) {
    const [subTab, setSubTab] = useState('templates'); // templates | parts | editor
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [transform, setTransform] = useState({ x: 50, y: 50, scale: 1, rotation: 0, sizePct: 40 });
    const [showGuides, setShowGuides] = useState(true);
    const [snapToGuides, setSnapToGuides] = useState(true);

    const slotLabel = (s) => {
        switch (s) {
            case 'hair_hat': return 'Hair/Hat';
            case 'eyebrows': return 'Eyebrows';
            case 'eyes': return 'Eyes';
            case 'nose': return 'Nose';
            case 'mouth': return 'Mouth';
            case 'facial_hair': return 'Facial Hair';
            default: return s || 'Unknown';
        }
    };

    const combinedTemplates = [
        ...useGameStore.getState().getBuiltinFaceTemplates(),
        ...templates
    ];

    const selectedTemplate = combinedTemplates.find(t => t.id === selectedTemplateId) || combinedTemplates[0] || null;
    const selectedPart = parts.find(p => p.id === selectedPartId) || null;
    const selectedAsset = selectedPart?.assets?.find(a => a.assetId === selectedAssetId) || selectedPart?.assets?.[0] || null;

    const canvasBgUrl = selectedTemplate?.previewAsset?.url || null;

    const applyExistingTransform = () => {
        if (!selectedTemplate || !selectedPart) return;
        const byTemplate = selectedPart.transformsByTemplate || {};
        const saved = byTemplate[selectedTemplate.id] || byTemplate['round'] || null;
        if (saved) setTransform({ x: saved.x ?? 50, y: saved.y ?? 50, scale: saved.scale ?? 1, rotation: saved.rotation ?? 0, sizePct: saved.sizePct ?? 40 });
        else setTransform({ x: 50, y: 50, scale: 1, rotation: 0, sizePct: 40 });
    };

    const handleSave = async () => {
        if (!selectedTemplate || !selectedPart) return;
        await onSaveTransform({ partId: selectedPart.id, templateId: selectedTemplate.id, transform });
        alert('Saved transform for this head shape.');
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <button
                    onClick={() => setSubTab('templates')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm border-b-4 ${subTab === 'templates' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    Face Templates
                </button>
                <button
                    onClick={() => setSubTab('parts')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm border-b-4 ${subTab === 'parts' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    Parts Catalog
                </button>
                <button
                    onClick={() => setSubTab('editor')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm border-b-4 ${subTab === 'editor' ? 'bg-primary text-white border-black/30' : 'bg-wood-dark/50 text-sand border-white/5 hover:bg-wood-dark/80'}`}
                >
                    Position Editor
                </button>
            </div>

            {subTab === 'templates' && (
                <div className="space-y-3">
                    <Button onClick={onAddTemplate} className="w-full">
                        <Plus size={18} /> Add Face Template
                    </Button>
                    {combinedTemplates.map(t => (
                        <div key={t.id} className="bg-wood-dark/50 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-wood-dark/60 border border-white/5 overflow-hidden flex items-center justify-center">
                                {t.previewAsset?.url ? (
                                    <img src={t.previewAsset.url} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sand/40 text-xs font-bold">No\npreview</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-bold truncate">{t.name || 'Untitled'}</div>
                                <div className="text-xs text-sand/50">active: {t.active === false ? 'no' : 'yes'}</div>
                            </div>
                            {t.isBuiltin ? (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-wood-dark/60 border border-white/10 text-sand/60 font-bold">
                                    Built-in
                                </span>
                            ) : (
                                <>
                                    <button onClick={() => onEditTemplate(t)} className="p-2 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                    <button onClick={() => onDeleteTemplate(t.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </>
                            )}
                        </div>
                    ))}
                    {combinedTemplates.length === 0 && (
                        <div className="text-center py-8 text-sand/50 font-bold">No face templates yet.</div>
                    )}
                </div>
            )}

            {subTab === 'parts' && (
                <div className="space-y-3">
                    <Button onClick={onAddPart} className="w-full">
                        <Plus size={18} /> Add Part
                    </Button>
                    {parts.map(p => (
                        <div key={p.id} className="bg-wood-dark/50 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-wood-dark/60 border border-white/5 overflow-hidden flex items-center justify-center">
                                {Array.isArray(p.assets) && p.assets[0]?.url ? (
                                    <img src={p.assets[0].url} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sand/40 text-xs font-bold">No\nasset</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-bold truncate">{p.name || 'Untitled'}</div>
                                <div className="text-xs text-sand/50">{slotLabel(p.slot)} · z:{Number(p.zIndex || 0)}</div>
                            </div>
                            <button onClick={() => onEditPart(p)} className="p-2 text-primary hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                            <button onClick={() => onDeletePart(p.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    {parts.length === 0 && (
                        <div className="text-center py-8 text-sand/50 font-bold">No parts yet.</div>
                    )}
                </div>
            )}

            {subTab === 'editor' && (
                <div className="space-y-3">
                    <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3">
                        <div className="grid grid-cols-1 gap-2">
                            <select
                                value={selectedTemplateId || (selectedTemplate?.id || '')}
                                onChange={(e) => { setSelectedTemplateId(e.target.value); setTimeout(applyExistingTransform, 0); }}
                                className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white"
                            >
                                {combinedTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedPartId}
                                onChange={(e) => { setSelectedPartId(e.target.value); setSelectedAssetId(''); setTimeout(applyExistingTransform, 0); }}
                                className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white"
                            >
                                <option value="">-- select part --</option>
                                {parts.map(p => (
                                    <option key={p.id} value={p.id}>{slotLabel(p.slot)} · {p.name}</option>
                                ))}
                            </select>

                            {selectedPart && (
                                <select
                                    value={selectedAssetId || (selectedAsset?.assetId || '')}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                    className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white"
                                >
                                    {(selectedPart.assets || []).map(a => (
                                        <option key={a.assetId} value={a.assetId}>{a.kind} · {a.assetId}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="bg-wood-dark/50 border border-white/5 rounded-2xl p-3">
                        <div className="text-xs text-sand/60 mb-2">
                            Drag the asset to position it. Adjust sliders for scale/rotation. Saved per head shape (template).
                        </div>

                        {selectedPart && (!Array.isArray(selectedPart.assets) || selectedPart.assets.length === 0) && (
                            <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm font-bold">
                                هذا الجزء ما عنده Assets. افتح Parts Catalog وارفع PNG/SVG لهذا الجزء.
                            </div>
                        )}

                        {(selectedAsset?.dataUrl || selectedAsset?.url) && (
                            <div className="mb-3 bg-wood-dark/40 border border-white/5 rounded-xl p-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                                        <img src={selectedAsset.dataUrl || selectedAsset.url} alt="thumb" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs text-sand/60 font-bold truncate">Asset:</div>
                                        <div className="text-[10px] text-sand/40 break-all leading-snug">
                                            {selectedAsset.dataUrl ? 'dataUrl (Firestore)' : selectedAsset.url}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20"
                            style={{
                                backgroundImage: canvasBgUrl ? `url(${canvasBgUrl})` : undefined,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }}
                        >
                            {showGuides && (
                                <>
                                    <div className="absolute left-0 right-0 top-1/2 border-t border-white/10 pointer-events-none" />
                                    <div className="absolute top-0 bottom-0 left-1/2 border-l border-white/10 pointer-events-none" />
                                    {/* Suggested face landmarks (tuned for 0-100% square canvas) */}
                                    <div className="absolute left-0 right-0 top-[42%] border-t border-white/10 pointer-events-none" />
                                    <div className="absolute left-0 right-0 top-[58%] border-t border-white/10 pointer-events-none" />
                                    <div className="absolute left-0 right-0 top-[74%] border-t border-white/10 pointer-events-none" />
                                    <div className="absolute right-2 top-2 text-[10px] text-sand/40 font-bold pointer-events-none">
                                        guides: eyes(42) nose(58) mouth(74)
                                    </div>
                                </>
                            )}
                            {!canvasBgUrl && (
                                <div className="absolute inset-0 flex items-center justify-center text-sand/40 text-sm font-bold">
                                    No template preview. Upload a preview to position accurately.
                                </div>
                            )}
                            {(selectedAsset?.dataUrl || selectedAsset?.url) && (
                                <DraggableAsset
                                    url={selectedAsset.dataUrl || selectedAsset.url}
                                    transform={transform}
                                    onChange={setTransform}
                                    snapToGuides={snapToGuides}
                                />
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 text-xs text-sand/70">
                                <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
                                Show guides
                            </label>
                            <label className="flex items-center gap-2 text-xs text-sand/70">
                                <input type="checkbox" checked={snapToGuides} onChange={(e) => setSnapToGuides(e.target.checked)} />
                                Snap
                            </label>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <label className="text-xs text-sand/70">
                                X ({transform.x.toFixed(1)}%)
                                <input type="range" min="0" max="100" step="0.1" value={transform.x} onChange={(e) => setTransform(t => ({ ...t, x: Number(e.target.value) }))} className="w-full" />
                            </label>
                            <label className="text-xs text-sand/70">
                                Y ({transform.y.toFixed(1)}%)
                                <input type="range" min="0" max="100" step="0.1" value={transform.y} onChange={(e) => setTransform(t => ({ ...t, y: Number(e.target.value) }))} className="w-full" />
                            </label>
                            <label className="text-xs text-sand/70">
                                Size ({transform.sizePct.toFixed(0)}%)
                                <input type="range" min="10" max="90" step="1" value={transform.sizePct} onChange={(e) => setTransform(t => ({ ...t, sizePct: Number(e.target.value) }))} className="w-full" />
                            </label>
                            <label className="text-xs text-sand/70">
                                Scale ({transform.scale.toFixed(2)})
                                <input type="range" min="0.2" max="3" step="0.01" value={transform.scale} onChange={(e) => setTransform(t => ({ ...t, scale: Number(e.target.value) }))} className="w-full" />
                            </label>
                            <label className="text-xs text-sand/70">
                                Rotation ({transform.rotation.toFixed(0)}°)
                                <input type="range" min="-180" max="180" step="1" value={transform.rotation} onChange={(e) => setTransform(t => ({ ...t, rotation: Number(e.target.value) }))} className="w-full" />
                            </label>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={applyExistingTransform}
                                className="flex-1 py-2 rounded-xl bg-wood-dark/50 border border-white/10 text-sand font-bold hover:bg-wood-dark/70"
                            >
                                Load saved
                            </button>
                            <button
                                onClick={() => setTransform({ x: 50, y: 50, scale: 1, rotation: 0, sizePct: 40 })}
                                className="flex-1 py-2 rounded-xl bg-wood-dark/50 border border-white/10 text-sand font-bold hover:bg-wood-dark/70"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!selectedTemplate || !selectedPart || !selectedAsset}
                                className="flex-1 py-2 rounded-xl bg-primary text-white font-bold hover:brightness-110 disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DraggableAsset({ url, transform, onChange, snapToGuides }) {
    const [dragging, setDragging] = useState(false);

    const handlePointerDown = (e) => {
        e.preventDefault();
        setDragging(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };

    const handlePointerUp = () => setDragging(false);

    const handlePointerMove = (e) => {
        if (!dragging) return;
        const parent = e.currentTarget.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const clamp = (v) => Math.max(0, Math.min(100, v));
        let nx = clamp(x);
        let ny = clamp(y);

        if (snapToGuides) {
            const guidesX = [50];
            const guidesY = [50, 42, 58, 74];
            const threshold = 1.2; // percent
            const snap = (val, guides) => {
                for (const g of guides) {
                    if (Math.abs(val - g) <= threshold) return g;
                }
                return val;
            };
            nx = snap(nx, guidesX);
            ny = snap(ny, guidesY);
        }

        onChange(t => ({ ...t, x: nx, y: ny }));
    };

    return (
        <img
            src={url}
            alt="asset"
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerMove={handlePointerMove}
            className="absolute select-none cursor-grab active:cursor-grabbing"
            style={{
                left: `${transform.x}%`,
                top: `${transform.y}%`,
                transform: `translate(-50%, -50%) rotate(${transform.rotation}deg) scale(${transform.scale})`,
                transformOrigin: 'center',
                width: `${Number.isFinite(Number(transform.sizePct)) ? Number(transform.sizePct) : 40}%`,
                height: `${Number.isFinite(Number(transform.sizePct)) ? Number(transform.sizePct) : 40}%`,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                outline: '1px solid rgba(255,255,255,0.08)',
                outlineOffset: '2px',
                userSelect: 'none',
                pointerEvents: 'auto'
            }}
        />
    );
}

function AvatarTemplateForm({ template, onClose, onCreate, onUpdate, uploadAvatarAsset }) {
    const [name, setName] = useState(template?.name || '');
    const [active, setActive] = useState(template?.active !== false);
    const [previewAsset, setPreviewAsset] = useState(template?.previewAsset || null);
    const [saving, setSaving] = useState(false);

    const handleUpload = async (file) => {
        if (!file) return;
        const ext = file.name.toLowerCase().endsWith('.svg') ? 'svg' : 'png';
        const res = await uploadAvatarAsset({ file });
        if (res.ok) {
            setPreviewAsset({ kind: ext, dataUrl: res.dataUrl });
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        const payload = {
            name: name.trim(),
            active: !!active,
            previewAsset: previewAsset || null,
            updatedAt: new Date().toISOString(),
            createdAt: template?.createdAt || new Date().toISOString()
        };
        if (template) onUpdate(template.id, payload);
        else onCreate(payload);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-4">
                <h3 className="text-xl font-bold text-white mb-4 engraved-text">{template ? 'Edit' : 'Add'} Face Template</h3>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30" />
                <label className="flex items-center justify-between gap-3 bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-3">
                    <div>
                        <div className="text-sm font-bold text-white">Active</div>
                        <div className="text-xs text-sand/50">Available to players</div>
                    </div>
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-primary" />
                </label>

                <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-4">
                    <div className="text-sm font-bold text-white mb-2">Preview (PNG/SVG)</div>
                    <input type="file" accept=".png,.webp,.svg" onChange={(e) => handleUpload(e.target.files?.[0])} className="w-full text-sm text-sand/70" />
                    {previewAsset?.url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                            <img src={previewAsset.url} alt="preview" className="w-full h-44 object-contain bg-black/20" />
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="flex-1 shadow-lg">{saving ? '...' : 'Save'}</Button>
                </div>
            </motion.div>
        </div>
    );
}

function AvatarPartForm({ part, onClose, onCreate, onUpdate, uploadAvatarAsset }) {
    const [name, setName] = useState(part?.name || '');
    const [slot, setSlot] = useState(part?.slot || 'hair_hat');
    const [zIndex, setZIndex] = useState(String(Number(part?.zIndex || 0)));
    const [active, setActive] = useState(part?.active !== false);
    const [assets, setAssets] = useState(Array.isArray(part?.assets) ? part.assets : []);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [uploading, setUploading] = useState(false);
    const [partId, setPartId] = useState(part?.id || null);
    const assetsRef = React.useRef(assets);

    // keep a synchronous copy so Save never misses uploads
    React.useEffect(() => {
        assetsRef.current = assets;
    }, [assets]);

    const handleUpload = async (file) => {
        if (!file) return;
        if (!partId) {
            setStatus('لازم تحفظ الـ Part أولاً، وبعدها ارفع الصور عشان تنحفظ تحت نفس الـ ID.');
            return;
        }
        setUploading(true);
        setStatus('');
        try {
            const isSvg = file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml';
            const kind = isSvg ? 'svg' : 'png';
            const assetId = `${Date.now()}`;

            // Timeout guard (firebase upload can hang if auth/storage rules block silently)
        const res = await uploadAvatarAsset({ file });

            if (res.ok) {
            const nextAsset = { assetId, kind, dataUrl: res.dataUrl };
                const nextAssets = [...assetsRef.current, nextAsset];
                assetsRef.current = nextAssets;
                setAssets(nextAssets);

                // Persist immediately
                const result = await onUpdate(partId, { assets: nextAssets, updatedAt: new Date().toISOString() });
                if (result?.ok === false) {
                    setStatus(`تم رفع الصورة، لكن صار خطأ أثناء حفظها. ${result?.error?.message ? `(${result.error.message})` : ''}`);
                } else {
                    setStatus('تم رفع الصورة وحفظها تلقائياً ✅');
                }
            } else {
                setStatus(`فشل رفع الصورة. ${res?.error?.message ? `(${res.error.message})` : ''}`);
            }
        } catch (err) {
            setStatus(`فشل رفع الصورة. (${err?.message || 'Unknown error'})`);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        if (uploading) {
            setStatus('انتظر اكتمال رفع الصورة أولاً...');
            return;
        }
        setSaving(true);
        setStatus('');
        const payload = {
            name: name.trim(),
            slot,
            zIndex: Number(zIndex || 0),
            active: !!active,
            assets: assetsRef.current,
            transformsByTemplate: part?.transformsByTemplate || {},
            updatedAt: new Date().toISOString(),
            createdAt: part?.createdAt || new Date().toISOString()
        };
        if (partId) {
            const res = await onUpdate(partId, payload);
            setSaving(false);
            if (res?.ok === false) {
                setStatus(`فشل الحفظ. جرّب مرة ثانية. ${res?.error?.message ? `(${res.error.message})` : ''}`);
                return;
            }
            setStatus('تم الحفظ ✅');
            onClose();
            return;
        }

        const created = await onCreate(payload);
        setSaving(false);
        if (!created?.ok) {
            setStatus(`فشل إنشاء الـ Part. جرّب مرة ثانية. ${created?.error?.message ? `(${created.error.message})` : ''}`);
            return;
        }
        setPartId(created.id);
        setStatus('تم إنشاء الـ Part ✅ الآن ارفع الصور، وبعدها تقدر تروح Position Editor.');
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-4">
                <h3 className="text-xl font-bold text-white mb-4 engraved-text">{part ? 'Edit' : 'Add'} Avatar Part</h3>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Part name" className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl mb-3 focus:border-primary outline-none text-white placeholder-sand/30" />
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white">
                        <option value="hair_hat">hair/hat</option>
                        <option value="eyebrows">eyebrows</option>
                        <option value="eyes">eyes</option>
                        <option value="nose">nose</option>
                        <option value="mouth">mouth</option>
                        <option value="facial_hair">facial hair</option>
                    </select>
                    <input value={zIndex} onChange={(e) => setZIndex(e.target.value)} type="number" step="1" className="w-full p-3 bg-wood-dark/50 border-2 border-white/10 rounded-xl focus:border-primary outline-none text-white" placeholder="zIndex" />
                </div>
                <label className="flex items-center justify-between gap-3 bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-3">
                    <div>
                        <div className="text-sm font-bold text-white">Active</div>
                        <div className="text-xs text-sand/50">Available to players</div>
                    </div>
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-primary" />
                </label>

                <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-4">
                    <div className="text-sm font-bold text-white mb-2">Assets (PNG/SVG)</div>
                    <input
                        type="file"
                        accept=".png,.webp,.svg"
                        disabled={!partId || uploading}
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                        className="w-full text-sm text-sand/70 disabled:opacity-50"
                    />
                    {!partId && (
                        <div className="mt-2 text-xs text-sand/50">
                            احفظ الـ Part أولاً ثم ارفع الصور (عشان تنحفظ تحت نفس الـ ID).
                        </div>
                    )}
                    {status && (
                        <div className="mt-2 text-xs font-bold text-sand/70">
                            {status}
                        </div>
                    )}
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {assets.map(a => (
                            <div key={a.assetId} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                <img src={a.dataUrl || a.url} alt={a.assetId} className="w-full h-full object-contain" />
                            </div>
                        ))}
                    </div>
                    {assets.length === 0 && (
                        <div className="mt-2 text-xs text-sand/50">No assets uploaded yet.</div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || uploading} className="flex-1 shadow-lg">
                        {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
                    </Button>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col h-[80vh]"
            >
                <h3 className="text-xl font-bold text-white mb-2 engraved-text">Import Questions from JSON</h3>
                <p className="text-sm text-sand/50 mb-4">
                    Supports: <b>fill-blank</b>, <b>four-options</b>, <b>order-challenge</b>, <b>who-and-who</b>
                </p>

                {/* Category Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-bold text-sand/70 mb-1">Import to Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 ${selectedCategory ? 'border-primary/50 text-white' : 'border-primary/30 text-sand/50'}`}
                        disabled={isProcessing}
                    >
                        <option value="" disabled>-- Select a category --</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 mb-4 flex flex-col overflow-hidden">
                    <label className="text-sm font-bold text-sand/70 mb-1">JSON Data:</label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={exampleJSON}
                        className="flex-1 p-4 bg-wood-dark/50 border-2 border-white/10 rounded-xl font-mono text-sm resize-none focus:border-primary outline-none text-white placeholder-sand/20"
                        disabled={isProcessing}
                    />
                </div>

                {status && (
                    <div className={`mb-4 p-3 rounded-lg font-bold ${status.includes('✅') ? 'bg-green-400/10 text-green-400' :
                        status.includes('⚠️') ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-red-400/10 text-red-400'
                        }`}>
                        {status}
                    </div>
                )}

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="ghost" className="flex-1 text-sand border border-white/5" disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleImport} className="flex-1 shadow-lg" disabled={isProcessing}>
                        {isProcessing ? 'Importing...' : 'Import'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

