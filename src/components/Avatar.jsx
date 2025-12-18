import React from 'react';

// Avatar parts options
export const AVATAR_OPTIONS = {
    skinTone: [
        { id: 'light', color: '#FFDFC4' },
        { id: 'medium-light', color: '#F0C8A0' },
        { id: 'medium', color: '#D4A574' },
        { id: 'medium-dark', color: '#A67C52' },
        { id: 'dark', color: '#8D5524' },
        { id: 'darker', color: '#6B4423' },
    ],
    face: [
        { id: 'round', label: 'دائري' },
        { id: 'oval', label: 'بيضاوي' },
        { id: 'square', label: 'مربع' },
    ],
    hair: [
        { id: 'none', label: 'بدون' },
        { id: 'short', label: 'قصير' },
        { id: 'spiky', label: 'شوكي' },
        { id: 'neat', label: 'مرتب' },
        { id: 'curly', label: 'مجعد' },
        { id: 'long', label: 'طويل' },
        { id: 'kuma', label: 'كمة' },
        { id: 'msarr', label: 'مصر' },
    ],
    hairColor: [
        { id: 'black', color: '#1a1a1a' },
        { id: 'brown', color: '#4a3728' },
        { id: 'darkbrown', color: '#2c1810' },
        { id: 'gray', color: '#6b6b6b' },
        { id: 'white', color: '#e8e8e8' },
    ],
    eyebrows: [
        { id: 'normal', label: 'عادي' },
        { id: 'thick', label: 'كثيف' },
        { id: 'thin', label: 'رفيع' },
        { id: 'angry', label: 'غاضب' },
        { id: 'raised', label: 'مرفوع' },
    ],
    eyes: [
        { id: 'normal', label: 'عادي' },
        { id: 'happy', label: 'سعيد' },
        { id: 'sleepy', label: 'نعسان' },
        { id: 'wide', label: 'واسع' },
        { id: 'wink', label: 'غمزة' },
    ],
    eyeColor: [
        { id: 'brown', color: '#4a3728' },
        { id: 'darkbrown', color: '#2c1810' },
        { id: 'black', color: '#1a1a1a' },
        { id: 'hazel', color: '#7a6a4f' },
        { id: 'green', color: '#3d6b4f' },
    ],
    nose: [
        { id: 'normal', label: 'عادي' },
        { id: 'small', label: 'صغير' },
        { id: 'big', label: 'كبير' },
        { id: 'pointed', label: 'مدبب' },
    ],
    mouth: [
        { id: 'smile', label: 'ابتسامة' },
        { id: 'neutral', label: 'محايد' },
        { id: 'open', label: 'مفتوح' },
        { id: 'grin', label: 'ضحكة' },
    ],
    facialHair: [
        { id: 'none', label: 'بدون' },
        { id: 'stubble', label: 'خفيف' },
        { id: 'beard', label: 'لحية' },
        { id: 'goatee', label: 'سكسوكة' },
        { id: 'mustache', label: 'شنب' },
    ],
};

export const DEFAULT_AVATAR = {
    skinTone: 'medium',
    face: 'round',
    hair: 'short',
    hairColor: 'black',
    eyebrows: 'normal',
    eyes: 'normal',
    eyeColor: 'brown',
    nose: 'normal',
    mouth: 'smile',
    facialHair: 'none',
};

function getSkinColor(id) {
    return AVATAR_OPTIONS.skinTone.find(s => s.id === id)?.color || '#D4A574';
}

function getHairColor(id) {
    return AVATAR_OPTIONS.hairColor.find(h => h.id === id)?.color || '#1a1a1a';
}

function getEyeColor(id) {
    return AVATAR_OPTIONS.eyeColor.find(e => e.id === id)?.color || '#2c1810';
}

// Face shape paths
function FaceShape({ type, skinColor }) {
    switch (type) {
        case 'oval':
            return <ellipse cx="50" cy="55" rx="38" ry="45" fill={skinColor} />;
        case 'square':
            return <rect x="12" y="12" width="76" height="85" rx="15" fill={skinColor} />;
        default: // round
            return <circle cx="50" cy="55" r="42" fill={skinColor} />;
    }
}

