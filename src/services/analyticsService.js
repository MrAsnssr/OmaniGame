// Analytics service for tracking user activity and collecting data
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, arrayUnion, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';

// Fetch user's IP address and geolocation using a free API
let cachedIPData = null;
export async function getIPAndGeoData() {
    if (cachedIPData) return cachedIPData;
    try {
        // Use ipapi.co which gives both IP and geo data
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            cachedIPData = {
                ip: data.ip,
                country: data.country_name,
                countryCode: data.country_code,
                city: data.city,
                region: data.region,
                postalCode: data.postal,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone,
                isp: data.org,
                asn: data.asn,
                isVPN: data.org?.toLowerCase().includes('vpn') || data.org?.toLowerCase().includes('proxy') || false
            };
            return cachedIPData;
        }
        // Fallback to simple IP only
        const fallback = await fetch('https://api.ipify.org?format=json');
        if (fallback.ok) {
            const d = await fallback.json();
            cachedIPData = { ip: d.ip };
            return cachedIPData;
        }
        return { ip: null };
    } catch (error) {
        console.error('Error fetching IP/geo data:', error);
        return { ip: null };
    }
}

// Legacy function for backwards compatibility
export async function getIPAddress() {
    const data = await getIPAndGeoData();
    return data.ip;
}

// Check if an IP is banned
export async function checkIPBan(ip) {
    if (!ip) return { banned: false };
    try {
        const bansRef = collection(db, 'bannedIPs');
        const q = query(bansRef, where('ip', '==', ip));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const banData = snap.docs[0].data();
            return { banned: true, reason: banData.reason, bannedAt: banData.bannedAt };
        }
        return { banned: false };
    } catch (error) {
        console.error('Error checking IP ban:', error);
        return { banned: false };
    }
}

// Ban an IP address
export async function banIP(ip, reason = 'No reason provided', bannedBy = 'admin') {
    if (!ip) return { success: false, error: 'No IP provided' };
    try {
        const bansRef = collection(db, 'bannedIPs');
        await addDoc(bansRef, {
            ip,
            reason,
            bannedBy,
            bannedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error banning IP:', error);
        return { success: false, error };
    }
}

// Unban an IP address
export async function unbanIP(ip) {
    if (!ip) return { success: false, error: 'No IP provided' };
    try {
        const bansRef = collection(db, 'bannedIPs');
        const q = query(bansRef, where('ip', '==', ip));
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
            await deleteDoc(doc(db, 'bannedIPs', docSnap.id));
        }
        return { success: true };
    } catch (error) {
        console.error('Error unbanning IP:', error);
        return { success: false, error };
    }
}

// Get all banned IPs
export async function getBannedIPs() {
    try {
        const bansRef = collection(db, 'bannedIPs');
        const snap = await getDocs(bansRef);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error getting banned IPs:', error);
        return [];
    }
}

// Admin: Give dirhams to a user
export async function giveDirhams(userId, amount, reason = 'Admin top-up') {
    if (!userId || !amount) return { success: false, error: 'Missing userId or amount' };
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { success: false, error: 'User not found' };
        }

        const currentDirhams = userSnap.data().dirhams || 0;
        const newBalance = currentDirhams + Number(amount);

        await setDoc(userRef, {
            dirhams: newBalance,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // Log the top-up
        const topupRef = doc(db, 'users', userId, 'topups', `${Date.now()}`);
        await setDoc(topupRef, {
            amount: Number(amount),
            reason,
            previousBalance: currentDirhams,
            newBalance,
            addedAt: new Date().toISOString()
        });

        return { success: true, newBalance };
    } catch (error) {
        console.error('Error giving dirhams:', error);
        return { success: false, error };
    }
}

// Generate a 6-digit user ID (special case for asnssrr@gmail.com = 000000)
export function generate6DigitUserId(email) {
    if (email && email.toLowerCase() === 'asnssrr@gmail.com') {
        return '000000';
    }
    // Generate random 6 digit number
    return String(Math.floor(100000 + Math.random() * 900000));
}

// Set/get user's short ID (6-digit)
export async function getUserShortId(userId, email) {
    if (!userId) return null;
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().shortId) {
            return userSnap.data().shortId;
        }

        // Generate new short ID
        const shortId = generate6DigitUserId(email);

        // Check if shortId already exists (except for 000000)
        if (shortId !== '000000') {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('shortId', '==', shortId));
            const existing = await getDocs(q);
            if (!existing.empty) {
                // Collision - generate again (recursive)
                return getUserShortId(userId, email);
            }
        }

        // Save the short ID
        await setDoc(userRef, { shortId }, { merge: true });
        return shortId;
    } catch (error) {
        console.error('Error getting/setting short ID:', error);
        return null;
    }
}

