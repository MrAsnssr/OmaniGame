import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Button from './Button';
import { useGameStore } from '../store/gameStore';

// Coin packages available for purchase
const COIN_PACKAGES = [
    { id: 'small', coins: 500, price: 0.99, popular: false, icon: '🪙' },
    { id: 'medium', coins: 1200, price: 1.99, popular: true, icon: '💰', bonus: '+200 مجاناً' },
    { id: 'large', coins: 3000, price: 4.99, popular: false, icon: '👑', bonus: '+500 مجاناً' },
    { id: 'mega', coins: 7500, price: 9.99, popular: false, icon: '🏆', bonus: '+1500 مجاناً' },
];

export default function CoinShop({ onBack }) {
    const { dirhams, addDirhams } = useGameStore();
    const [purchasing, setPurchasing] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [purchasedAmount, setPurchasedAmount] = useState(0);

    const handleTestPurchase = async (pkg) => {
        setPurchasing(pkg.id);
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Add coins to balance
        addDirhams(pkg.coins);
        setPurchasedAmount(pkg.coins);
        setPurchasing(null);
        setShowSuccess(true);
        
        // Hide success after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text flex-1">متجر الدراهم</h2>
                
                {/* Current Balance */}
                <div className="flex items-center gap-2 bg-wood-light/80 px-4 py-2 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-[#FFD700] text-[18px]">toll</span>
                    <span className="text-sm font-bold text-white">{dirhams.toLocaleString()}</span>
                </div>
            </div>

            {/* Test Mode Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/20 border border-primary/30 rounded-xl p-3 mb-4 text-center"
            >
                <p className="text-primary font-bold text-sm">🧪 وضع الاختبار - الشراء مجاني!</p>
                <p className="text-sand/70 text-xs mt-1">سيتم إضافة طرق الدفع الحقيقية قريباً</p>
            </motion.div>

            {/* Coin Packages */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {COIN_PACKAGES.map((pkg, index) => (
                    <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-2xl p-4 border-2 transition-all ${
                            pkg.popular 
                                ? 'bg-gradient-to-r from-primary/20 to-orange-700/20 border-primary/50' 
                                : 'bg-wood-dark/50 border-white/5 hover:border-white/20'
                        }`}
                    >
                        {/* Popular Badge */}
                        {pkg.popular && (
                            <div className="absolute -top-2 left-4 bg-primary text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                                الأكثر شعبية ⭐
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="size-14 rounded-xl bg-wood-dark flex items-center justify-center text-3xl shadow-inner border border-white/5">
                                {pkg.icon}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#FFD700] text-[20px]">toll</span>
                                    <span className="text-xl font-black text-white">{pkg.coins.toLocaleString()}</span>
                                    <span className="text-sand/50 text-sm">دراهم</span>
                                </div>
                                {pkg.bonus && (
                                    <span className="text-xs text-primary font-bold">{pkg.bonus}</span>
                                )}
                            </div>

                            {/* Price & Buy Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTestPurchase(pkg)}
                                disabled={purchasing !== null}
                                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                    purchasing === pkg.id
                                        ? 'bg-wood-light text-sand'
                                        : 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-wood-dark hover:brightness-110'
                                }`}
                            >
                                {purchasing === pkg.id ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                    </span>
                                ) : (
                                    <span>${pkg.price}</span>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Info Section */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sand/50 text-xs text-center">
                    الدراهم تُستخدم لشراء تلميحات وميزات إضافية في اللعبة
                </p>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-wood-dark border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="size-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center mx-auto mb-4"
                            >
                                <Check size={40} className="text-wood-dark" />
                            </motion.div>
                            
                            <h3 className="text-2xl font-black text-white mb-2 engraved-text">تم الشراء بنجاح!</h3>
                            
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="text-[#FFD700]" size={20} />
                                <span className="text-3xl font-black text-[#FFD700]">+{purchasedAmount.toLocaleString()}</span>
                                <span className="text-sand">دراهم</span>
                            </div>
                            
                            <p className="text-sand/70 text-sm mb-6">
                                رصيدك الجديد: <span className="text-white font-bold">{dirhams.toLocaleString()}</span> دراهم
                            </p>
                            
                            <Button onClick={() => setShowSuccess(false)} className="w-full">
                                تمام! 👍
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