// Hair styles
function Hair({ type, color, faceType }) {
    const baseY = faceType === 'square' ? 8 : 13;
    switch (type) {
        case 'short':
            return (
                <path d={`M20,${baseY + 25} Q20,${baseY} 50,${baseY} Q80,${baseY} 80,${baseY + 25} Q75,${baseY + 10} 50,${baseY + 5} Q25,${baseY + 10} 20,${baseY + 25}`} fill={color} />
            );
        case 'spiky':
            return (
                <path d={`M15,35 L25,5 L35,25 L45,0 L55,20 L65,2 L75,25 L85,10 L85,35 Q80,20 50,18 Q20,20 15,35`} fill={color} />
            );
        case 'neat':
            return (
                <path d={`M15,35 Q15,10 50,8 Q85,10 85,35 L85,28 Q80,15 50,12 Q20,15 15,28 Z`} fill={color} />
            );
        case 'curly':
            return (
                <>
                    <circle cx="25" cy="20" r="12" fill={color} />
                    <circle cx="40" cy="15" r="11" fill={color} />
                    <circle cx="55" cy="12" r="12" fill={color} />
                    <circle cx="70" cy="15" r="11" fill={color} />
                    <circle cx="80" cy="22" r="10" fill={color} />
                    <circle cx="18" cy="32" r="10" fill={color} />
                    <circle cx="82" cy="35" r="9" fill={color} />
                </>
            );
        case 'long':
            return (
                <>
                    <path d={`M12,35 Q12,8 50,5 Q88,8 88,35 L88,85 Q85,90 80,85 L80,40 Q75,20 50,18 Q25,20 20,40 L20,85 Q15,90 12,85 Z`} fill={color} />
                </>
            );
        case 'kuma': // Omani Kuma (traditional cap)
            return (
                <>
                    <ellipse cx="50" cy="18" rx="42" ry="18" fill="#FFFFFF" />
                    <ellipse cx="50" cy="20" rx="38" ry="14" fill="#FFFFFF" />
                    <path d="M12,20 Q12,35 20,38 L20,25 Q25,15 50,12 Q75,15 80,25 L80,38 Q88,35 88,20" fill="#FFFFFF" />
                    <ellipse cx="50" cy="5" rx="8" ry="5" fill="#E8E0D5" />
                    <path d="M20,22 Q50,28 80,22" stroke="#D4C4B0" strokeWidth="1" fill="none" />
                </>
            );
        case 'msarr': // Omani Msarr (turban)
            return (
                <>
                    <path d={`M8,40 Q5,15 50,8 Q95,15 92,40 L88,35 Q85,18 50,12 Q15,18 12,35 Z`} fill="#FFFFFF" />
                    <path d="M15,35 Q50,42 85,35" stroke="#E8E0D5" strokeWidth="2" fill="none" />
                    <path d="M18,30 Q50,38 82,30" stroke="#E8E0D5" strokeWidth="2" fill="none" />
                    <path d="M20,25 Q50,32 80,25" stroke="#E8E0D5" strokeWidth="1.5" fill="none" />
                </>
            );
        default:
            return null;
    }
}