// Collect device and browser information
export function getDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const languages = navigator.languages ? [...navigator.languages] : [language];
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const colorDepth = window.screen.colorDepth;
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const cookiesEnabled = navigator.cookieEnabled;
    const doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneOffset = new Date().getTimezoneOffset();
    const online = navigator.onLine;
    const connectionType = navigator.connection?.effectiveType || 'unknown';
    const memory = navigator.deviceMemory || 'unknown';
    const cores = navigator.hardwareConcurrency || 'unknown';

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    const isDesktop = !isMobile && !isTablet;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return {
        userAgent: ua,
        platform,
        language,
        languages,
        screen: {
            width: screenWidth,
            height: screenHeight,
            windowWidth,
            windowHeight,
            pixelRatio,
            colorDepth
        },
        deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
        browser,
        os,
        touchSupport,
        cookiesEnabled,
        doNotTrack,
        timezone,
        timezoneOffset,
        online,
        connectionType,
        memory,
        cores
    };
}

// Get referrer and entry point
export function getTrafficSource() {
    return {
        referrer: document.referrer || 'direct',
        entryUrl: window.location.href,
        pathname: window.location.pathname,
        searchParams: Object.fromEntries(new URLSearchParams(window.location.search))
    };
}

// Track user session
export async function trackUserSession(userId, displayName, email) {
    if (!userId) return;

    const now = new Date();
    const deviceInfo = getDeviceInfo();
    const trafficSource = getTrafficSource();

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const existingData = userSnap.exists() ? userSnap.data() : {};

        // Get IP and geo data
        const geoData = await getIPAndGeoData();
        const ipAddress = geoData.ip;

        // Generate short ID if not exists
        let shortId = existingData.shortId;
        if (!shortId) {
            shortId = generate6DigitUserId(email);
        }

        // Session data
        const sessionData = {
            displayName: displayName || existingData.displayName || null,
            email: email || existingData.email || null,
            shortId,

            // IP Address
            lastIP: ipAddress,
            ...(existingData.firstIP ? {} : { firstIP: ipAddress }),
            knownIPs: ipAddress ? arrayUnion(ipAddress) : existingData.knownIPs || [],

            // Geolocation
            geo: geoData.country ? {
                country: geoData.country,
                countryCode: geoData.countryCode,
                city: geoData.city,
                region: geoData.region,
                lat: geoData.latitude,
                lng: geoData.longitude,
                isp: geoData.isp,
                isVPN: geoData.isVPN
            } : existingData.geo || null,

            // Last seen
            lastSeenAt: now.toISOString(),
            lastSeenDate: now.toISOString().split('T')[0],

            // Session count
            sessionCount: increment(1),

            // Device info (latest)
            device: deviceInfo,

            // First seen (only set once)
            ...(existingData.firstSeenAt ? {} : {
                firstSeenAt: now.toISOString(),
                firstReferrer: trafficSource.referrer,
                firstEntryUrl: trafficSource.entryUrl
            }),

            // Traffic source for this session
            lastReferrer: trafficSource.referrer,
            lastEntryUrl: trafficSource.entryUrl,

            // Analytics metadata
            analyticsVersion: 3,
            updatedAt: now.toISOString()
        };

        await setDoc(userRef, sessionData, { merge: true });

        // Also track session in a subcollection for history
        const sessionRef = doc(db, 'users', userId, 'sessions', `${now.getTime()}`);
        await setDoc(sessionRef, {
            startedAt: now.toISOString(),
            device: deviceInfo,
            trafficSource,
            userAgent: deviceInfo.userAgent,
            ip: ipAddress,
            geo: geoData.country ? {
                country: geoData.country,
                city: geoData.city
            } : null
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking session:', error);
        return { success: false, error };
    }
}

// Track game play
export async function trackGamePlay(userId, gameData) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalGamesPlayed: increment(1),
            lastGamePlayedAt: now.toISOString(),
            updatedAt: now.toISOString()
        });

        // Store game session in subcollection
        const gameRef = doc(db, 'users', userId, 'games', `${now.getTime()}`);
        await setDoc(gameRef, {
            ...gameData,
            playedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking game:', error);
        return { success: false, error };
    }
}

