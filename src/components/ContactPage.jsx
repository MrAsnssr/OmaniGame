import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import Button from './Button';
import { useGameStore } from '../store/gameStore';

export default function ContactPage({ onBack, user }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // This would typically connect to a backend or use EmailJS
    // For now we'll simulate sending
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;

        setSending(true);

        // Simulate network delay
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setSubject('');
            setMessage('');
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text">تواصل معنا</h2>
            </div>

            <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-6" dir="rtl">
                {sent ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">وصلتنا رسالتك!</h3>
                        <p className="text-sand/70 mb-8">شكراً لتواصلك معنا. بنرد عليك في أقرب وقت ممكن.</p>
                        <Button onClick={() => setSent(false)} variant="secondary">
                            إرسال رسالة جديدة
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="text-center mb-8">
                            <Mail size={48} className="text-omani-gold mx-auto mb-4" />
                            <p className="text-sand/80">عندك اقتراح؟ واجهت مشكلة؟ أو تبغى بس تسلم؟</p>
                            <p className="text-white font-bold text-lg mt-2">نسمع منك!</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sand/70 text-sm font-bold mb-2">الموضوع</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="عن ويش تبغى تكلمنا؟"
                                        className="w-full p-4 pl-12 rounded-xl bg-wood-dark/50 border border-white/10 text-white placeholder-sand/30 focus:border-primary outline-none transition-colors"
                                        required
                                    />
                                    <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sand/30" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sand/70 text-sm font-bold mb-2">الرسالة</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    rows={5}
                                    className="w-full p-4 rounded-xl bg-wood-dark/50 border border-white/10 text-white placeholder-sand/30 focus:border-primary outline-none transition-colors resize-none"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-4 py-4 shadow-lg flex items-center justify-center gap-2"
                                disabled={sending || !subject || !message}
                            >
                                {sending ? (
                                    'جاري الإرسال...'
                                ) : (
                                    <>
                                        <Send size={18} className="rtl:rotate-180" />
                                        إرسال
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-white/5 text-center">
                            <p className="text-sand/40 text-sm mb-2">أو راسلنا مباشرة على الإيميل</p>
                            <a href="mailto:support@omanigame.com" className="text-primary font-bold hover:underline dir-ltr block">
                                support@omanigame.com
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
