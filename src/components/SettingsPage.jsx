import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, LogOut, User, Bell, HelpCircle } from 'lucide-react';
import Button from './Button';
import { signOut } from '../services/authService';

// List of admin email addresses
const ADMIN_EMAILS = [
    'admin@omanigame.com',
    'abosulaiman011@gmail.com', // Add your email here
];

export default function SettingsPage({ onBack, onAdmin, user, onLogout }) {
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    const handleLogout = async () => {
        await signOut();
        onLogout?.();
        onBack?.();
    };

    const settingsItems = [
        { icon: User, label: 'الحساب', onClick: () => { }, show: !!user },
        { icon: Bell, label: 'الإشعارات', onClick: () => { }, show: true },
        { icon: HelpCircle, label: 'المساعدة', onClick: () => { }, show: true },
        { icon: Shield, label: 'لوحة التحكم', onClick: onAdmin, show: isAdmin, special: true },
    ];

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">الإعدادات</h2>
            </div>

            {/* User Info Card */}
            {user && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 flex items-center gap-4"
                >
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-white">
                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">{user.displayName || 'مستخدم'}</p>
                        <p className="text-white/60 text-sm truncate">{user.email}</p>
                        {isAdmin && (
                            <span className="inline-flex items-center gap-1 bg-omani-gold/20 text-omani-gold text-xs px-2 py-0.5 rounded-full mt-1">
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
                            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${item.special
                                    ? 'bg-gradient-to-r from-omani-red to-red-600 text-white'
                                    : 'bg-white/10 text-white hover:bg-white/20'
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
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/20">
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
                    className="mt-4 text-center text-white/60"
                >
                    <p>سجل دخولك لمزيد من الإعدادات</p>
                </motion.div>
            )}
        </div>
    );
}