// Track multiplayer game
export async function trackMultiplayerGame(userId, gameData) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalMultiplayerGames: increment(1),
            lastMultiplayerGameAt: now.toISOString(),
            ...(gameData.won ? { multiplayerWins: increment(1) } : {}),
            updatedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking multiplayer game:', error);
        return { success: false, error };
    }
}

// Track page views
export async function trackPageView(userId, pageName) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            [`pageViews.${pageName}`]: increment(1),
            lastPageVisited: pageName,
            lastActiveAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking page view:', error);
        return { success: false, error };
    }
}

// Track purchases
export async function trackPurchase(userId, purchaseData) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalPurchases: increment(1),
            totalSpent: increment(purchaseData.price || 0),
            lastPurchaseAt: now.toISOString(),
            purchaseHistory: arrayUnion({
                ...purchaseData,
                purchasedAt: now.toISOString()
            }),
            updatedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking purchase:', error);
        return { success: false, error };
    }
}

// Track time spent (call on page unload or periodically)
export async function trackTimeSpent(userId, seconds) {
    if (!userId || !seconds) return;

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalTimeSpentSeconds: increment(seconds),
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking time spent:', error);
        return { success: false, error };
    }
}

// Track errors/crashes
export async function trackError(userId, errorData) {
    const now = new Date();

    try {
        // Store in global errors collection (even for non-logged-in users)
        const errorRef = doc(db, 'errors', `${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`);
        await setDoc(errorRef, {
            userId: userId || 'anonymous',
            ...errorData,
            device: getDeviceInfo(),
            occurredAt: now.toISOString(),
            url: window.location.href
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking error:', error);
        return { success: false, error };
    }
}

// Track feature usage
export async function trackFeatureUsage(userId, featureName) {
    if (!userId) return;

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            [`featureUsage.${featureName}`]: increment(1),
            lastActiveAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking feature usage:', error);
        return { success: false, error };
    }
}

// Track individual question answer
export async function trackQuestionAnswer(userId, questionData) {
    if (!userId) return;

    const now = new Date();
    const { questionId, questionType, category, isCorrect, timeTaken, difficulty } = questionData;

    try {
        const userRef = doc(db, 'users', userId);

        // Update aggregate stats
        await updateDoc(userRef, {
            totalQuestionsAnswered: increment(1),
            [`questionsByType.${questionType}`]: increment(1),
            [`questionsByCategory.${category || 'unknown'}`]: increment(1),
            ...(isCorrect ? {
                correctAnswers: increment(1),
                [`correctByType.${questionType}`]: increment(1)
            } : {
                wrongAnswers: increment(1),
                [`wrongByType.${questionType}`]: increment(1)
            }),
            totalAnswerTime: increment(timeTaken || 0),
            lastQuestionAt: now.toISOString()
        });

        // Store individual answer in subcollection
        const answerRef = doc(db, 'users', userId, 'answers', `${now.getTime()}`);
        await setDoc(answerRef, {
            questionId,
            questionType,
            category,
            isCorrect,
            timeTaken,
            difficulty,
            answeredAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking question answer:', error);
        return { success: false, error };
    }
}

// Track click/interaction events
export async function trackClick(userId, element, metadata = {}) {
    if (!userId) return;

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalClicks: increment(1),
            [`clicks.${element}`]: increment(1)
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking click:', error);
        return { success: false, error };
    }
}

// Track game complete with detailed stats
export async function trackGameComplete(userId, gameStats) {
    if (!userId) return;

    const now = new Date();
    const {
        score, totalQuestions, correctAnswers, totalTime,
        gameMode, category, questionTypes, won
    } = gameStats;

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            gamesCompleted: increment(1),
            totalScore: increment(score || 0),
            totalGameTime: increment(totalTime || 0),
            bestScore: gameStats.score > (await getDoc(userRef)).data()?.bestScore ? score : undefined,
            ...(won ? { wins: increment(1) } : {}),
            lastGameAt: now.toISOString()
        });

        // Store game session details
        const gameRef = doc(db, 'users', userId, 'gameHistory', `${now.getTime()}`);
        await setDoc(gameRef, {
            score,
            totalQuestions,
            correctAnswers,
            accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0,
            totalTime,
            avgTimePerQuestion: totalQuestions > 0 ? (totalTime / totalQuestions).toFixed(1) : 0,
            gameMode,
            category,
            questionTypes,
            won,
            playedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking game complete:', error);
        return { success: false, error };
    }
}

// Track performance metrics (page load, etc.)
export async function trackPerformance(userId) {
    if (!userId || typeof window === 'undefined' || !window.performance) return;

    try {
        const perf = window.performance;
        const timing = perf.timing || {};
        const entries = perf.getEntriesByType ? perf.getEntriesByType('navigation')[0] : null;

        const metrics = {
            // Navigation timing
            pageLoadTime: timing.loadEventEnd - timing.navigationStart || entries?.loadEventEnd || null,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart || entries?.domContentLoadedEventEnd || null,
            firstPaint: null,
            firstContentfulPaint: null,

            // Memory (if available)
            usedJSHeapSize: perf.memory?.usedJSHeapSize || null,
            totalJSHeapSize: perf.memory?.totalJSHeapSize || null,

            // Connection
            effectiveType: navigator.connection?.effectiveType || null,
            downlink: navigator.connection?.downlink || null,
            rtt: navigator.connection?.rtt || null
        };

        // Get paint entries
        const paintEntries = perf.getEntriesByType ? perf.getEntriesByType('paint') : [];
        for (const entry of paintEntries) {
            if (entry.name === 'first-paint') metrics.firstPaint = entry.startTime;
            if (entry.name === 'first-contentful-paint') metrics.firstContentfulPaint = entry.startTime;
        }

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            performance: metrics,
            performanceRecordedAt: new Date().toISOString()
        });

        return { success: true, metrics };
    } catch (error) {
        console.error('Error tracking performance:', error);
        return { success: false, error };
    }
}

