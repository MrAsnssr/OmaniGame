import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Globe, Users } from 'lucide-react';
import Button from './Button';

export default function AboutPage({ onBack }) {
    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text">عن اللعبة</h2>
            </div>

            <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-6 text-right" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 text-center"
                >
                    <div className="w-24 h-24 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-lg rotate-3">
                        <span className="text-4xl">🇴🇲</span>
                    </div>
                    <h3 className="text-xl font-bold text-omani-gold mb-2">لعبة الثقافة العمانية</h3>
                    <p className="text-sand/80 text-sm">الإصدار 1.0.0</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6 text-sand/90 leading-relaxed"
                >
                    <div className="bg-wood-dark/30 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <Heart className="fill-current" size={20} />
                            <h4 className="font-bold">فكرة اللعبة</h4>
                        </div>
                        <p>
                            لعبة تفاعلية ممتعة تهدف إلى تعزيز الثقافة العمانية الأصيلة، من خلال أسئلة متنوعة تغطي التاريخ، الجغرافيا، التراث، والأمثال الشعبية. صممت لتكون جسراً معرفياً يربط الأجيال بتراثهم العريق بأسلوب عصري ومشوق.
                        </p>
                    </div>

                    <div className="bg-wood-dark/30 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <Users className="fill-current" size={20} />
                            <h4 className="font-bold">الفريق</h4>
                        </div>
                        <p>
                            تم تطوير هذه اللعبة بشغف وحب للوطن، بأيادي عمانية شابة تطمح لنشر المعرفة والمتعة في آن واحد.
                        </p>
                    </div>

                    <div className="bg-wood-dark/30 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <Globe className="fill-current" size={20} />
                            <h4 className="font-bold">تواصل معنا</h4>
                        </div>
                        <p>
                            نسعد دائماً بملاحظاتكم واقتراحاتكم لتطوير اللعبة. يمكنكم التواصل معنا عبر صفحة "تواصل معنا" أو عبر وسائل التواصل الاجتماعي.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center text-xs text-sand/40 font-mono"
                >
                    Made with ❤️ in Oman
                </motion.div>
            </div>
        </div>
    );
}
