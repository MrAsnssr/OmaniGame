// Type definitions for the game
export interface Question {
    id: string;
    type: 'multiple-choice' | 'fill-blank' | 'order' | 'match';
    question: string;
    category: string;
    answer?: string;
    options?: string[];
    items?: { id: string; text: string }[];
    correctOrder?: string[];
    pairs?: { left: string; right: string }[];
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    subjectId?: string;
}

export interface Subject {
    id: string;
    name: string;
    icon: string;
}

export interface Player {
    id: string;
    name: string;
    score: number;
    isHost: boolean;
    connected: boolean;
}

export interface RoundResult {
    playerId: string;
    playerName: string;
    isCorrect: boolean;
    points: number;
    totalScore: number;
    timeTaken: number;
    rank: number;
}

export interface MarketItem {
    id: string;
    title: string;
    description?: string;
    type: 'topic_unlock' | 'subject_unlock' | 'avatar_unlock' | 'membership_topics' | 'membership_avatars';
    priceDirhams: number;
    discountPercent?: number;
    topicId?: string;
    subjectId?: string;
    avatarTemplateId?: string;
}

export interface AvatarFaceTemplate {
    id: string;
    name: string;
    active: boolean;
    isBuiltin?: boolean;
    uneditable?: boolean;
    premium?: boolean;
    previewAsset?: {
        dataUrl?: string;
        url?: string;
    };
    transform?: {
        x: number;
        y: number;
        sizePct: number;
        rotation: number;
        scale: number;
    };
}

export type GameState =
    | 'welcome'
    | 'categories'
    | 'playing'
    | 'result'
    | 'admin'
    | 'multiplayer-lobby'
    | 'multiplayer-waiting'
    | 'multiplayer-playing'
    | 'multiplayer-leaderboard'
    | 'multiplayer-selecting-category'
    | 'multiplayer-selecting-type';

export type GameMode = 'standard' | 'turn-based';