// Track rage clicks (multiple fast clicks indicating frustration)
let clickTimestamps = [];
export function detectRageClick(userId) {
    const now = Date.now();
    clickTimestamps.push(now);

    // Keep last 10 clicks
    clickTimestamps = clickTimestamps.slice(-10);

    // Check for 3+ clicks within 1 second
    const recentClicks = clickTimestamps.filter(t => now - t < 1000);
    if (recentClicks.length >= 3) {
        trackFeatureUsage(userId, 'rageClick');
        clickTimestamps = []; // Reset
        return true;
    }
    return false;
}

// Track scroll depth
let maxScrollDepth = 0;
export function trackScrollDepth(userId) {
    if (typeof window === 'undefined') return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
    }
}

// Save scroll depth on page leave
export async function saveScrollDepth(userId, pageName) {
    if (!userId || maxScrollDepth === 0) return;

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            [`scrollDepth.${pageName}`]: maxScrollDepth
        });
        maxScrollDepth = 0; // Reset for next page
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Track session engagement (returns engagement score)
export function calculateEngagement(sessionData) {
    let score = 0;

    if (sessionData.sessionCount > 1) score += 10; // Returning user
    if (sessionData.sessionCount > 5) score += 10; // Loyal user
    if (sessionData.totalTimeSpentSeconds > 300) score += 15; // 5+ min
    if (sessionData.totalTimeSpentSeconds > 900) score += 15; // 15+ min
    if (sessionData.gamesCompleted > 0) score += 20;
    if (sessionData.totalPurchases > 0) score += 20;
    if (sessionData.totalMultiplayerGames > 0) score += 10;

    return Math.min(100, score);
}

// Export all analytics functions
export default {
    getDeviceInfo,
    getTrafficSource,
    getIPAddress,
    getIPAndGeoData,
    checkIPBan,
    banIP,
    unbanIP,
    getBannedIPs,
    giveDirhams,
    generate6DigitUserId,
    getUserShortId,
    trackUserSession,
    trackGamePlay,
    trackMultiplayerGame,
    trackPageView,
    trackPurchase,
    trackTimeSpent,
    trackError,
    trackFeatureUsage,
    trackQuestionAnswer,
    trackClick,
    trackGameComplete,
    trackPerformance,
    detectRageClick,
    trackScrollDepth,
    saveScrollDepth,
    calculateEngagement
};
