import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ children, onClick, variant = 'primary', className, disabled }) {
    const baseStyles = "w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer";

    const variants = {
        primary: "bg-gradient-to-br from-omani-red to-red-700 text-white shadow-red-900/20 border border-white/20 hover:brightness-110",
        secondary: "bg-gradient-to-br from-omani-green to-green-700 text-white shadow-green-900/20 border border-white/20 hover:brightness-110",
        outline: "bg-white/80 backdrop-blur-sm border-2 border-omani-red text-omani-red hover:bg-red-50",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100/50 hover:text-gray-900",
        option: "bg-white/90 backdrop-blur border-2 border-gray-200 text-gray-700 hover:border-omani-gold hover:bg-white text-right justify-start shadow-sm hover:shadow-md hover:scale-[1.01]"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={twMerge(baseStyles, variants[variant], className)}
        >
             {/* Shine effect on hover */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            {children}
        </motion.button>
    );
}
