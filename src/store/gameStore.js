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

    multiplayerQuestion: null,
    multiplayerQuestionIndex: 0,
    multiplayerTotalQuestions: 0,
    roundResults: null,
    isGameOver: false,
    winner: null,

    // Data
    categories: [],
    questions: [],
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

            // Store unsubscribe functions
            set({ unsubscribeCategories, unsubscribeQuestions });
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
        set({
            gameState: 'playing',
            score: 0,
            currentQuestionIndex: 0,
            selectedCategory: categoryId,
            questions: filtered
        });
    },
    showCategories: () => set({ gameState: 'categories' }),
    endGame: () => set({ gameState: 'result' }),
    incrementScore: (points = 10) => set((state) => ({ score: state.score + points })),
    nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
    resetGame: () => set({ gameState: 'welcome', score: 0, currentQuestionIndex: 0, selectedCategory: null }),
    goToAdmin: () => set({ gameState: 'admin' }),

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
        gameState: data.phase === 'category' ? 'multiplayer-selecting-category' : 'multiplayer-selecting-type'
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
    getFilteredQuestions: () => {
        const { questions, selectedCategory, selectedTypes, questionCount } = get();
        let filtered = questions;

        if (selectedCategory) {
            filtered = filtered.filter(q => q.category === selectedCategory);
        }

        filtered = filtered.filter(q => selectedTypes.includes(q.type));

        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
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
}));

