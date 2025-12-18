import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Armchair, Trophy, Crown, ChevronLeft } from 'lucide-react';
import dallahIcon from '../assets/dallah.png';

export default function MainMenu({ onStart, onAdmin, onMultiplayer, onLogin, user, onLogout }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const handleLeaderboardClick = () => {
        alert("قريباً! جاري العمل على لوحة المتصدرين.");
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-omani-gold/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-omani-red/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Top Bar (User & Settings) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                {/* User Profile */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={user ? onAdmin : onLogin}
                    className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/40 hover:bg-white/80 transition-all group"
                >
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-omani-gold to-yellow-600 flex items-center justify-center text-white shadow-inner">
                            {user ? <span className="font-bold text-lg">{(user.displayName || 'U')[0].toUpperCase()}</span> : <User size={20} />}
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-omani-brown group-hover:text-omani-red transition-colors">
                            {user ? (user.displayName || 'اللاعب') : 'تسجيل دخول'}
                        </span>
                        {user && <span className="text-[10px] text-gray-700 font-medium">الملف الشخصي</span>}
                    </div>
                </motion.button>

                {/* Settings */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onAdmin}
                    className="w-12 h-12 glass-card rounded-full flex items-center justify-center text-omani-brown hover:text-omani-red transition-colors shadow-sm hover:shadow-md"
                >
                    <Settings size={22} />
                </motion.button>
            </div>

            {/* Main Content */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md flex flex-col items-center z-10 space-y-8"
            >
                {/* Hero Title */}
                <motion.div variants={itemVariants} className="text-center relative">
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-omani-red to-red-700 shadow-2xl shadow-omani-red/30 border-4 border-white/20"
                    >
                        <Crown size={40} className="text-white" />
                    </motion.div>
                    <h1 className="text-6xl font-black text-omani-dark mb-1 tracking-tight drop-shadow-sm">
                        سوالف <span className="text-transparent bg-clip-text bg-gradient-to-r from-omani-gold to-yellow-600">عمان</span>
                    </h1>
                    <p className="text-lg text-omani-brown font-bold opacity-95">
                        اختبر معلوماتك وتحدى ربعك
                    </p>
                </motion.div>

                {/* Menu Buttons */}
                <div className="w-full space-y-4">
                    <MenuCard 
                        title="الحجرة"
                        subtitle="لعب فردي سريع"
                        icon={<Armchair size={28} className="text-white" />}
                        gradient="from-omani-red to-red-600"
                        shadowColor="shadow-omani-red/20"
                        onClick={onStart}
                        variants={itemVariants}
                    />
                    
                    <MenuCard 
                        title="السبلة"
                        subtitle="تحدى الجماعة أونلاين"
                        icon={<img src={dallahIcon} alt="دلة" className="w-7 h-7 object-contain brightness-0 invert" />}
                        gradient="from-omani-green to-green-700"
                        shadowColor="shadow-omani-green/20"
                        onClick={onMultiplayer}
                        variants={itemVariants}
                    />

                    <MenuCard 
                        title="كبارية"
                        subtitle="قائمة المتصدرين"
                        icon={<Trophy size={28} className="text-white" />}
                        gradient="from-omani-gold to-yellow-600"
                        shadowColor="shadow-omani-gold/20"
                        onClick={handleLeaderboardClick}
                        variants={itemVariants}
                    />
                </div>
            </motion.div>

            {/* Footer Text */}
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 text-xs text-gray-600 font-medium"
            >
                الإصدار 1.0.0
            </motion.p>
        </div>
    );
}

function MenuCard({ title, subtitle, icon, gradient, shadowColor, onClick, variants, disabled }) {
    return (
        <motion.button
            variants={variants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={`w-full relative overflow-hidden group rounded-2xl p-4 transition-all ${disabled ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}
        >
            <div className={`absolute inset-0 bg-white/60 backdrop-blur-md border border-white/50 shadow-lg ${shadowColor} transition-all duration-300 group-hover:bg-white/80`} />
            
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300`}>
                        {icon}
                    </div>
                    <div className="flex flex-col items-start text-right">
                        <h3 className="text-2xl font-black text-omani-dark group-hover:text-omani-brown transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm font-bold text-gray-700 group-hover:text-omani-brown">
                            {subtitle}
                        </p>
                    </div>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:text-omani-gold transition-colors">
                    <ChevronLeft size={20} />
                </div>
            </div>
        </motion.button>
    );
}
