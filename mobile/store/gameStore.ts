import { create } from 'zustand';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    writeBatch,
    setDoc,
    orderBy,
    limit,
    getDoc,
    arrayUnion,
    increment
} from 'firebase/firestore';
import { Question, Category, Subject, Player, MarketItem, AvatarFaceTemplate, GameState, GameMode } from '../types';

interface GameStore {
    // Constants
    STARTING_DIRHAMS: number;

    // Current user
    currentUserId: string | null;
    currentUserDisplayName: string | null;
    setCurrentUser: (userId: string | null, displayName: string | null) => void;

    // Game State
    score: number;
    currentQuestionIndex: number;
    gameState: GameState;
    selectedCategory: string | null;
    gameQuestions: Question[];

    // Currency
    dirhams: number;
    loadUserDirhams: (userId: string) => Promise<void>;
    persistDirhams: (userId: string, displayName: string | null, dirhams: number) => Promise<void>;
    addDirhams: (amount: number) => void;
    spendDirhams: (amount: number) => boolean;

    // Purchases
    ownedSubjectIds: string[];
    ownedTopicIds: string[];
    ownedAvatarIds: string[];
    ownedMarketItemIds: string[];
    topicsMembershipExpiry: string | null;
    avatarsMembershipExpiry: string | null;
    purchasesLoaded: boolean;
    loadUserPurchases: (userId: string) => Promise<void>;
    hasActiveTopicsMembership: () => boolean;
    hasActiveAvatarsMembership: () => boolean;

    // Avatar
    avatarV2: any;
    avatarFaceTemplates: AvatarFaceTemplate[];
    loadUserAvatarV2: (userId: string) => Promise<void>;
    saveUserAvatarV2: (userId: string, avatarV2: any) => Promise<{ ok: boolean; error?: any }>;
    getBuiltinFaceTemplates: () => AvatarFaceTemplate[];

    // Streak
    currentStreak: number;
    longestStreak: number;
    lastOnlineGameDate: string | null;
    recordOnlineGame: (userId: string, displayName: string | null) => Promise<any>;
    loadUserStreak: (userId: string) => Promise<void>;

    // Game Settings
    questionCount: number;
    timePerQuestion: number;
    selectedTypes: string[];
    setQuestionCount: (count: number) => void;
    setTimePerQuestion: (time: number) => void;
    toggleType: (type: string) => void;

    // Multiplayer State
    roomCode: string | null;
    players: Player[];
    isHost: boolean;
    gameMode: GameMode;
    turnPhase: string | null;
    categorySelectorId: string | null;
    typeSelectorId: string | null;
    turnIndex: number;
    totalTurns: number;
    turnCategoryIds: string[];
    selectedTurnCategoryId: string | null;
    multiplayerQuestion: Question | null;
    multiplayerQuestionIndex: number;
    multiplayerTotalQuestions: number;
    multiplayerPlayedQuestions: Question[];
    roundResults: any;
    isGameOver: boolean;
    winner: any;

    // Data
    subjects: Subject[];
    categories: Category[];
    questions: Question[];
    marketItems: MarketItem[];
    isLoading: boolean;
    dataInitialized: boolean;

    // Actions
    initializeFirestore: () => Promise<void>;
    startGame: (categoryId?: string | null) => void;
    startGameWithTopics: (topicIds: string[]) => void;
    showCategories: () => void;
    endGame: () => void;
    incrementScore: (points?: number) => void;
    nextQuestion: () => void;
    resetGame: () => void;
    goToAdmin: () => void;
    goToMultiplayer: () => void;

    // Multiplayer Actions
    setRoomData: (roomCode: string, players: Player[], isHost: boolean, gameMode?: GameMode) => void;
    updatePlayers: (players: Player[]) => void;
    setTurnData: (data: any) => void;
    setSelectedTurnCategory: (categoryId: string) => void;
    setMultiplayerGame: (question: Question, questionIndex: number, totalQuestions: number) => void;
    setRoundResults: (results: any, correctAnswer: any) => void;
    setGameOver: (finalResults: any, winner: any) => void;
    resetMultiplayer: () => void;

    // Helpers
    getFilteredQuestions: (categoryId?: string | null) => Question[];
    getFilteredQuestionsByTopics: (topicIds: string[]) => Question[];
    getCategorizedTopics: () => Category[];
    getTopicsBySubject: () => Record<string, { subject: Subject; topics: Category[] }>;
}

