import React from 'react';

export default function DallahIcon({ size = 24, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Main body of the dallah (rounded pot shape) */}
            <path d="M9 5C9 4 9.5 3 11 3H13C14.5 3 15 4 15 5V17C15 18 14.5 19 13 19H11C9.5 19 9 18 9 17V5Z" />
            
            {/* Spout (curved spout on the right) */}
            <path d="M15 11C16 10.5 18 10 19 11C20 12 19.5 13.5 18.5 14.5C17.5 15.5 16 15 15 14.5" />
            
            {/* Handle (curved handle on the left) */}
            <path d="M9 9C7 9 5 10 4.5 11.5C4 13 5 14.5 6.5 15C8 15.5 9 14.5 9 13" />
            
            {/* Lid (top cover) */}
            <ellipse cx="12" cy="5" rx="3.5" ry="1.2" />
            
            {/* Lid knob (decorative top) */}
            <circle cx="12" cy="4.2" r="0.6" fill="currentColor" />
            
            {/* Decorative line on body */}
            <path d="M10 8H14" strokeWidth="1.5" />
        </svg>
    );
}
