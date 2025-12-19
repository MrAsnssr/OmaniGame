// Analytics service for tracking user activity and collecting data
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';

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

        // Session data
        const sessionData = {
            displayName: displayName || existingData.displayName || null,
            email: email || existingData.email || null,

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
            analyticsVersion: 1,
            updatedAt: now.toISOString()
        };

        await setDoc(userRef, sessionData, { merge: true });

        // Also track session in a subcollection for history
        const sessionRef = doc(db, 'users', userId, 'sessions', `${now.getTime()}`);
        await setDoc(sessionRef, {
            startedAt: now.toISOString(),
            device: deviceInfo,
            trafficSource,
            userAgent: deviceInfo.userAgent
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

// Export all analytics functions
export default {
    getDeviceInfo,
    getTrafficSource,
    trackUserSession,
    trackGamePlay,
    trackMultiplayerGame,
    trackPageView,
    trackPurchase,
    trackTimeSpent,
    trackError,
    trackFeatureUsage
};