// Eyebrows
function Eyebrows({ type, color }) {
    switch (type) {
        case 'thick':
            return (
                <>
                    <path d="M28,42 Q35,38 42,42" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M58,42 Q65,38 72,42" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
                </>
            );
        case 'thin':
            return (
                <>
                    <path d="M28,42 Q35,40 42,42" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M58,42 Q65,40 72,42" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </>
            );
        case 'angry':
            return (
                <>
                    <path d="M28,44 Q35,38 42,40" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M58,40 Q65,38 72,44" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            );
        case 'raised':
            return (
                <>
                    <path d="M28,40 Q35,35 42,38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M58,38 Q65,35 72,40" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            );
        default: // normal
            return (
                <>
                    <path d="M28,42 Q35,39 42,42" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M58,42 Q65,39 72,42" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            );
    }
}

// Eyes
function Eyes({ type, eyeColor }) {
    switch (type) {
        case 'happy':
            return (
                <>
                    <path d="M30,52 Q35,48 40,52" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M60,52 Q65,48 70,52" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            );
        case 'sleepy':
            return (
                <>
                    <ellipse cx="35" cy="52" rx="6" ry="3" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <ellipse cx="35" cy="52" rx="3" ry="2" fill={eyeColor} />
                    <ellipse cx="65" cy="52" rx="6" ry="3" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <ellipse cx="65" cy="52" rx="3" ry="2" fill={eyeColor} />
                </>
            );
        case 'wide':
            return (
                <>
                    <ellipse cx="35" cy="52" rx="8" ry="9" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <circle cx="35" cy="53" r="5" fill={eyeColor} />
                    <circle cx="36" cy="51" r="2" fill="white" />
                    <ellipse cx="65" cy="52" rx="8" ry="9" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <circle cx="65" cy="53" r="5" fill={eyeColor} />
                    <circle cx="66" cy="51" r="2" fill="white" />
                </>
            );
        case 'wink':
            return (
                <>
                    <ellipse cx="35" cy="52" rx="7" ry="7" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <circle cx="35" cy="53" r="4" fill={eyeColor} />
                    <circle cx="36" cy="51" r="1.5" fill="white" />
                    <path d="M60,52 Q65,48 70,52" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            );
        default: // normal
            return (
                <>
                    <ellipse cx="35" cy="52" rx="7" ry="7" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <circle cx="35" cy="53" r="4" fill={eyeColor} />
                    <circle cx="36" cy="51" r="1.5" fill="white" />
                    <ellipse cx="65" cy="52" rx="7" ry="7" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                    <circle cx="65" cy="53" r="4" fill={eyeColor} />
                    <circle cx="66" cy="51" r="1.5" fill="white" />
                </>
            );
    }
}

// Nose
function Nose({ type, skinColor }) {
    const shadowColor = '#00000015';
    switch (type) {
        case 'small':
            return (
                <path d="M47,62 Q50,66 53,62" stroke={shadowColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            );
        case 'big':
            return (
                <>
                    <path d="M50,55 L50,70" stroke={shadowColor} strokeWidth="2" strokeLinecap="round" />
                    <path d="M42,72 Q50,78 58,72" stroke={shadowColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            );
        case 'pointed':
            return (
                <>
                    <path d="M50,55 L50,68 L45,72" stroke={shadowColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M50,68 L55,72" stroke={shadowColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            );
        default: // normal
            return (
                <>
                    <path d="M50,58 L50,68" stroke={shadowColor} strokeWidth="2" strokeLinecap="round" />
                    <path d="M45,70 Q50,74 55,70" stroke={shadowColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            );
    }
}

// Mouth
function Mouth({ type }) {
    switch (type) {
        case 'neutral':
            return <path d="M40,82 L60,82" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />;
        case 'open':
            return (
                <>
                    <ellipse cx="50" cy="82" rx="10" ry="8" fill="#5c3d2e" />
                    <ellipse cx="50" cy="79" rx="8" ry="3" fill="white" />
                </>
            );
        case 'grin':
            return (
                <>
                    <path d="M35,80 Q50,95 65,80" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M38,82 Q50,90 62,82" fill="white" />
                </>
            );
        default: // smile
            return <path d="M38,80 Q50,90 62,80" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
}

// Facial Hair
function FacialHair({ type, color }) {
    switch (type) {
        case 'stubble':
            return (
                <>
                    <rect x="30" y="75" width="40" height="20" fill={color} opacity="0.3" rx="5" />
                </>
            );
        case 'beard':
            return (
                <path d="M20,70 Q20,105 50,108 Q80,105 80,70 Q75,85 50,88 Q25,85 20,70" fill={color} />
            );
        case 'goatee':
            return (
                <path d="M40,85 Q40,100 50,102 Q60,100 60,85 Q55,90 50,90 Q45,90 40,85" fill={color} />
            );
        case 'mustache':
            return (
                <path d="M35,75 Q42,72 50,76 Q58,72 65,75 Q60,80 50,78 Q40,80 35,75" fill={color} />
            );
        default:
            return null;
    }
}

export default function Avatar({ config = {}, size = 100, className = '' }) {
    const avatar = { ...DEFAULT_AVATAR, ...config };
    const skinColor = getSkinColor(avatar.skinTone);
    const hairColor = getHairColor(avatar.hairColor);
    const eyeColor = getEyeColor(avatar.eyeColor);

    return (
        <svg
            viewBox="0 0 100 110"
            width={size}
            height={size}
            className={className}
            style={{ overflow: 'visible' }}
        >
            {/* Background circle */}
            <circle cx="50" cy="55" r="50" fill="#3d2d1f" />
            
            {/* Face */}
            <FaceShape type={avatar.face} skinColor={skinColor} />
            
            {/* Ears */}
            <ellipse cx="10" cy="55" rx="6" ry="10" fill={skinColor} />
            <ellipse cx="90" cy="55" rx="6" ry="10" fill={skinColor} />
            
            {/* Facial Hair (behind mouth for beard) */}
            {avatar.facialHair === 'beard' && (
                <FacialHair type={avatar.facialHair} color={hairColor} />
            )}
            
            {/* Eyebrows */}
            <Eyebrows type={avatar.eyebrows} color={hairColor} />
            
            {/* Eyes */}
            <Eyes type={avatar.eyes} eyeColor={eyeColor} />
            
            {/* Nose */}
            <Nose type={avatar.nose} skinColor={skinColor} />
            
            {/* Mouth */}
            <Mouth type={avatar.mouth} />
            
            {/* Facial Hair (on top for mustache/goatee/stubble) */}
            {avatar.facialHair !== 'beard' && avatar.facialHair !== 'none' && (
                <FacialHair type={avatar.facialHair} color={hairColor} />
            )}
            
            {/* Hair (on top) */}
            <Hair type={avatar.hair} color={hairColor} faceType={avatar.face} />
        </svg>
    );
}
