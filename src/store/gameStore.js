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
    arrayUnion
} from 'firebase/firestore';
import { initialCategories, initialQuestions } from '../data/questions';

async function blobToDataUrl(blob) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

async function fileToText(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

async function compressRasterToDataUrl(file, { maxSize = 512, type = 'image/webp', quality = 0.82 } = {}) {
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = url;
        });

        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const blob = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), type, quality)
        );
        if (!blob) throw new Error('Failed to encode image');
        const dataUrl = await blobToDataUrl(blob);
        return { dataUrl, w, h, mime: type, bytes: blob.size };
    } finally {
        URL.revokeObjectURL(url);
    }
}

function svgTextToDataUrl(svgText) {
    // Safer for unicode than base64: encodeURIComponent
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

export const useGameStore = create((set, get) => ({
    STARTING_DIRHAMS: 750,

    // Built-in face templates (so admins can position parts for circle/oval/square)
    getBuiltinFaceTemplates: () => ([
        { id: 'builtin_round', name: 'Round (built-in)', active: true, isBuiltin: true, previewAsset: null },
        { id: 'builtin_oval', name: 'Oval (built-in)', active: true, isBuiltin: true, previewAsset: null },
        { id: 'builtin_square', name: 'Square (built-in)', active: true, isBuiltin: true, previewAsset: null },
    ]),

    // Current user (for persistence)
    currentUserId: null,
    currentUserDisplayName: null,
    setCurrentUser: (userId, displayName) => {
        set({ currentUserId: userId || null, currentUserDisplayName: displayName || null });
    },

    // Game State
    score: 0,
    currentQuestionIndex: 0,
    gameState: 'welcome',
    selectedCategory: null,
    gameQuestions: [], // Filtered questions for current game session

    // Currency (Dirhams - دراهم)
    dirhams: 750, // Starting balance (new accounts)

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
                    // Existing user doc but no balance yet
                    const starting = get().STARTING_DIRHAMS;
                    set({ dirhams: starting });
                    await get().persistDirhams(userId, data.displayName || get().currentUserDisplayName, starting);
                }
            } else {
                // New user: initialize balance in Firestore
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

    // Currency Actions
    addDirhams: (amount) => {
        const { dirhams, currentUserId, currentUserDisplayName } = get();
        const next = dirhams + Number(amount || 0);
        set({ dirhams: next });
        // Persist for logged-in users
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
            // Persist for logged-in users
            if (currentUserId) {
                get().persistDirhams(currentUserId, currentUserDisplayName, next);
            }
            return true;
        }
        return false;
    },

    // Purchases / Ownership (Firestore users/{uid})
    ownedSubjectIds: [],
    ownedTopicIds: [],
    ownedAvatarIds: [],
    ownedMarketItemIds: [],
    topicsMembershipExpiry: null, // ISO date string when membership expires
    avatarsMembershipExpiry: null, // ISO date string when membership expires
    purchasesLoaded: false,

    // Check if user has active membership
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
                set({ ownedSubjectIds: [], ownedTopicIds: [], ownedAvatarIds: [], ownedMarketItemIds: [], topicsMembershipExpiry: null, avatarsMembershipExpiry: null, purchasesLoaded: true });
            }
        } catch (error) {
            console.error('Error loading user purchases:', error);
            set({ purchasesLoaded: true });
        }
    },

    // Avatar customization
    avatar: null, // User's avatar config

    loadUserAvatar: async (userId) => {
        if (!userId) return;
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data() || {};
                if (data.avatar && typeof data.avatar === 'object') {
                    set({ avatar: data.avatar });
                }
            }
        } catch (error) {
            console.error('Error loading user avatar:', error);
        }
    },

    saveUserAvatar: async (userId, avatarConfig) => {
        if (!userId || !avatarConfig) return { ok: false };
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                avatar: avatarConfig,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            set({ avatar: avatarConfig });
            return { ok: true };
        } catch (error) {
            console.error('Error saving user avatar:', error);
            return { ok: false, error };
        }
    },

    // Avatar V2 (layered assets)
    avatarV2: null, // { mode: 'layered'|'builtin', templateId, selections, overridesByTemplate }
    avatarFaceTemplates: [],
    avatarParts: [],
    avatarAdminLoading: false,
    avatarSettings: { disableEditableAvatars: false }, // global toggle: show only uneditable templates to users

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
            console.error('Error loading user avatarV2:', error);
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
            console.error('Error saving user avatarV2:', error);
            return { ok: false, error };
        }
    },

    uploadAvatarAsset: async ({ file, path }) => {
        // Option A: store as Base64/dataUrl inside Firestore (no Firebase Storage)
        if (!file) return { ok: false, error: { message: 'missing_file' } };
        try {
            const isSvg = file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml';
            let dataUrl;
            let w;
            let h;
            let mime;
            let bytes;

            if (isSvg) {
                const svgText = await fileToText(file);
                dataUrl = svgTextToDataUrl(svgText);
                mime = 'image/svg+xml';
                bytes = svgText.length;
            } else {
                const out = await compressRasterToDataUrl(file, { maxSize: 512, type: 'image/webp', quality: 0.82 });
                dataUrl = out.dataUrl;
                w = out.w;
                h = out.h;
                mime = out.mime;
                bytes = out.bytes;
            }

            // Firestore doc limit is ~1MB. Keep each asset small.
            if (typeof dataUrl === 'string' && dataUrl.length > 350_000) {
                return { ok: false, error: { message: 'Image too large for Firestore. Use a smaller image.' } };
            }

            return { ok: true, dataUrl, contentType: mime || file.type, name: file.name, size: bytes, w, h };
        } catch (error) {
            console.error('Error uploading avatar asset:', error);
            return { ok: false, error: { message: error?.message || String(error) } };
        }
    },

    loadAvatarSettings: async () => {
        // One-time fetch; realtime listener is set in initializeFirestore.
        try {
            const snap = await getDoc(doc(db, 'config', 'avatar'));
            if (snap.exists()) {
                const data = snap.data() || {};
                set({ avatarSettings: { disableEditableAvatars: !!data.disableEditableAvatars } });
            }
        } catch (e) {
            console.warn('Failed to load avatar settings:', e);
        }
    },

    setDisableEditableAvatars: async (disableEditableAvatars) => {
        try {
            await setDoc(doc(db, 'config', 'avatar'), {
                disableEditableAvatars: !!disableEditableAvatars,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            set({ avatarSettings: { ...(get().avatarSettings || {}), disableEditableAvatars: !!disableEditableAvatars } });
            return { ok: true };
        } catch (error) {
            console.error('Error updating avatar settings:', error);
            return { ok: false, error };
        }
    },

    // Admin: Face templates
    addAvatarFaceTemplate: async (payload) => {
        try {
            await addDoc(collection(db, 'avatarFaceTemplates'), payload);
        } catch (error) {
            console.error('Error adding face template:', error);
        }
    },
    editAvatarFaceTemplate: async (id, updates) => {
        try {
            await updateDoc(doc(db, 'avatarFaceTemplates', id), updates);
        } catch (error) {
            console.error('Error updating face template:', error);
        }
    },
    deleteAvatarFaceTemplate: async (id) => {
        try {
            await deleteDoc(doc(db, 'avatarFaceTemplates', id));
        } catch (error) {
            console.error('Error deleting face template:', error);
        }
    },

    // Admin: Parts
    addAvatarPart: async (payload) => {
        try {
            const ref = await addDoc(collection(db, 'avatarParts'), payload);
            return { ok: true, id: ref.id };
        } catch (error) {
            console.error('Error adding avatar part:', error);
            return { ok: false, error };
        }
    },
    editAvatarPart: async (id, updates) => {
        try {
            await updateDoc(doc(db, 'avatarParts', id), updates);
            return { ok: true };
        } catch (error) {
            console.error('Error updating avatar part:', error);
            return { ok: false, error };
        }
    },
    deleteAvatarPart: async (id) => {
        try {
            await deleteDoc(doc(db, 'avatarParts', id));
        } catch (error) {
            console.error('Error deleting avatar part:', error);
        }
    },

    saveAvatarPartTransform: async ({ partId, templateId, transform }) => {
        if (!partId || !templateId || !transform) return;
        try {
            const partRef = doc(db, 'avatarParts', partId);
            // read current to merge transformsByTemplate safely
            const snap = await getDoc(partRef);
            const current = snap.exists() ? snap.data() : {};
            const transformsByTemplate = { ...(current?.transformsByTemplate || {}) };
            transformsByTemplate[templateId] = {
                x: Number(transform.x || 0),
                y: Number(transform.y || 0),
                scale: Number(transform.scale || 1),
                rotation: Number(transform.rotation || 0),
                sizePct: Number(transform.sizePct || 40)
            };
            await updateDoc(partRef, { transformsByTemplate, updatedAt: new Date().toISOString() });
        } catch (error) {
            console.error('Error saving part transform:', error);
        }
    },

    // Market catalog (Firestore marketItems)
    marketItems: [],

    addMarketItem: async (item) => {
        try {
            await addDoc(collection(db, 'marketItems'), item);
        } catch (error) {
            console.error('Error adding market item:', error);
        }
    },
    editMarketItem: async (id, updates) => {
        try {
            const ref = doc(db, 'marketItems', id);
            await updateDoc(ref, updates);
        } catch (error) {
            console.error('Error updating market item:', error);
        }
    },
    deleteMarketItem: async (id) => {
        try {
            await deleteDoc(doc(db, 'marketItems', id));
        } catch (error) {
            console.error('Error deleting market item:', error);
        }
    },

    purchaseMarketItem: async ({ userId, displayName, item }) => {
        if (!userId || !item?.id) return { ok: false, error: 'missing_user_or_item' };

        // Calculate final price with discount
        const basePrice = Number(item.priceDirhams || 0);
        const discount = Number(item.discountPercent || 0);
        const price = discount > 0 && discount <= 100
            ? Math.max(0, Math.round(basePrice * (1 - discount / 100)))
            : basePrice;

        if (!Number.isFinite(price) || price < 0) return { ok: false, error: 'invalid_price' };

        const stateBefore = get();
        const { dirhams, spendDirhams, ownedMarketItemIds, ownedTopicIds, ownedSubjectIds, ownedAvatarIds } = stateBefore;

        // Already owned
        if (ownedMarketItemIds.includes(item.id)) return { ok: false, error: 'already_owned' };
        if (item.type === 'topic_unlock' && item.topicId && ownedTopicIds.includes(item.topicId)) {
            return { ok: false, error: 'topic_already_owned' };
        }
        if (item.type === 'subject_unlock' && item.subjectId && ownedSubjectIds.includes(item.subjectId)) {
            return { ok: false, error: 'subject_already_owned' };
        }
        if (item.type === 'avatar_unlock' && item.avatarTemplateId && ownedAvatarIds.includes(item.avatarTemplateId)) {
            return { ok: false, error: 'avatar_already_owned' };
        }

        if (dirhams < price) return { ok: false, error: 'insufficient_funds' };

        // Spend locally first (will persist via spendDirhams if currentUserId set)
        if (!spendDirhams(price)) return { ok: false, error: 'insufficient_funds' };

        try {
            const userRef = doc(db, 'users', userId);
            const updates = {
                displayName: displayName || null,
                ownedMarketItemIds: arrayUnion(item.id),
                // also persist latest dirhams value for safety
                dirhams: get().dirhams,
                updatedAt: new Date().toISOString()
            };

            if (item.type === 'topic_unlock' && item.topicId) {
                updates.ownedTopicIds = arrayUnion(item.topicId);
            }
            if (item.type === 'subject_unlock' && item.subjectId) {
                updates.ownedSubjectIds = arrayUnion(item.subjectId);
            }
            if (item.type === 'avatar_unlock' && item.avatarTemplateId) {
                updates.ownedAvatarIds = arrayUnion(item.avatarTemplateId);
            }

            // Handle membership types
            if (item.type === 'membership_topics') {
                // Calculate expiry: 1 year from now (or extend if already active)
                const currentExpiry = get().topicsMembershipExpiry;
                const now = new Date();
                const startDate = (currentExpiry && new Date(currentExpiry) > now) ? new Date(currentExpiry) : now;
                const newExpiry = new Date(startDate);
                newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                updates.topicsMembershipExpiry = newExpiry.toISOString();
            }
            if (item.type === 'membership_avatars') {
                // Calculate expiry: 1 year from now (or extend if already active)
                const currentExpiry = get().avatarsMembershipExpiry;
                const now = new Date();
                const startDate = (currentExpiry && new Date(currentExpiry) > now) ? new Date(currentExpiry) : now;
                const newExpiry = new Date(startDate);
                newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                updates.avatarsMembershipExpiry = newExpiry.toISOString();
            }

            await setDoc(userRef, updates, { merge: true });

            set({
                ownedMarketItemIds: Array.from(new Set([...ownedMarketItemIds, item.id])),
                ownedSubjectIds: (item.type === 'subject_unlock' && item.subjectId)
                    ? Array.from(new Set([...ownedSubjectIds, item.subjectId]))
                    : ownedSubjectIds,
                ownedTopicIds: (item.type === 'topic_unlock' && item.topicId)
                    ? Array.from(new Set([...ownedTopicIds, item.topicId]))
                    : ownedTopicIds,
                ownedAvatarIds: (item.type === 'avatar_unlock' && item.avatarTemplateId)
                    ? Array.from(new Set([...ownedAvatarIds, item.avatarTemplateId]))
                    : ownedAvatarIds,
                topicsMembershipExpiry: item.type === 'membership_topics' ? updates.topicsMembershipExpiry : get().topicsMembershipExpiry,
                avatarsMembershipExpiry: item.type === 'membership_avatars' ? updates.avatarsMembershipExpiry : get().avatarsMembershipExpiry
            });

            return { ok: true };
        } catch (error) {
            console.error('Error purchasing market item:', error);
            // refund local balance
            set({ dirhams: dirhams });
            return { ok: false, error: 'purchase_failed' };
        }
    },

    // Daily Streak System
    currentStreak: 0,
    longestStreak: 0,
    lastOnlineGameDate: null,
    streakLeaderboard: [],
    streakLoading: false,

    // Check and update streak when completing an online game
    recordOnlineGame: async (userId, displayName) => {
        if (!userId) return { streakUpdated: false };

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const { lastOnlineGameDate, currentStreak, longestStreak, addDirhams } = get();

        // Already played today
        if (lastOnlineGameDate === today) {
            return { streakUpdated: false, alreadyPlayed: true };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak;
        let bonusEarned = 0;

        if (lastOnlineGameDate === yesterdayStr) {
            // Continuing streak
            newStreak = currentStreak + 1;
        } else {
            // Starting new streak (broke or first time)
            newStreak = 1;
        }

        const newLongest = Math.max(longestStreak, newStreak);

        // Streak bonus rewards
        if (newStreak >= 7) bonusEarned = 100;
        else if (newStreak >= 3) bonusEarned = 50;
        else bonusEarned = 10;

        // Update local state
        set({
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastOnlineGameDate: today
        });

        // Add bonus dirhams
        addDirhams(bonusEarned);

        // Save to Firebase
        try {
            const streakRef = doc(db, 'streaks', userId);
            await setDoc(streakRef, {
                odisplayName: displayName || 'لاعب',
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

    // Load user's streak from Firebase
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

                // Check if streak is still valid
                let validStreak = data.currentStreak || 0;
                if (data.lastPlayedDate !== today && data.lastPlayedDate !== yesterdayStr) {
                    // Streak broken
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

    // Fetch leaderboard
    fetchStreakLeaderboard: async () => {
        set({ streakLoading: true });
        try {
            const streaksRef = collection(db, 'streaks');
            const q = query(streaksRef, orderBy('currentStreak', 'desc'), limit(50));
            const snapshot = await getDocs(q);

            const leaderboard = snapshot.docs.map((doc, index) => ({
                rank: index + 1,
                odisplayName: doc.data().odisplayName || 'لاعب',
                currentStreak: doc.data().currentStreak || 0,
                longestStreak: doc.data().longestStreak || 0,
                oduserId: doc.id
            }));

            set({ streakLeaderboard: leaderboard, streakLoading: false });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            set({ streakLoading: false });
        }
    },

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
    multiplayerPlayedQuestions: [], // Track all questions played in multiplayer
    roundResults: null,
    isGameOver: false,
    winner: null,

    // Data
    subjects: [], // Parent grouping for topics
    categories: [], // These are now "topics" - kept as categories for compatibility
    questions: [],
    reports: [],
    isLoading: true,
    dataInitialized: false,

    // Initialize Firestore listeners
    initializeFirestore: async () => {
        try {
            // Set up real-time listeners for subjects
            const unsubscribeSubjects = onSnapshot(
                collection(db, 'subjects'),
                (snapshot) => {
                    const subjects = snapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    }));
                    set({ subjects });
                }
            );

            // Set up real-time listeners for categories (topics)
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

            const unsubscribeMarketItems = onSnapshot(
                collection(db, 'marketItems'),
                (snapshot) => {
                    const marketItems = snapshot.docs.map(d => ({
                        ...d.data(),
                        id: d.id
                    }));
                    set({ marketItems });
                }
            );

            const unsubscribeAvatarFaceTemplates = onSnapshot(
                collection(db, 'avatarFaceTemplates'),
                (snapshot) => {
                    const avatarFaceTemplates = snapshot.docs.map(d => ({
                        ...d.data(),
                        id: d.id
                    }));
                    set({ avatarFaceTemplates });
                }
            );

            const unsubscribeAvatarParts = onSnapshot(
                collection(db, 'avatarParts'),
                (snapshot) => {
                    const avatarParts = snapshot.docs.map(d => ({
                        ...d.data(),
                        id: d.id
                    }));
                    set({ avatarParts });
                }
            );

            const unsubscribeAvatarConfig = onSnapshot(
                doc(db, 'config', 'avatar'),
                (snap) => {
                    if (!snap.exists()) {
                        set({ avatarSettings: { disableEditableAvatars: false } });
                        return;
                    }
                    const data = snap.data() || {};
                    set({ avatarSettings: { disableEditableAvatars: !!data.disableEditableAvatars } });
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
            set({ unsubscribeSubjects, unsubscribeCategories, unsubscribeQuestions, unsubscribeMarketItems, unsubscribeAvatarFaceTemplates, unsubscribeAvatarParts, unsubscribeAvatarConfig, unsubscribeReports });
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

    // Start game with multiple selected topics
    startGameWithTopics: (topicIds = []) => {
        const filtered = get().getFilteredQuestionsByTopics(topicIds);
        console.log(`Starting game with ${filtered.length} questions from ${topicIds.length} topics`);
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
        multiplayerPlayedQuestions: (() => {
            const prev = get().multiplayerPlayedQuestions || [];
            if (!question) return prev;
            const qid = question.id || `${question.type}:${question.question}`;
            const exists = prev.some(p => (p.id || `${p.type}:${p.question}`) === qid);
            if (exists) return prev;
            const next = [...prev, question];
            // Keep it bounded (useful if server repeats / reconnects)
            const max = Number(totalQuestions || get().multiplayerTotalQuestions || 0);
            return max > 0 ? next.slice(-max) : next;
        })(),
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
        multiplayerPlayedQuestions: [],
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
        const { questions, selectedTypes, questionCount, categories, subjects } = get();
        let filtered = [...questions]; // Clone to avoid mutation

        // Get IDs of categorized topics (topics that have a valid subject)
        const categorizedTopicIds = categories
            .filter(cat => cat.subjectId && subjects.some(s => s.id === cat.subjectId))
            .map(cat => cat.id);

        // Filter by category if provided
        if (categoryId !== null) {
            filtered = filtered.filter(q => q.category === categoryId);
        } else {
            // For "cocktail" mode (all topics), only include questions from categorized topics
            filtered = filtered.filter(q => categorizedTopicIds.includes(q.category));
        }

        // Filter by selected question types
        filtered = filtered.filter(q => selectedTypes.includes(q.type));

        // Shuffle and limit to questionCount
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, questionCount);
    },

    // Get filtered questions from multiple selected topics
    getFilteredQuestionsByTopics: (topicIds = []) => {
        const { questions, selectedTypes, questionCount } = get();

        // Filter questions by selected topics and types
        let filtered = questions.filter(q =>
            topicIds.includes(q.category) && selectedTypes.includes(q.type)
        );

        // Shuffle and limit to questionCount
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, questionCount);
    },

    // Subject Actions (Firestore) - Parent grouping for topics
    addSubject: async (subject) => {
        try {
            await addDoc(collection(db, 'subjects'), subject);
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    },
    editSubject: async (id, updates) => {
        try {
            const subjectRef = doc(db, 'subjects', id);
            await updateDoc(subjectRef, updates);
        } catch (error) {
            console.error('Error updating subject:', error);
        }
    },
    deleteSubject: async (id) => {
        try {
            // Move all topics in this subject to uncategorized (remove subjectId)
            const topicsToUpdate = get().categories.filter(c => c.subjectId === id);
            const batch = writeBatch(db);
            topicsToUpdate.forEach(topic => {
                const topicRef = doc(db, 'categories', topic.id);
                batch.update(topicRef, { subjectId: null });
            });
            await batch.commit();
            // Then delete the subject
            await deleteDoc(doc(db, 'subjects', id));
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    },

    // Helper to get topics that are categorized (have a subject) - for game selection
    getCategorizedTopics: () => {
        const { categories, subjects } = get();
        // Only return topics that have a valid subjectId
        return categories.filter(cat => cat.subjectId && subjects.some(s => s.id === cat.subjectId));
    },

    // Helper to get topics grouped by subject
    getTopicsBySubject: () => {
        const { categories, subjects } = get();
        const grouped = {};

        subjects.forEach(subject => {
            grouped[subject.id] = {
                subject,
                topics: categories.filter(cat => cat.subjectId === subject.id)
            };
        });

        // Add uncategorized topics
        const uncategorizedTopics = categories.filter(cat => !cat.subjectId);
        if (uncategorizedTopics.length > 0) {
            grouped['uncategorized'] = {
                subject: { id: 'uncategorized', name: 'غير مصنف', icon: '📦' },
                topics: uncategorizedTopics
            };
        }

        return grouped;
    },

    // Category/Topic Actions (Firestore)
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

