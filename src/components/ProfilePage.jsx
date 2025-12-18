import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Save, Check, Pencil } from 'lucide-react';
import Button from './Button';
import Avatar, { DEFAULT_AVATAR } from './Avatar';
import AvatarEditor from './AvatarEditor';
import AvatarLayered from './AvatarLayered';
import { updateUserProfile } from '../services/authService';
import { useGameStore } from '../store/gameStore';

export default function ProfilePage({ user, onBack, onUpdate }) {
    const [name, setName] = useState(user?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);
    const [showLayeredPicker, setShowLayeredPicker] = useState(false);

    const { avatar, saveUserAvatar, avatarV2, saveUserAvatarV2, avatarFaceTemplates, avatarParts } = useGameStore();

    const avatarMode = avatarV2?.mode || 'builtin';
    const selectedTemplate = avatarFaceTemplates.find(t => t.id === avatarV2?.templateId) || avatarFaceTemplates[0] || null;

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

    const handleSaveAvatar = async (newAvatarConfig) => {
        if (!user?.uid) return;
        const result = await saveUserAvatar(user.uid, newAvatarConfig);
        if (result.ok) {
            setShowAvatarEditor(false);
            setMessage('تم حفظ الصورة الرمزية!');
            setIsSuccess(true);
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const handleSaveAvatarV2 = async (nextAvatarV2) => {
        if (!user?.uid) return;
        const result = await saveUserAvatarV2(user.uid, nextAvatarV2);
        if (result.ok) {
            setShowLayeredPicker(false);
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
                                {avatarMode === 'layered' ? (
                                    <AvatarLayered
                                        size={128}
                                        template={selectedTemplate}
                                        partsCatalog={avatarParts}
                                        selections={avatarV2?.selections || {}}
                                        fallback={<Avatar config={avatar || DEFAULT_AVATAR} size={128} />}
                                    />
                                ) : (
                                    <Avatar config={avatar || DEFAULT_AVATAR} size={128} />
                                )}
                            </div>
                            <button 
                                onClick={() => (avatarMode === 'layered' ? setShowLayeredPicker(true) : setShowAvatarEditor(true))}
                                className="absolute bottom-0 right-0 size-10 rounded-full bg-wood-dark border-2 border-primary text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all"
                            >
                                <Pencil size={18} />
                            </button>
                        </div>
                        <button 
                            onClick={() => (avatarMode === 'layered' ? setShowLayeredPicker(true) : setShowAvatarEditor(true))}
                            className="mt-3 text-primary text-sm font-bold hover:underline"
                        >
                            تعديل الصورة الرمزية
                        </button>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => handleSaveAvatarV2({ mode: 'builtin' })}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border ${avatarMode === 'builtin' ? 'bg-primary text-white border-primary' : 'bg-wood-dark/50 text-sand border-white/10 hover:bg-wood-dark/70'}`}
                            >
                                Built-in
                            </button>
                            <button
                                onClick={() => setShowLayeredPicker(true)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border ${avatarMode === 'layered' ? 'bg-primary text-white border-primary' : 'bg-wood-dark/50 text-sand border-white/10 hover:bg-wood-dark/70'}`}
                            >
                                Layered
                            </button>
                        </div>
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

            {/* Avatar Editor Modal */}
            <AnimatePresence>
                {showAvatarEditor && (
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
                            <h3 className="text-xl font-black text-white mb-4 engraved-text text-center">تخصيص الصورة الرمزية</h3>
                            <AvatarEditor
                                initialConfig={avatar || DEFAULT_AVATAR}
                                onSave={handleSaveAvatar}
                                onCancel={() => setShowAvatarEditor(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLayeredPicker && (
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
                            <h3 className="text-xl font-black text-white mb-4 engraved-text text-center">Layered Avatar</h3>
                            <LayeredAvatarPicker
                                templates={avatarFaceTemplates}
                                parts={avatarParts}
                                value={avatarV2}
                                onCancel={() => setShowLayeredPicker(false)}
                                onSave={handleSaveAvatarV2}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LayeredAvatarPicker({ templates, parts, value, onCancel, onSave }) {
    const [templateId, setTemplateId] = useState(value?.templateId || templates[0]?.id || '');
    const [selections, setSelections] = useState(value?.selections || {});

    const template = templates.find(t => t.id === templateId) || templates[0] || null;

    const slots = [
        { id: 'hair_hat', label: 'Hair/Hat' },
        { id: 'eyebrows', label: 'Eyebrows' },
        { id: 'eyes', label: 'Eyes' },
        { id: 'nose', label: 'Nose' },
        { id: 'mouth', label: 'Mouth' },
        { id: 'facial_hair', label: 'Facial Hair' },
    ];

    const partsBySlot = (slot) => parts.filter(p => p.slot === slot && p.active !== false);

    const setSlotPart = (slot, partId) => {
        const p = parts.find(x => x.id === partId);
        const assetId = p?.assets?.[0]?.assetId || '';
        setSelections(prev => ({ ...prev, [slot]: { partId, assetId } }));
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-center mb-4">
                <AvatarLayered
                    size={140}
                    template={template}
                    partsCatalog={parts}
                    selections={selections}
                    fallback={<div className="size-[140px] rounded-full bg-wood-dark/50 border border-white/10" />}
                />
            </div>

            <div className="space-y-3 overflow-y-auto min-h-0 pb-2">
                <div>
                    <label className="block text-xs font-bold text-sand/70 mb-1">Head shape (template)</label>
                    <select
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                        className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white"
                    >
                        {templates.filter(t => t.active !== false).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {slots.map(slot => (
                    <div key={slot.id} className="bg-wood-dark/40 border border-white/5 rounded-xl p-3">
                        <div className="text-sm font-bold text-white mb-2">{slot.label}</div>
                        <select
                            value={selections?.[slot.id]?.partId || ''}
                            onChange={(e) => setSlotPart(slot.id, e.target.value)}
                            className="w-full p-3 border-2 rounded-xl outline-none bg-wood-dark/50 border-white/10 text-white"
                        >
                            <option value="">-- none --</option>
                            {partsBySlot(slot.id).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 pt-3 mt-auto">
                <Button onClick={onCancel} variant="ghost" className="flex-1 border border-white/10">
                    إلغاء
                </Button>
                <Button
                    onClick={() => onSave({ mode: 'layered', templateId, selections })}
                    className="flex-1"
                >
                    حفظ
                </Button>
            </div>
        </div>
    );
}
