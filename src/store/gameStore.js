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
    writeBatch
} from 'firebase/firestore';
import { initialCategories, initialQuestions } from '../data/questions';

export const useGameStore = create((set, get) => ({
    // Game State
    score: 0,
    currentQuestionIndex: 0,
    gameState: 'welcome',
    selectedCategory: null,
    gameQuestions: [], // Filtered questions for current game session

    // Admin Review Game (play all filtered questions from Admin page)
    adminReviewActive: false,
    adminReviewQuestionIds: [],
    adminReviewMeta: null, // { filterCategory, filterType, startedAt }

    // Game Settings
    questionCount: 10,
    timePerQuestion: 30,
    selectedTypes: ['multiple-choice', 'fill-blank', 'order', 'match'],

    // Multiplayer State
    roomCode: null,
    players: [],
    isHost: false,
    gameMode: 'standard',

    // Turn-Based State
    turnPhase: null,
    categorySelectorId: null,
    typeSelectorId: null,
    turnIndex: 0,
    totalTurns: 0,
    turnCategoryIds: [],
    selectedTurnCategoryId: null, // For visual feedback when category is picked

    multiplayerQuestion: null,
    multiplayerQuestionIndex: 0,
    multiplayerTotalQuestions: 0,
    roundResults: null,
    isGameOver: false,
    winner: null,

    // Data
    categories: [],
    questions: [],
    reports: [],
    isLoading: true,
    dataInitialized: false,

    // Initialize Firestore listeners
    initializeFirestore: async () => {
        try {
            // Set up real-time listeners
            const unsubscribeCategories = onSnapshot(
                collection(db, 'categories'),
                (snapshot) => {
                    const categories = snapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id  // Ensure Firestore ID is used, not any 'id' from document data
                    }));
                    set({ categories, isLoading: false, dataInitialized: true });
                }
            );

            const unsubscribeQuestions = onSnapshot(
                collection(db, 'questions'),
                (snapshot) => {
                    const questions = snapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id  // Ensure Firestore ID is used, not any 'id' from document data
                    }));
                    set({ questions });
                }
            );

            const unsubscribeReports = onSnapshot(
                collection(db, 'reports'),
                (snapshot) => {
                    const reports = snapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    }));
                    set({ reports });
                }
            );

            // Store unsubscribe functions
            set({ unsubscribeCategories, unsubscribeQuestions, unsubscribeReports });
        } catch (error) {
            console.error('Error initializing Firestore:', error);
            set({ isLoading: false });
        }
    },

    // Seed initial data
    seedInitialData: async () => {
        try {
            // First, create categories and build a mapping from old IDs to new Firestore IDs
            const categoryIdMap = {};
            const categoryRefs = [];

            // Old category IDs that questions reference
            const oldCategoryIds = ['geography', 'history', 'culture', 'nature'];

            // Add categories and capture their new IDs
            for (let i = 0; i < initialCategories.length; i++) {
                const category = initialCategories[i];
                const categoryRef = doc(collection(db, 'categories'));
                categoryRefs.push({ ref: categoryRef, data: category });
                // Map old ID to new Firestore ID
                categoryIdMap[oldCategoryIds[i]] = categoryRef.id;
            }

            const batch = writeBatch(db);

            // Add categories to batch
            categoryRefs.forEach(({ ref, data }) => {
                batch.set(ref, data);
            });

            // Add questions with mapped category IDs
            initialQuestions.forEach((question) => {
                const questionRef = doc(collection(db, 'questions'));
                // Map the old category ID to the new Firestore ID
                const mappedQuestion = {
                    ...question,
                    category: categoryIdMap[question.category] || question.category
                };
                batch.set(questionRef, mappedQuestion);
            });

            await batch.commit();
            console.log('Initial data seeded successfully');
        } catch (error) {
            console.error('Error seeding initial data:', error);
        }
    },

    // Game Actions
    startGame: (categoryId = null) => {
        const filtered = get().getFilteredQuestions(categoryId);
        console.log(`Starting game with ${filtered.length} questions (category: ${categoryId || 'all'})`);
        set({
            gameState: 'playing',
            score: 0,
            currentQuestionIndex: 0,
            selectedCategory: categoryId,
            gameQuestions: filtered // Store in gameQuestions, not questions
        });
    },
    showCategories: () => set({ gameState: 'categories' }),
    endGame: () => set({ gameState: 'result' }),
    incrementScore: (points = 10) => set((state) => ({ score: state.score + points })),
    nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
    resetGame: () => set({ gameState: 'welcome', score: 0, currentQuestionIndex: 0, selectedCategory: null, gameQuestions: [] }),
    goToAdmin: () => set({ gameState: 'admin' }),

    // Admin Review Game Actions
    startAdminReviewGame: (questionIds, meta = {}) => set({
        adminReviewActive: true,
        adminReviewQuestionIds: Array.isArray(questionIds) ? questionIds : [],
        adminReviewMeta: { ...meta, startedAt: Date.now() }
    }),
    exitAdminReviewGame: () => set({
        adminReviewActive: false,
        adminReviewQuestionIds: [],
        adminReviewMeta: null
    }),

    // Multiplayer Actions
    goToMultiplayer: () => set({ gameState: 'multiplayer-lobby' }),
    setRoomData: (roomCode, players, isHost, gameMode = 'standard') => set({
        roomCode,
        players,
        isHost,
        gameMode,
        gameState: 'multiplayer-waiting'
    }),
    updatePlayers: (players) => set({ players }),

    // Turn-Based Actions
    setTurnData: (data) => set({
        turnIndex: data.turnIndex,
        totalTurns: data.totalTurns,
        categorySelectorId: data.categorySelectorId,
        typeSelectorId: data.typeSelectorId,
        turnPhase: data.phase,
        turnCategoryIds: data.availableCategoryIds || [],
        selectedTurnCategoryId: null, // Reset on new turn/phase
        gameState: data.phase === 'category' ? 'multiplayer-selecting-category' : 'multiplayer-selecting-type'
    }),

    setSelectedTurnCategory: (categoryId) => set({
        selectedTurnCategoryId: categoryId,
        turnPhase: 'type', // Move to type selection phase
        gameState: 'multiplayer-selecting-type'
    }),

    setMultiplayerGame: (question, questionIndex, totalQuestions) => set({
        multiplayerQuestion: question,
        multiplayerQuestionIndex: questionIndex,
        multiplayerTotalQuestions: totalQuestions,
        gameState: 'multiplayer-playing',
        roundResults: null
    }),
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
        roundResults: null,
        isGameOver: false,
        winner: null,
        gameState: 'welcome'
    }),

    // Game Settings Actions
    setQuestionCount: (count) => set({ questionCount: count }),
    setTimePerQuestion: (time) => set({ timePerQuestion: time }),
    toggleType: (type) => set((state) => {
        const types = state.selectedTypes.includes(type)
            ? state.selectedTypes.filter(t => t !== type)
            : [...state.selectedTypes, type];
        return { selectedTypes: types.length > 0 ? types : state.selectedTypes };
    }),

    // Get filtered questions
    getFilteredQuestions: (categoryId = null) => {
        const { questions, selectedTypes, questionCount } = get();
        let filtered = [...questions]; // Clone to avoid mutation

        // Filter by category if provided
        if (categoryId !== null) {
            filtered = filtered.filter(q => q.category === categoryId);
        }

        // Filter by selected question types
        filtered = filtered.filter(q => selectedTypes.includes(q.type));

        // Shuffle and limit to questionCount
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, questionCount);
    },

    // Category Actions (Firestore)
    addCategory: async (category) => {
        try {
            await addDoc(collection(db, 'categories'), category);
        } catch (error) {
            console.error('Error adding category:', error);
        }
    },
    editCategory: async (id, updates) => {
        try {
            const categoryRef = doc(db, 'categories', id);
            await updateDoc(categoryRef, updates);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    },
    deleteCategory: async (id) => {
        try {
            await deleteDoc(doc(db, 'categories', id));
            // Delete all questions in this category
            const questionsToDelete = get().questions.filter(q => q.category === id);
            const batch = writeBatch(db);
            questionsToDelete.forEach(q => {
                batch.delete(doc(db, 'questions', q.id));
            });
            await batch.commit();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    },

    // Question Actions (Firestore)
    addQuestion: async (question) => {
        try {
            await addDoc(collection(db, 'questions'), question);
        } catch (error) {
            console.error('Error adding question:', error);
        }
    },
    editQuestion: async (id, updates) => {
        try {
            const questionRef = doc(db, 'questions', id);
            await updateDoc(questionRef, updates);
        } catch (error) {
            console.error('Error updating question:', error);
        }
    },
    deleteQuestion: async (id) => {
        try {
            await deleteDoc(doc(db, 'questions', id));
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    },
    deleteQuestions: async (ids) => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                batch.delete(doc(db, 'questions', id));
            });
            await batch.commit();
        } catch (error) {
            console.error('Error deleting questions:', error);
        }
    },

    // Import questions from JSON
    importQuestionsFromJSON: async (jsonData) => {
        try {
            const batch = writeBatch(db);

            // Import categories if present
            if (jsonData.categories && Array.isArray(jsonData.categories)) {
                jsonData.categories.forEach((category) => {
                    const categoryRef = doc(collection(db, 'categories'));
                    batch.set(categoryRef, category);
                });
            }

            // Import questions
            if (jsonData.questions && Array.isArray(jsonData.questions)) {
                jsonData.questions.forEach((question) => {
                    const questionRef = doc(collection(db, 'questions'));
                    batch.set(questionRef, question);
                });
            }

            await batch.commit();
            return { success: true, message: 'Data imported successfully!' };
        } catch (error) {
            console.error('Error importing JSON:', error);
            return { success: false, message: error.message };
        }
    },

    // Report Actions (Firestore)
    reportQuestion: async (questionId, questionData, reason = '') => {
        try {
            // Check if question is already reported
            const existingReport = get().reports.find(r => r.questionId === questionId && r.status === 'pending');
            if (existingReport) {
                return { success: false, message: 'This question has already been reported' };
            }

            await addDoc(collection(db, 'reports'), {
                questionId,
                questionData,
                reason,
                status: 'pending',
                createdAt: new Date(),
                resolvedAt: null
            });
            return { success: true, message: 'Question reported successfully' };
        } catch (error) {
            console.error('Error reporting question:', error);
            return { success: false, message: error.message };
        }
    },
    resolveReport: async (reportId, action = 'dismiss') => {
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                status: action === 'dismiss' ? 'dismissed' : 'resolved',
                resolvedAt: new Date()
            });
        } catch (error) {
            console.error('Error resolving report:', error);
        }
    },
    deleteReport: async (reportId) => {
        try {
            await deleteDoc(doc(db, 'reports', reportId));
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    },
}));

