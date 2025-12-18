import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Check, ShoppingBag } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Button from './Button';

export default function MarketPage({ onBack, user }) {
    const {
        dirhams,
        marketItems,
        categories,
        ownedTopicIds,
        purchasesLoaded,
        purchaseMarketItem
    } = useGameStore();

    const [busyItemId, setBusyItemId] = useState(null);
    const [toast, setToast] = useState(null);

    const activeItems = useMemo(() => {
        return marketItems
            .filter(i => i?.active !== false)
            .sort((a, b) => Number(a.priceDirhams || 0) - Number(b.priceDirhams || 0));
    }, [marketItems]);

    const getTopic = (topicId) => categories.find(c => c.id === topicId);

    const isOwned = (item) => {
        if (item.type === 'topic_unlock' && item.topicId) return ownedTopicIds.includes(item.topicId);
        return false;
    };

    const handleBuy = async (item) => {
        if (!user?.uid) {
            setToast({ type: 'error', message: 'لازم تسجل دخول عشان تشتري من السوق.' });
            return;
        }

        setBusyItemId(item.id);
        const res = await purchaseMarketItem({ userId: user.uid, displayName: user.displayName, item });
        setBusyItemId(null);

        if (res.ok) {
            setToast({ type: 'success', message: 'تم الشراء بنجاح ✅' });
        } else if (res.error === 'insufficient_funds') {
            setToast({ type: 'error', message: 'رصيد الدراهم غير كافي.' });
        } else if (res.error === 'already_owned' || res.error === 'topic_already_owned') {
            setToast({ type: 'info', message: 'مملوك بالفعل.' });
        } else {
            setToast({ type: 'error', message: 'صار خطأ أثناء الشراء.' });
        }

        setTimeout(() => setToast(null), 2500);
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text flex-1">السوق</h2>

                <div className="flex items-center gap-2 bg-wood-light/80 px-4 py-2 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-[#FFD700] text-[18px]">toll</span>
                    <span className="text-sm font-bold text-white">{dirhams.toLocaleString()}</span>
                </div>
            </div>

            {!purchasesLoaded && user?.uid && (
                <div className="bg-wood-dark/40 border border-white/5 rounded-xl p-3 mb-3 text-center text-sand/60 text-sm">
                    جاري تحميل مشترياتك...
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3">
                {activeItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <ShoppingBag className="text-sand/30 mb-2" size={40} />
                        <p className="text-sand/50">مافي عناصر حالياً</p>
                        <p className="text-sand/30 text-xs mt-1">الادمن يقدر يضيف عناصر من Admin → Market</p>
                    </div>
                ) : (
                    activeItems.map((item, idx) => {
                        const price = Number(item.priceDirhams || 0);
                        const owned = isOwned(item);
                        const topic = item.type === 'topic_unlock' ? getTopic(item.topicId) : null;
                        const displayTitle = item.type === 'topic_unlock' ? (topic?.name || 'مجال') : (item.title || 'عنصر');
                        const displayIcon = item.type === 'topic_unlock' ? (topic?.icon || '📚') : (item.icon || '🛒');

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-wood-dark/50 border border-white/5 rounded-2xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="size-12 rounded-xl bg-wood-dark/60 border border-white/5 flex items-center justify-center text-2xl">
                                        {displayIcon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-white truncate">{displayTitle}</p>
                                            {item.type === 'topic_unlock' && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                                                    فتح مجال
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-sand/60 mt-1">{item.description}</p>
                                        )}
                                        {topic && (
                                            <p className="text-xs text-sand/50 mt-2">
                                                المجال: <span className="text-white">{topic.icon} {topic.name}</span>
                                            </p>
                                        )}

                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#FFD700] text-[18px]">toll</span>
                                                <span className="text-white font-bold">{price}</span>
                                                <span className="text-sand/50 text-xs">دراهم</span>
                                            </div>

                                            {owned ? (
                                                <div className="flex items-center gap-2 text-[#FFD700] font-bold text-sm">
                                                    <Check size={18} /> مملوك
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => handleBuy(item)}
                                                    disabled={busyItemId === item.id}
                                                    className="px-4"
                                                >
                                                    {busyItemId === item.id ? '...' : 'شراء'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {item.type === 'topic_unlock' && topic?.isPremium && !owned && (
                                    <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                                        <Lock className="text-primary" size={16} />
                                        <span className="text-xs text-sand/70">هذا المجال Premium للأونلاين</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-bold ${
                            toast.type === 'success'
                                ? 'bg-green-900/40 border-green-400/20 text-green-200'
                                : toast.type === 'info'
                                    ? 'bg-wood-dark/70 border-white/10 text-sand'
                                    : 'bg-red-900/40 border-red-400/20 text-red-200'
                        }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
