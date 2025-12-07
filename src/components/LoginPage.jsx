import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, LogIn } from 'lucide-react';
import Button from './Button';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/authService';

export default function LoginPage({ onBack, onSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('اكتب البريد وكلمة المرور');
            return;
        }
        setIsLoading(true);
        setError('');

        const result = mode === 'login'
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password);

        setIsLoading(false);
        if (result.success) {
            onSuccess?.(result.user);
        } else {
            setError(result.error);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        const result = await signInWithGoogle();
        setIsLoading(false);
        if (result.success) {
            onSuccess?.(result.user);
        } else {
            setError(result.error);
        }
    };

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
                <h2 className="text-2xl font-bold text-white">
                    {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-xs mx-auto w-full">
                {/* Google Sign In Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full p-4 rounded-2xl bg-white text-gray-800 font-bold flex items-center justify-center gap-3 shadow-lg border-b-4 border-gray-300 disabled:opacity-50"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    الدخول بحساب جوجل
                </motion.button>

                <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-white/30"></div>
                    <span className="text-white/60 text-sm">أو</span>
                    <div className="flex-1 h-px bg-white/30"></div>
                </div>

                {/* Email/Password Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleEmailAuth}
                    className="w-full space-y-3"
                >
                    <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="البريد الإلكتروني"
                            className="w-full p-4 pr-12 rounded-xl bg-white/90 text-gray-800 font-bold placeholder-gray-400 text-right"
                            dir="ltr"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="كلمة المرور"
                            className="w-full p-4 pr-12 rounded-xl bg-white/90 text-gray-800 font-bold placeholder-gray-400 text-right"
                            dir="ltr"
                        />
                    </div>

                    {error && (
                        <p className="text-red-300 text-center text-sm">{error}</p>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'جاري التحميل...' : (mode === 'login' ? 'دخول' : 'إنشاء حساب')}
                    </Button>
                </motion.form>

                {/* Toggle Login/Signup */}
                <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                >
                    {mode === 'login' ? 'ما عندك حساب؟ سجل الحين' : 'عندك حساب؟ سجل دخول'}
                </button>
            </div>
        </div>
    );
}
