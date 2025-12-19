import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, LogOut, User, Bell, HelpCircle, X, Armchair, Users, RotateCcw, CheckSquare, PenLine, ListOrdered, GitCompare } from 'lucide-react';
import Button from './Button';
import { signOut } from '../services/authService';

// List of admin email addresses
const ADMIN_EMAILS = [
    'admin@omanigame.com',
    'abosulaiman011@gmail.com',
    'asnssrr@gmail.com',
];

export default function SettingsPage({ onBack, onAdmin, user, onLogout }) {
    const navigate = useNavigate();
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const handleLogout = async () => {
        await signOut();
        onLogout?.();
        onBack?.();
    };

    const settingsItems = [
        { icon: User, label: 'الملف الشخصي', onClick: () => navigate('/profile'), show: !!user },
        { icon: Bell, label: 'الإشعارات', onClick: () => { }, show: true },
        { icon: HelpCircle, label: 'المساعدة', onClick: () => setShowHelpModal(true), show: true },
        { icon: Shield, label: 'لوحة التحكم', onClick: onAdmin, show: isAdmin, special: true },
    ];

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text">الإعدادات</h2>
            </div>

            {/* User Info Card */}
            {user && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-2xl p-4 mb-4 flex items-center gap-4 border border-white/5"
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center overflow-hidden ring-2 ring-primary/50 shadow-inner">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-white">
                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-lg truncate engraved-text">{user.displayName || 'مستخدم'}</p>
                        <p className="text-sand/50 text-sm font-bold truncate">{user.email}</p>
                        {isAdmin && (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-orange-700 text-white text-[10px] px-3 py-1 rounded-full mt-1 font-bold shadow-lg uppercase tracking-wider">
                                <Shield size={10} /> مسؤول
                            </span>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Settings List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {settingsItems
                    .filter(item => item.show)
                    .map((item, index) => (
                        <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={item.onClick}
                            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${item.special
                                ? 'bg-gradient-to-r from-primary to-orange-700 text-white shadow-lg border-b-4 border-black/20 hover:brightness-110'
                                : 'glass-card text-sand hover:bg-wood-light/80 hover:text-white font-bold border border-white/5'
                                }`}
                        >
                            <item.icon size={24} />
                            <span className="font-bold">{item.label}</span>
                        </motion.button>
                    ))}
            </div>

            {/* Logout Button */}
            {user && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                >
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-white/5 font-bold">
                        <LogOut size={20} />
                        تسجيل الخروج
                    </Button>
                </motion.div>
            )}

            {/* Login Prompt */}
            {!user && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-center text-sand/50 font-bold"
                >
                    <p>سجل دخولك لمزيد من الإعدادات</p>
                </motion.div>
            )}

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-wood-dark border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="text-xl font-black text-white engraved-text">المساعدة</h3>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-8 h-8 rounded-full bg-wood-dark/80 flex items-center justify-center text-sand/50 hover:bg-wood-dark hover:text-white transition-colors border border-white/5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Game Modes Section */}
                            <div>
                                <h4 className="text-lg font-black text-primary mb-3 flex items-center gap-2">
                                    🎮 أنواع اللعب
                                </h4>

                                {/* Solo Mode */}
                                <div className="bg-wood-dark/50 border border-white/5 rounded-xl p-3 mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Armchair size={18} className="text-primary" />
                                        <span className="font-bold text-white">القلعة (فردي)</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        لعب فردي بدون إنترنت. اختار الموضوع وعدد الأسئلة وجاوب بروقانك!
                                    </p>
                                </div>

                                {/* Online Classic */}
                                <div className="bg-wood-dark/50 border border-white/5 rounded-xl p-3 mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users size={18} className="text-primary" />
                                        <span className="font-bold text-white">السبلة - العادي (أونلاين)</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        العب مع ربعك أونلاين! كلكم تجاوبون على نفس السؤال بنفس الوقت. اللي يجاوب أسرع ياخذ نقاط أكثر.
                                    </p>
                                </div>

                                {/* Online Turn-based */}
                                <div className="bg-wood-dark/50 border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <RotateCcw size={18} className="text-primary" />
                                        <span className="font-bold text-white">السبلة - بالدور (أونلاين)</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        كل لاعب يختار موضوع السؤال بالدور. استراتيجية أكثر! اختار الموضوع اللي تعرفه عشان تتفوق على ربعك.
                                    </p>
                                </div>
                            </div>

                            {/* Question Types Section */}
                            <div>
                                <h4 className="text-lg font-black text-omani-gold mb-3 flex items-center gap-2">
                                    ❓ أنواع الأسئلة
                                </h4>

                                {/* Multiple Choice */}
                                <div className="bg-wood-dark/30 border border-white/5 rounded-xl p-3 mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckSquare size={18} className="text-omani-gold" />
                                        <span className="font-bold text-white">اختيار من متعدد</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        أربع خيارات وجواب واحد صح. اختار الجواب الصحيح!
                                    </p>
                                </div>

                                {/* Fill in the Blank */}
                                <div className="bg-wood-dark/30 border border-white/5 rounded-xl p-3 mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <PenLine size={18} className="text-omani-gold" />
                                        <span className="font-bold text-white">كمّل الفراغ</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        اكتب الكلمة الناقصة. انتبه للتلميح - إذا الجواب بالإنجليزي بيقولك!
                                    </p>
                                </div>

                                {/* Order */}
                                <div className="bg-wood-dark/30 border border-white/5 rounded-xl p-3 mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ListOrdered size={18} className="text-omani-gold" />
                                        <span className="font-bold text-white">رتّب</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        رتب العناصر بالترتيب الصحيح. اسحب وحط! (السنين مخفية عشان ما تساعدك 😉)
                                    </p>
                                </div>

                                {/* Match */}
                                <div className="bg-wood-dark/30 border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <GitCompare size={18} className="text-omani-gold" />
                                        <span className="font-bold text-white">وصّل</span>
                                    </div>
                                    <p className="text-sand/70 text-sm">
                                        وصل كل عنصر من اليمين بالعنصر المناسب من اليسار.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-full p-3 rounded-xl bg-primary text-white font-bold shadow-lg"
                            >
                                فهمت! 👍
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
