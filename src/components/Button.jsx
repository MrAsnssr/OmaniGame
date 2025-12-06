import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ children, onClick, variant = 'primary', className, disabled }) {
    const baseStyles = "w-full py-4 px-6 rounded-2xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-omani-red text-white hover:bg-red-700 shadow-red-200",
        secondary: "bg-omani-green text-white hover:bg-green-700 shadow-green-200",
        outline: "border-2 border-omani-red text-omani-red hover:bg-red-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
        option: "bg-white border-2 border-gray-100 text-gray-700 hover:border-omani-gold/50 hover:bg-omani-sand/10 text-left justify-start"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={twMerge(baseStyles, variants[variant], className)}
        >
            {children}
        </motion.button>
    );
}
