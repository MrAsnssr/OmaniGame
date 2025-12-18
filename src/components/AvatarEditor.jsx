import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import Avatar, { AVATAR_OPTIONS, DEFAULT_AVATAR } from './Avatar';
import Button from './Button';

const CATEGORIES = [
    { id: 'skinTone', label: 'لون البشرة', icon: '👤' },
    { id: 'face', label: 'شكل الوجه', icon: '🔵' },
    { id: 'hair', label: 'الشعر/القبعة', icon: '💇' },
    { id: 'hairColor', label: 'لون الشعر', icon: '🎨' },
    { id: 'eyebrows', label: 'الحواجب', icon: '🤨' },
    { id: 'eyes', label: 'العيون', icon: '👁️' },
    { id: 'eyeColor', label: 'لون العيون', icon: '🟤' },
    { id: 'nose', label: 'الأنف', icon: '👃' },
    { id: 'mouth', label: 'الفم', icon: '👄' },
    { id: 'facialHair', label: 'شعر الوجه', icon: '🧔' },
];

export default function AvatarEditor({ initialConfig, onSave, onCancel }) {
    const [config, setConfig] = useState({ ...DEFAULT_AVATAR, ...initialConfig });
    const [activeCategory, setActiveCategory] = useState('skinTone');

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomize = () => {
        const randomConfig = {};
        Object.keys(AVATAR_OPTIONS).forEach(key => {
            const options = AVATAR_OPTIONS[key];
            const randomIndex = Math.floor(Math.random() * options.length);
            randomConfig[key] = options[randomIndex].id;
        });
        setConfig(randomConfig);
    };

    const currentOptions = AVATAR_OPTIONS[activeCategory] || [];
    const isColorCategory = ['skinTone', 'hairColor', 'eyeColor'].includes(activeCategory);

    return (
        <div className="flex flex-col h-full">
            {/* Preview */}
            <div className="flex justify-center py-4">
                <motion.div
                    key={JSON.stringify(config)}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="relative"
                >
                    <Avatar config={config} size={140} />
                </motion.div>
            </div>

            {/* Randomize Button */}
            <div className="flex justify-center mb-3">
                <button
                    onClick={handleRandomize}
                    className="px-4 py-2 bg-wood-dark/50 border border-white/10 rounded-full text-sm font-bold text-sand hover:bg-wood-dark/70 transition-colors"
                >
                    🎲 عشوائي
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 mb-3">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeCategory === cat.id
                                ? 'bg-primary text-white'
                                : 'bg-wood-dark/50 text-sand/70 hover:bg-wood-dark/70'
                        }`}
                    >
                        <span className="mr-1">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Options */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {isColorCategory ? (
                    // Color picker grid
                    <div className="grid grid-cols-6 gap-3 p-2">
                        {currentOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleChange(activeCategory, option.id)}
                                className={`aspect-square rounded-full border-4 transition-all ${
                                    config[activeCategory] === option.id
                                        ? 'border-primary ring-2 ring-primary/50 scale-110'
                                        : 'border-white/20 hover:border-white/40'
                                }`}
                                style={{ backgroundColor: option.color }}
                            />
                        ))}
                    </div>
                ) : (
                    // Option buttons grid
                    <div className="grid grid-cols-3 gap-2 p-2">
                        {currentOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleChange(activeCategory, option.id)}
                                className={`p-3 rounded-xl text-sm font-bold transition-all ${
                                    config[activeCategory] === option.id
                                        ? 'bg-primary text-white border-2 border-primary'
                                        : 'bg-wood-dark/50 text-sand border-2 border-white/10 hover:border-white/30'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 mt-auto">
                <Button onClick={onCancel} variant="ghost" className="flex-1 border border-white/10">
                    <X size={18} /> إلغاء
                </Button>
                <Button onClick={() => onSave(config)} className="flex-1">
                    <Check size={18} /> حفظ
                </Button>
            </div>
        </div>
    );
}
