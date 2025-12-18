import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export default function Button({ children, onClick, variant = 'primary', className, disabled }) {
    const baseStyles = "w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer";

    const variants = {
        primary: "bg-gradient-to-br from-primary to-orange-700 text-white shadow-black/30 border border-white/10 hover:brightness-110",
        secondary: "bg-gradient-to-br from-wood-light to-wood-dark text-white shadow-black/30 border border-white/10 hover:brightness-110",
        outline: "bg-transparent border-2 border-primary/60 text-primary hover:bg-primary/10",
        ghost: "bg-transparent text-sand hover:bg-white/5 hover:text-white",
        option: "bg-wood-dark/60 backdrop-blur border-2 border-white/10 text-sand hover:border-primary/60 hover:bg-wood-dark/70 text-right justify-start shadow-sm hover:shadow-md hover:scale-[1.01]"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={twMerge(baseStyles, variants[variant], className)}
        >
             {/* Shine effect on hover */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            {children}
        </motion.button>
    );
}
