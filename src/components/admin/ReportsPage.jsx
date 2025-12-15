import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ArrowLeft, Edit2, X, Check, Trash2, Flag } from 'lucide-react';
import Button from '../Button';
import QuestionFormModal from './QuestionFormModal';

export default function ReportsPage({ onBack }) {
    const navigate = useNavigate();
    const { reports, questions, categories, resolveReport, deleteReport, editQuestion } = useGameStore();
    const [filterStatus, setFilterStatus] = useState('pending'); // pending, resolved, dismissed, all
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showQuestionForm, setShowQuestionForm] = useState(false);

    const filteredReports = reports.filter(r => {
        if (filterStatus === 'all') return true;
        return r.status === filterStatus;
    });

    const getQuestionFromReport = (report) => {
        // First try to get from questions array (if question still exists)
        const question = questions.find(q => q.id === report.questionId);
        if (question) return question;
        // Otherwise use the stored questionData
        return report.questionData;
    };

    const handleResolve = async (reportId, action) => {
        await resolveReport(reportId, action);
    };

    const handleEdit = (report) => {
        const question = getQuestionFromReport(report);
        if (question) {
            setEditingQuestion(question);
            setShowQuestionForm(true);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            await deleteReport(reportId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'dismissed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'resolved': return 'Resolved';
            case 'dismissed': return 'Dismissed';
            default: return status;
        }
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack || (() => navigate('/admin'))}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-omani-brown hover:bg-white/90 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-omani-dark flex-1 flex items-center gap-2">
                    <Flag size={24} className="text-omani-red" /> Question Reports
                </h2>
            </div>

            {/* Filter */}
            <div className="mb-4 glass-panel rounded-xl p-3">
                <div className="flex gap-2">
                    {['all', 'pending', 'resolved', 'dismissed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors capitalize ${
                                filterStatus === status
                                    ? 'bg-omani-red text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status === 'all' ? 'All' : getStatusText(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="flex-1 overflow-y-auto glass-panel rounded-2xl p-4 min-h-0">
                {filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-bold">
                        No reports found.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredReports.map(report => {
                            const question = getQuestionFromReport(report);
                            const category = categories.find(c => c.id === question?.category);
                            let reportDate;
                            if (report.createdAt?.toDate) {
                                reportDate = report.createdAt.toDate();
                            } else if (report.createdAt?.seconds) {
                                reportDate = new Date(report.createdAt.seconds * 1000);
                            } else if (report.createdAt) {
                                reportDate = new Date(report.createdAt);
                            } else {
                                reportDate = new Date();
                            }

                            return (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl p-4 shadow-sm"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="text-xl">{category?.icon || '❓'}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(report.status)}`}>
                                                    {getStatusText(report.status)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {reportDate.toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-800 text-sm mb-1">{question?.question || 'Question not found'}</p>
                                            <span className="text-xs text-gray-400 capitalize">{question?.type}</span>
                                        </div>
                                    </div>

                                    {report.reason && (
                                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xs font-bold text-gray-600 mb-1">Report Reason:</p>
                                            <p className="text-sm text-gray-700">{report.reason}</p>
                                        </div>
                                    )}

                                    {report.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(report)}
                                                className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit2 size={16} /> Edit Question
                                            </button>
                                            <button
                                                onClick={() => handleResolve(report.id, 'resolve')}
                                                className="flex-1 py-2 px-3 bg-green-100 text-green-600 rounded-lg font-bold text-sm hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} /> Resolve
                                            </button>
                                            <button
                                                onClick={() => handleResolve(report.id, 'dismiss')}
                                                className="flex-1 py-2 px-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X size={16} /> Dismiss
                                            </button>
                                        </div>
                                    )}

                                    {report.status !== 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(report)}
                                                className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit2 size={16} /> Edit Question
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="py-2 px-3 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Question Edit Modal */}
            {showQuestionForm && editingQuestion && (
                <QuestionFormModal
                    question={editingQuestion}
                    categories={categories}
                    onClose={() => {
                        setShowQuestionForm(false);
                        setEditingQuestion(null);
                    }}
                    onSaved={() => {
                        setShowQuestionForm(false);
                        setEditingQuestion(null);
                    }}
                />
            )}
        </div>
    );
}

