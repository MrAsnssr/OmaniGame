import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Check, ShoppingBag, BookOpen, User, Crown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Button from './Button';

export default function MarketPage({ onBack, user }) {
    const {
        dirhams,
        marketItems,
        subjects,
        categories,
        avatarFaceTemplates,
        ownedSubjectIds,
        ownedTopicIds,
        ownedAvatarIds = [],
        purchasesLoaded,
        purchaseMarketItem,
        hasActiveTopicsMembership,
        hasActiveAvatarsMembership,
        topicsMembershipExpiry,
        avatarsMembershipExpiry
    } = useGameStore();

    const [category, setCategory] = useState(null); // null = selection screen, 'topics', 'characters', or 'memberships'
    const [busyItemId, setBusyItemId] = useState(null);
    const [toast, setToast] = useState(null);

    const activeItems = useMemo(() => {
        if (!category) return [];
        return marketItems
            .filter(i => {
                if (i?.active === false) return false;
                if (category === 'topics') {
                    return i.type === 'subject_unlock' || i.type === 'topic_unlock';
                }
                if (category === 'characters') {
                    return i.type === 'avatar_unlock';
                }
                if (category === 'memberships') {
                    return i.type === 'membership_topics' || i.type === 'membership_avatars';
                }
                return false;
            })
            .sort((a, b) => {
                // Featured items first
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                // Then by price
                const priceA = getFinalPrice(a);
                const priceB = getFinalPrice(b);
                return priceA - priceB;
            });
    }, [marketItems, category]);

    const featuredItems = useMemo(() => {
        return activeItems.filter(i => i.featured);
    }, [activeItems]);

    const regularItems = useMemo(() => {
        return activeItems.filter(i => !i.featured);
    }, [activeItems]);

    const getFinalPrice = (item) => {
        const basePrice = Number(item.priceDirhams || 0);
        const discount = Number(item.discountPercent || 0);
        if (discount > 0 && discount <= 100) {
            return Math.max(0, Math.round(basePrice * (1 - discount / 100)));
        }
        return basePrice;
    };

    const getTopic = (topicId) => categories.find(c => c.id === topicId);
    const getSubject = (subjectId) => subjects.find(s => s.id === subjectId);
    const getAvatar = (avatarTemplateId) => avatarFaceTemplates.find(a => a.id === avatarTemplateId);

    const isOwned = (item) => {
        if (item.type === 'subject_unlock' && item.subjectId) return ownedSubjectIds.includes(item.subjectId);
        if (item.type === 'topic_unlock' && item.topicId) return ownedTopicIds.includes(item.topicId);
        if (item.type === 'avatar_unlock' && item.avatarTemplateId) return ownedAvatarIds.includes(item.avatarTemplateId);
        if (item.type === 'membership_topics') return hasActiveTopicsMembership();
        if (item.type === 'membership_avatars') return hasActiveAvatarsMembership();
        return false;
    };

    const handleBuy = async (item) => {
        if (!user?.uid) {
            setToast({ type: 'error', message: 'لازم تسجل دخول عشان تشتري من السوق.' });
            return;
        }

        setBusyItemId(item.id);
        const finalPrice = getFinalPrice(item);
        const itemWithDiscount = { ...item, priceDirhams: finalPrice };
        const res = await purchaseMarketItem({ userId: user.uid, displayName: user.displayName, item: itemWithDiscount });
        setBusyItemId(null);

        if (res.ok) {
            setToast({ type: 'success', message: 'تم الشراء بنجاح ✅' });
        } else if (res.error === 'insufficient_funds') {
            setToast({ type: 'error', message: 'رصيد الدراهم غير كافي.' });
        } else if (res.error === 'already_owned' || res.error === 'topic_already_owned' || res.error === 'subject_already_owned' || res.error === 'avatar_already_owned') {
            setToast({ type: 'info', message: 'مملوك بالفعل.' });
        } else {
            setToast({ type: 'error', message: 'صار خطأ أثناء الشراء.' });
        }

        setTimeout(() => setToast(null), 2500);
    };

    const renderItem = (item, isFeatured = false) => {
        const basePrice = Number(item.priceDirhams || 0);
        const discount = Number(item.discountPercent || 0);
        const finalPrice = getFinalPrice(item);
        const owned = isOwned(item);
        const subject = item.type === 'subject_unlock' ? getSubject(item.subjectId) : null;
        const topic = item.type === 'topic_unlock' ? getTopic(item.topicId) : null;
        const avatar = item.type === 'avatar_unlock' ? getAvatar(item.avatarTemplateId) : null;

        const displayTitle = item.type === 'subject_unlock'
            ? (subject?.name || 'مجال')
            : item.type === 'topic_unlock'
                ? (topic?.name || 'موضوع')
                : item.type === 'avatar_unlock'
                    ? (avatar?.name || item.title || 'شخصية')
                    : item.type === 'membership_topics'
                        ? (item.title || 'عضوية المواضيع السنوية')
                        : item.type === 'membership_avatars'
                            ? (item.title || 'عضوية الشخصيات السنوية')
                            : (item.title || 'عنصر');

        const displayIcon = item.type === 'subject_unlock'
            ? (subject?.icon || '📁')
            : item.type === 'topic_unlock'
                ? (topic?.icon || '📚')
                : item.type === 'avatar_unlock'
                    ? '👤'
                    : item.type === 'membership_topics'
                        ? '👑'
                        : item.type === 'membership_avatars'
                            ? '👑'
                            : (item.icon || '🛒');

        // Get membership expiry for display
        const getMembershipExpiry = () => {
            if (item.type === 'membership_topics') return topicsMembershipExpiry;
            if (item.type === 'membership_avatars') return avatarsMembershipExpiry;
            return null;
        };
        const membershipExpiry = getMembershipExpiry();

        if (isFeatured) {
            return (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-wood-dark to-wood-light/20 border-2 border-primary/30 rounded-3xl p-6 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {item.type === 'avatar_unlock' && avatar?.previewAsset?.dataUrl ? (
                            <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/40 bg-black/20 relative">
                                <img
                                    src={avatar.previewAsset.dataUrl || avatar.previewAsset.url}
                                    alt={avatar.name}
                                    className="absolute"
                                    style={{
                                        left: `${avatar?.transform?.x ?? 50}%`,
                                        top: `${avatar?.transform?.y ?? 50}%`,
                                        width: `${avatar?.transform?.sizePct ?? 100}%`,
                                        height: `${avatar?.transform?.sizePct ?? 100}%`,
                                        transform: `translate(-50%, -50%) rotate(${avatar?.transform?.rotation ?? 0}deg) scale(${avatar?.transform?.scale ?? 1})`,
                                        transformOrigin: 'center',
                                        objectFit: 'contain',
                                    }}
                                    draggable={false}
                                />
                            </div>
                        ) : (
                            <div className="flex-shrink-0 size-32 rounded-2xl bg-wood-dark/60 border-2 border-primary/40 flex items-center justify-center text-5xl">
                                {displayIcon}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-2xl font-black text-white truncate">{displayTitle}</p>
                                        <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                                            مميز
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-sand/70 mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                </div>
                            </div>

                            {subject && (
                                <p className="text-xs text-sand/50 mt-2">
                                    المجال: <span className="text-white">{subject.icon} {subject.name}</span>
                                </p>
                            )}
                            {topic && (
                                <p className="text-xs text-sand/50 mt-2">
                                    الموضوع: <span className="text-white">{topic.icon} {topic.name}</span>
                                </p>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {discount > 0 && (
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sand/50 text-sm line-through">{basePrice}</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                                                    -{discount}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-[#FFD700] text-xl">toll</span>
                                                <span className="text-white font-black text-xl">{finalPrice}</span>
                                                <span className="text-sand/50 text-sm">دراهم</span>
                                            </div>
                                        </div>
                                    )}
                                    {discount === 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#FFD700] text-xl">toll</span>
                                            <span className="text-white font-black text-xl">{finalPrice}</span>
                                            <span className="text-sand/50 text-sm">دراهم</span>
                                        </div>
                                    )}
                                </div>

                                {owned ? (
                                    <div className="flex items-center gap-2 text-[#FFD700] font-bold">
                                        <Check size={20} /> مملوك
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleBuy(item)}
                                        disabled={busyItemId === item.id}
                                        className="px-6 py-3 text-lg"
                                    >
                                        {busyItemId === item.id ? '...' : 'شراء'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-wood-dark/50 border border-white/5 rounded-2xl p-4"
            >
                <div className="flex items-start gap-3">
                    {item.type === 'avatar_unlock' && avatar?.previewAsset?.dataUrl ? (
                        <div className="flex-shrink-0 size-12 rounded-xl overflow-hidden border border-white/10 bg-black/20 relative">
                            <img
                                src={avatar.previewAsset.dataUrl || avatar.previewAsset.url}
                                alt={avatar.name}
                                className="absolute"
                                style={{
                                    left: `${avatar?.transform?.x ?? 50}%`,
                                    top: `${avatar?.transform?.y ?? 50}%`,
                                    width: `${avatar?.transform?.sizePct ?? 100}%`,
                                    height: `${avatar?.transform?.sizePct ?? 100}%`,
                                    transform: `translate(-50%, -50%) rotate(${avatar?.transform?.rotation ?? 0}deg) scale(${avatar?.transform?.scale ?? 1})`,
                                    transformOrigin: 'center',
                                    objectFit: 'contain',
                                }}
                                draggable={false}
                            />
                        </div>
                    ) : (
                        <div className="size-12 rounded-xl bg-wood-dark/60 border border-white/5 flex items-center justify-center text-2xl">
                            {displayIcon}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-black text-white truncate">{displayTitle}</p>
                            {item.type === 'subject_unlock' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                                    فتح مجال (Subject)
                                </span>
                            )}
                            {item.type === 'topic_unlock' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                                    فتح مجال
                                </span>
                            )}
                            {item.type === 'avatar_unlock' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                                    شخصية
                                </span>
                            )}
                            {(item.type === 'membership_topics' || item.type === 'membership_avatars') && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] font-bold border border-[#FFD700]/30">
                                    👑 عضوية سنوية
                                </span>
                            )}
                        </div>
                        {item.description && (
                            <p className="text-sm text-sand/60 mt-1">{item.description}</p>
                        )}
                        {subject && (
                            <p className="text-xs text-sand/50 mt-2">
                                المجال: <span className="text-white">{subject.icon} {subject.name}</span>
                            </p>
                        )}
                        {topic && (
                            <p className="text-xs text-sand/50 mt-2">
                                الموضوع: <span className="text-white">{topic.icon} {topic.name}</span>
                            </p>
                        )}
                        {owned && membershipExpiry && (
                            <p className="text-xs text-[#FFD700] mt-2 font-bold">
                                ✅ مفعّلة حتى {new Date(membershipExpiry).toLocaleDateString('ar-OM')}
                            </p>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {discount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sand/50 text-xs line-through">{basePrice}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                                            -{discount}%
                                        </span>
                                    </div>
                                )}
                                <span className="material-symbols-outlined text-[#FFD700] text-[18px]">toll</span>
                                <span className="text-white font-bold">{finalPrice}</span>
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
            </motion.div>
        );
    };

    // Category selection screen
    if (!category) {
        return (
            <div className="flex flex-col h-full p-4 overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
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

                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setCategory('topics')}
                            className="bg-gradient-to-br from-wood-dark to-wood-light/20 border-2 border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all shadow-xl hover:shadow-2xl"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                                    <BookOpen className="text-primary" size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-white engraved-text">المواضيع</h3>
                                <p className="text-sand/60 text-sm text-center">فتح مواضيع ومجالات جديدة</p>
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => setCategory('characters')}
                            className="bg-gradient-to-br from-wood-dark to-wood-light/20 border-2 border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all shadow-xl hover:shadow-2xl"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                                    <User className="text-primary" size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-white engraved-text">الشخصيات</h3>
                                <p className="text-sand/60 text-sm text-center">شخصيات مخصصة للعبة</p>
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setCategory('memberships')}
                            className="bg-gradient-to-br from-[#FFD700]/20 to-wood-light/20 border-2 border-[#FFD700]/30 rounded-3xl p-8 hover:border-[#FFD700]/60 transition-all shadow-xl hover:shadow-2xl md:col-span-2"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-20 rounded-2xl bg-[#FFD700]/20 border-2 border-[#FFD700]/40 flex items-center justify-center">
                                    <Crown className="text-[#FFD700]" size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-[#FFD700] engraved-text">العضويات السنوية</h3>
                                <p className="text-sand/60 text-sm text-center">افتح كل شي بسعر موحد</p>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    // Category content screen
    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => setCategory(null)}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text flex-1">
                    {category === 'topics' ? 'المواضيع' : category === 'characters' ? 'الشخصيات' : 'العضويات السنوية'}
                </h2>
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

            <div className="flex-1 overflow-y-auto space-y-6">
                {activeItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <ShoppingBag className="text-sand/30 mb-2" size={40} />
                        <p className="text-sand/50">مافي عناصر حالياً</p>
                        <p className="text-sand/30 text-xs mt-1">الادمن يقدر يضيف عناصر من Admin → Market</p>
                    </div>
                ) : (
                    <>
                        {featuredItems.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-white engraved-text px-2">منتجات مميزة</h3>
                                {featuredItems.map(item => renderItem(item, true))}
                            </div>
                        )}

                        {regularItems.length > 0 && (
                            <div className="space-y-3">
                                {featuredItems.length > 0 && (
                                    <h3 className="text-lg font-bold text-white px-2">جميع المنتجات</h3>
                                )}
                                {regularItems.map(item => renderItem(item, false))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-bold ${toast.type === 'success'
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
