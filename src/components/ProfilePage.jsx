import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Save, Check } from 'lucide-react';
import Button from './Button';
import { updateUserProfile } from '../services/authService';
import { useGameStore } from '../store/gameStore';

export default function ProfilePage({ user, onBack, onUpdate }) {
    const [name, setName] = useState(user?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const { avatarV2, saveUserAvatarV2, avatarFaceTemplates, getBuiltinFaceTemplates } = useGameStore();

    // Only show uneditable (static) templates
    const allTemplates = [...getBuiltinFaceTemplates(), ...avatarFaceTemplates];
    const staticTemplates = allTemplates.filter(t => t?.uneditable && t?.active !== false);
    const selectedTemplate = staticTemplates.find(t => t.id === avatarV2?.templateId) || staticTemplates[0] || null;

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

    const handleSelectAvatar = async (templateId) => {
        if (!user?.uid) return;
        const result = await saveUserAvatarV2(user.uid, { mode: 'static', templateId, selections: {} });
        if (result.ok) {
            setShowAvatarSelector(false);
            setMessage('تم حفظ الصورة الرمزية!');
            setIsSuccess(true);
            setTimeout(() => setMessage(''), 2000);
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
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="size-32 rounded-full bg-gradient-to-br from-wood-dark to-wood-light flex items-center justify-center ring-4 ring-primary/20 shadow-2xl overflow-hidden">
                                {selectedTemplate?.previewAsset?.dataUrl || selectedTemplate?.previewAsset?.url ? (
                                    <img
                                        src={selectedTemplate.previewAsset.dataUrl || selectedTemplate.previewAsset.url}
                                        alt="avatar"
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-wood-dark/50 flex items-center justify-center text-sand/40 text-sm font-bold">
                                        No Avatar
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowAvatarSelector(true)}
                            className="mt-3 text-primary text-sm font-bold hover:underline"
                        >
                            اختر الصورة الرمزية
                        </button>
                        <p className="mt-2 text-sand/50 text-sm font-bold">{user?.email}</p>
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

            {/* Avatar Selection Modal */}
            <AnimatePresence>
                {showAvatarSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-wood-dark border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <h3 className="text-xl font-black text-white mb-4 engraved-text text-center">اختر الصورة الرمزية</h3>
                            
                            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                                {staticTemplates.length === 0 ? (
                                    <div className="text-center py-8 text-sand/50 font-bold">
                                        لا توجد صور رمزية متاحة
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {staticTemplates.map(template => {
                                            const isSelected = avatarV2?.templateId === template.id;
                                            const previewUrl = template?.previewAsset?.dataUrl || template?.previewAsset?.url;
                                            return (
                                                <button
                                                    key={template.id}
                                                    onClick={() => handleSelectAvatar(template.id)}
                                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                                                        isSelected 
                                                            ? 'border-primary bg-primary/20 ring-2 ring-primary/50' 
                                                            : 'border-white/10 bg-wood-dark/60 hover:border-primary/50 hover:bg-wood-dark/80'
                                                    }`}
                                                >
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt={template.name || 'avatar'}
                                                            className="w-full h-full object-contain"
                                                            draggable={false}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-wood-dark/50 flex items-center justify-center text-sand/40 text-xs font-bold">
                                                            {template.name || 'No Image'}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 mt-auto border-t border-white/10">
                                <Button 
                                    onClick={() => setShowAvatarSelector(false)} 
                                    variant="ghost" 
                                    className="flex-1 border border-white/10"
                                >
                                    إغلاق
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
