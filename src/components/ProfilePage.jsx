import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Camera, Save, Check } from 'lucide-react';
import Button from './Button';
import { updateUserProfile } from '../services/authService';

export default function ProfilePage({ user, onBack, onUpdate }) {
    const [name, setName] = useState(user?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setIsLoading(true);
        setMessage('');
        setIsSuccess(false);

        const result = await updateUserProfile(name.trim());
        
        setIsLoading(false);
        if (result.success) {
            setMessage('تم تحديث الملف الشخصي بنجاح!');
            setIsSuccess(true);
            onUpdate?.(result.user);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result.error);
            setIsSuccess(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text">الملف الشخصي</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-md mx-auto w-full space-y-8 py-4">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="size-32 rounded-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-white ring-4 ring-primary/20 shadow-2xl overflow-hidden">
                                {user?.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold">
                                        {(name || user?.email || 'U')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 size-10 rounded-full bg-wood-dark border-2 border-primary text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all">
                                <Camera size={20} />
                            </button>
                        </div>
                        <p className="mt-4 text-sand/50 text-sm font-bold">{user?.email}</p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sand text-sm font-bold px-1 flex items-center gap-2">
                                <User size={16} /> الاسم المستعار
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="اكتب اسمك الجديد"
                                    className="w-full p-4 rounded-xl bg-wood-dark/50 border-2 border-white/5 text-white font-bold placeholder-sand/20 outline-none focus:border-primary transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${
                                    isSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                            >
                                {isSuccess ? <Check size={18} /> : null}
                                {message}
                            </motion.div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isLoading || name.trim() === user?.displayName} 
                            className="w-full shadow-lg h-14"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">جاري الحفظ...</span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    <Save size={20} /> حفظ التغييرات
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Stats or other info could go here */}
                    <div className="pt-8">
                        <div className="glass-panel rounded-2xl p-6 border border-white/5">
                            <h3 className="text-white font-bold mb-4">معلومات الحساب</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-sand/50">تاريخ الانضمام</span>
                                    <span className="text-sand font-bold">
                                        {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ar-OM') : 'غير متوفر'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-sand/50">نوع الحساب</span>
                                    <span className="text-primary font-bold">لاعب محترف</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