export const useGameStore = create<GameStore>((set, get) => ({
    STARTING_DIRHAMS: 750,

    // Current user
    currentUserId: null,
    currentUserDisplayName: null,
    setCurrentUser: (userId, displayName) => {
        set({ currentUserId: userId, currentUserDisplayName: displayName });
    },

    // Game State
    score: 0,
    currentQuestionIndex: 0,
    gameState: 'welcome',
    selectedCategory: null,
    gameQuestions: [],

    // Currency
    dirhams: 750,

    loadUserDirhams: async (userId) => {
        if (!userId) return;
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data() || {};
                if (Number.isFinite(Number(data.dirhams))) {
                    set({ dirhams: Number(data.dirhams) });
                } else {
                    const starting = get().STARTING_DIRHAMS;
                    set({ dirhams: starting });
                    await get().persistDirhams(userId, get().currentUserDisplayName, starting);
                }
            } else {
                const starting = get().STARTING_DIRHAMS;
                set({ dirhams: starting });
                await get().persistDirhams(userId, get().currentUserDisplayName, starting);
            }
        } catch (error) {
            console.error('Error loading user dirhams:', error);
        }
    },

    persistDirhams: async (userId, displayName, dirhams) => {
        if (!userId) return;
        try {
            await setDoc(doc(db, 'users', userId), {
                displayName: displayName || null,
                dirhams,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving dirhams:', error);
        }
    },

    addDirhams: (amount) => {
        const { dirhams, currentUserId, currentUserDisplayName } = get();
        const next = dirhams + Number(amount || 0);
        set({ dirhams: next });
        if (currentUserId) {
            get().persistDirhams(currentUserId, currentUserDisplayName, next);
        }
    },

    spendDirhams: (amount) => {
        const { dirhams, currentUserId, currentUserDisplayName } = get();
        const n = Number(amount || 0);
        if (dirhams >= n) {
            const next = dirhams - n;
            set({ dirhams: next });
            if (currentUserId) {
                get().persistDirhams(currentUserId, currentUserDisplayName, next);
            }
            return true;
        }
        return false;
    },

    // Purchases
    ownedSubjectIds: [],
    ownedTopicIds: [],
    ownedAvatarIds: [],
    ownedMarketItemIds: [],
    topicsMembershipExpiry: null,
    avatarsMembershipExpiry: null,
    purchasesLoaded: false,

    hasActiveTopicsMembership: () => {
        const expiry = get().topicsMembershipExpiry;
        if (!expiry) return false;
        return new Date(expiry) > new Date();
    },

    hasActiveAvatarsMembership: () => {
        const expiry = get().avatarsMembershipExpiry;
        if (!expiry) return false;
        return new Date(expiry) > new Date();
    },

    loadUserPurchases: async (userId) => {
        if (!userId) return;
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data() || {};
                set({
                    ownedSubjectIds: Array.isArray(data.ownedSubjectIds) ? data.ownedSubjectIds : [],
                    ownedTopicIds: Array.isArray(data.ownedTopicIds) ? data.ownedTopicIds : [],
                    ownedAvatarIds: Array.isArray(data.ownedAvatarIds) ? data.ownedAvatarIds : [],
                    ownedMarketItemIds: Array.isArray(data.ownedMarketItemIds) ? data.ownedMarketItemIds : [],
                    topicsMembershipExpiry: data.topicsMembershipExpiry || null,
                    avatarsMembershipExpiry: data.avatarsMembershipExpiry || null,
                    purchasesLoaded: true
                });
            } else {
                set({ purchasesLoaded: true });
            }
        } catch (error) {
            console.error('Error loading purchases:', error);
            set({ purchasesLoaded: true });
        }
    },

    // Avatar
    avatarV2: null,
    avatarFaceTemplates: [],

    getBuiltinFaceTemplates: () => ([
        { id: 'builtin_round', name: 'Round (built-in)', active: true, isBuiltin: true },
        { id: 'builtin_oval', name: 'Oval (built-in)', active: true, isBuiltin: true },
        { id: 'builtin_square', name: 'Square (built-in)', active: true, isBuiltin: true },
    ]),

    loadUserAvatarV2: async (userId) => {
        if (!userId) return;
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data() || {};
                if (data.avatarV2 && typeof data.avatarV2 === 'object') {
                    set({ avatarV2: data.avatarV2 });
                }
            }
        } catch (error) {
            console.error('Error loading avatarV2:', error);
        }
    },

    saveUserAvatarV2: async (userId, avatarV2) => {
        if (!userId || !avatarV2) return { ok: false };
        try {
            await setDoc(doc(db, 'users', userId), {
                avatarV2,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            set({ avatarV2 });
            return { ok: true };
        } catch (error) {
            console.error('Error saving avatarV2:', error);
            return { ok: false, error };
        }
    },

    // Streak
    currentStreak: 0,
    longestStreak: 0,
    lastOnlineGameDate: null,

    recordOnlineGame: async (userId, displayName) => {
        if (!userId) return { streakUpdated: false };

        const today = new Date().toISOString().split('T')[0];
        const { lastOnlineGameDate, currentStreak, longestStreak, addDirhams } = get();

        if (lastOnlineGameDate === today) {
            return { streakUpdated: false, alreadyPlayed: true };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak;
        let bonusEarned = 0;

        if (lastOnlineGameDate === yesterdayStr) {
            newStreak = currentStreak + 1;
        } else {
            newStreak = 1;
        }

        const newLongest = Math.max(longestStreak, newStreak);

        if (newStreak >= 7) bonusEarned = 100;
        else if (newStreak >= 3) bonusEarned = 50;
        else bonusEarned = 10;

        set({
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastOnlineGameDate: today
        });

        addDirhams(bonusEarned);

        try {
            const streakRef = doc(db, 'streaks', userId);
            await setDoc(streakRef, {
                displayName: displayName || 'لاعب',
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastPlayedDate: today,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving streak:', error);
        }

        return { streakUpdated: true, newStreak, bonusEarned };
    },

    loadUserStreak: async (userId) => {
        if (!userId) return;

        try {
            const streakRef = doc(db, 'streaks', userId);
            const streakDoc = await getDoc(streakRef);

            if (streakDoc.exists()) {
                const data = streakDoc.data();
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                let validStreak = data.currentStreak || 0;
                if (data.lastPlayedDate !== today && data.lastPlayedDate !== yesterdayStr) {
                    validStreak = 0;
                }

                set({
                    currentStreak: validStreak,
                    longestStreak: data.longestStreak || 0,
                    lastOnlineGameDate: data.lastPlayedDate || null
                });
            }
        } catch (error) {
            console.error('Error loading streak:', error);
        }
    },

    // Game Settings
    questionCount: 10,
    timePerQuestion: 30,
    selectedTypes: ['multiple-choice', 'fill-blank', 'order', 'match'],

    setQuestionCount: (count) => set({ questionCount: count }),
    setTimePerQuestion: (time) => set({ timePerQuestion: time }),
    toggleType: (type) => set((state) => {
        const types = state.selectedTypes.includes(type)
            ? state.selectedTypes.filter(t => t !== type)
            : [...state.selectedTypes, type];
        return { selectedTypes: types.length > 0 ? types : state.selectedTypes };
    }),

    // Multiplayer State
    roomCode: null,
    players: [],
    isHost: false,
    gameMode: 'standard',
    turnPhase: null,
    categorySelectorId: null,
    typeSelectorId: null,
    turnIndex: 0,
    totalTurns: 0,
    turnCategoryIds: [],
    selectedTurnCategoryId: null,
    multiplayerQuestion: null,
    multiplayerQuestionIndex: 0,
    multiplayerTotalQuestions: 0,
    multiplayerPlayedQuestions: [],
    roundResults: null,
    isGameOver: false,
    winner: null,

    // Data
    subjects: [],
    categories: [],
    questions: [],
    marketItems: [],
    isLoading: true,
    dataInitialized: false,

    // Initialize Firestore
    initializeFirestore: async () => {
        try {
            // Set up real-time listeners
            onSnapshot(collection(db, 'subjects'), (snapshot) => {
                const subjects = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Subject[];
                set({ subjects });
            });

            onSnapshot(collection(db, 'categories'), (snapshot) => {
                const categories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Category[];
                set({ categories, isLoading: false, dataInitialized: true });
            });

            onSnapshot(collection(db, 'questions'), (snapshot) => {
                const questions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Question[];
                set({ questions });
            });

            onSnapshot(collection(db, 'marketItems'), (snapshot) => {
                const marketItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as MarketItem[];
                set({ marketItems });
            });

            onSnapshot(collection(db, 'avatarFaceTemplates'), (snapshot) => {
                const avatarFaceTemplates = snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as AvatarFaceTemplate[];
                set({ avatarFaceTemplates });
            });

        } catch (error) {
            console.error('Error initializing Firestore:', error);
            set({ isLoading: false });
        }
    },

    // Game Actions
    startGame: (categoryId = null) => {
        const filtered = get().getFilteredQuestions(categoryId);
        set({
            gameState: 'playing',
            score: 0,
            currentQuestionIndex: 0,
            selectedCategory: categoryId,
            gameQuestions: filtered
        });
    },

    startGameWithTopics: (topicIds = []) => {
        const filtered = get().getFilteredQuestionsByTopics(topicIds);
        set({
            gameState: 'playing',
            score: 0,
            currentQuestionIndex: 0,
            selectedCategory: null,
            gameQuestions: filtered
        });
    },

    showCategories: () => set({ gameState: 'categories' }),
    endGame: () => set({ gameState: 'result' }),
    incrementScore: (points = 10) => set((state) => ({ score: state.score + points })),
    nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
    resetGame: () => set({ gameState: 'welcome', score: 0, currentQuestionIndex: 0, selectedCategory: null, gameQuestions: [] }),
    goToAdmin: () => set({ gameState: 'admin' }),
    goToMultiplayer: () => set({ gameState: 'multiplayer-lobby' }),

    // Multiplayer Actions
    setRoomData: (roomCode, players, isHost, gameMode = 'standard') => set({
        roomCode,
        players,
        isHost,
        gameMode,
        gameState: 'multiplayer-waiting'
    }),

    updatePlayers: (players) => set({ players }),

    setTurnData: (data) => set({
        turnIndex: data.turnIndex,
        totalTurns: data.totalTurns,
        categorySelectorId: data.categorySelectorId,
        typeSelectorId: data.typeSelectorId,
        turnPhase: data.phase,
        turnCategoryIds: data.availableCategoryIds || [],
        selectedTurnCategoryId: null,
        gameState: data.phase === 'category' ? 'multiplayer-selecting-category' : 'multiplayer-selecting-type'
    }),

    setSelectedTurnCategory: (categoryId) => set({
        selectedTurnCategoryId: categoryId,
        turnPhase: 'type',
        gameState: 'multiplayer-selecting-type'
    }),

    setMultiplayerGame: (question, questionIndex, totalQuestions) => set((state) => ({
        multiplayerQuestion: question,
        multiplayerQuestionIndex: questionIndex,
        multiplayerTotalQuestions: totalQuestions,
        multiplayerPlayedQuestions: [...state.multiplayerPlayedQuestions, question].slice(-totalQuestions),
        gameState: 'multiplayer-playing',
        roundResults: null
    })),

    setRoundResults: (results, correctAnswer) => set({
        roundResults: { results, correctAnswer },
        gameState: 'multiplayer-leaderboard'
    }),

    setGameOver: (finalResults, winner) => set({
        roundResults: { results: finalResults },
        isGameOver: true,
        winner,
        gameState: 'multiplayer-leaderboard'
    }),

    resetMultiplayer: () => set({
        roomCode: null,
        players: [],
        isHost: false,
        gameMode: 'standard',
        turnPhase: null,
        categorySelectorId: null,
        typeSelectorId: null,
        multiplayerQuestion: null,
        multiplayerQuestionIndex: 0,
        multiplayerTotalQuestions: 0,
        multiplayerPlayedQuestions: [],
        roundResults: null,
        isGameOver: false,
        winner: null,
        gameState: 'welcome'
    }),

    // Helpers
    getFilteredQuestions: (categoryId = null) => {
        const { questions, selectedTypes, questionCount, categories, subjects } = get();
        let filtered = [...questions];

        const categorizedTopicIds = categories
            .filter(cat => cat.subjectId && subjects.some(s => s.id === cat.subjectId))
            .map(cat => cat.id);

        if (categoryId !== null) {
            filtered = filtered.filter(q => q.category === categoryId);
        } else {
            filtered = filtered.filter(q => categorizedTopicIds.includes(q.category));
        }

        filtered = filtered.filter(q => selectedTypes.includes(q.type));
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, questionCount);
    },

    getFilteredQuestionsByTopics: (topicIds = []) => {
        const { questions, selectedTypes, questionCount } = get();
        let filtered = questions.filter(q =>
            topicIds.includes(q.category) && selectedTypes.includes(q.type)
        );
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, questionCount);
    },

    getCategorizedTopics: () => {
        const { categories, subjects } = get();
        return categories.filter(cat => cat.subjectId && subjects.some(s => s.id === cat.subjectId));
    },

    getTopicsBySubject: () => {
        const { categories, subjects } = get();
        const grouped: Record<string, { subject: Subject; topics: Category[] }> = {};

        subjects.forEach(subject => {
            grouped[subject.id] = {
                subject,
                topics: categories.filter(cat => cat.subjectId === subject.id)
            };
        });

        const uncategorizedTopics = categories.filter(cat => !cat.subjectId);
        if (uncategorizedTopics.length > 0) {
            grouped['uncategorized'] = {
                subject: { id: 'uncategorized', name: 'غير مصنف', icon: '📦' },
                topics: uncategorizedTopics
            };
        }

        return grouped;
    },
}));
